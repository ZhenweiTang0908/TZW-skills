#!/usr/bin/env node
import { randomUUID } from 'node:crypto';
import { resolve } from 'node:path';
import { spawnSync } from 'node:child_process';
import { parseArgs } from './lib.mjs';

const args = parseArgs(process.argv.slice(2));
const app = String(args.app ?? 'Google Chrome');
const url = String(args.url ?? 'about:blank');
const timeoutMs = Number(args.timeout ?? 12000);
const dryRun = Boolean(args['dry-run']);
const captureScript = resolve(new URL('./capture-window.mjs', import.meta.url).pathname);

if (process.platform !== 'darwin') fail('New-window launch is currently implemented for macOS only.');
if (dryRun) {
  console.log(JSON.stringify({ command: 'open', args: ['-g', '-n', '-a', app, '--args', '--new-window', url], restoreFocus: true, dryRun: true }, null, 2));
  process.exit(0);
}

const marker = `Codex Tutorial ${randomUUID()}`;
const previousApp = frontmostApp();
const before = await listWindows(app);
const knownIds = new Set(before.map((item) => item.windowId));

const opened = spawnSync('open', ['-g', '-n', '-a', app, '--args', '--new-window', `data:text/html,<title>${marker}</title>`], { encoding: 'utf8' });
if (opened.error) fail(`Cannot open Chrome: ${opened.error.message}`);
if (opened.status !== 0) fail(`Chrome window creation failed: ${(opened.stderr || '').trim()}`);
restoreFocus(previousApp);

const deadline = Date.now() + timeoutMs;
let created = null;
while (Date.now() < deadline) {
  const current = await listWindows(app);
  const candidates = current.filter((item) => !knownIds.has(item.windowId) && item.onscreen && item.width >= 800 && item.height >= 500);
  if (candidates.length) {
    candidates.sort((a, b) => (b.width * b.height) - (a.width * a.height));
    created = candidates[0];
    break;
  }
  await new Promise((resolveDelay) => setTimeout(resolveDelay, 300));
}
if (!created) fail(`No new ${app} window appeared. If Chrome was closed, open it once and retry; do not reuse the user's existing work window.`);

let chromeWindowId = null;
while (Date.now() < deadline) {
  const match = chromeWindows().find((item) => item.title.includes(marker));
  if (match) { chromeWindowId = match.id; break; }
  await new Promise((resolveDelay) => setTimeout(resolveDelay, 150));
}
if (!chromeWindowId) {
  fail('The new Chrome window did not expose its run marker; it was left open because its Chrome window ID could not be verified.');
}
if (url !== 'about:blank') {
  const setUrl = runAppleScript(`
on run argv
  set targetId to (item 1 of argv) as integer
  set targetUrl to item 2 of argv
  tell application "Google Chrome"
    set URL of active tab of (first window whose id is targetId) to targetUrl
  end tell
end run
`, [String(chromeWindowId), url]);
  if (setUrl.status !== 0) {
    closeChromeWindow(chromeWindowId);
    restoreFocus(previousApp);
    fail(`Could not load the requested URL in the run-owned window: ${(setUrl.stderr || '').trim()}`);
  }
}
restoreFocus(previousApp);

console.log(JSON.stringify({ windowId: created.windowId, chromeWindowId, app, title: created.title, url, logicalWidth: created.width, logicalHeight: created.height, activated: false, restoredFrontmost: previousApp, next: 'Use capture-window.mjs to obtain the pixel dimensions for storyboard.viewport.' }, null, 2));

function listWindows(targetApp) {
  const result = spawnSync(process.execPath, [captureScript, 'list', '--app', targetApp, '--json'], { encoding: 'utf8' });
  if (result.error) fail(`Cannot enumerate windows: ${result.error.message}`);
  if (result.status !== 0) fail((result.stderr || result.stdout || 'Window enumeration failed').trim());
  try { return JSON.parse(result.stdout); } catch { fail(`Cannot parse window list: ${result.stdout.slice(0, 300)}`); }
}

function chromeWindows() {
  const result = runAppleScript('tell application "Google Chrome"\nset out to ""\nrepeat with w in windows\nset out to out & (id of w as text) & "|" & (name of w) & linefeed\nend repeat\nreturn out\nend tell');
  if (result.status !== 0) return [];
  return String(result.stdout).trim().split(/\r?\n/).filter(Boolean).map((entry) => {
    const [id, ...name] = entry.split('|');
    return { id: Number(id), title: name.join('|') };
  }).filter((item) => Number.isInteger(item.id));
}

function frontmostApp() {
  const result = runAppleScript('tell application "System Events" to get name of first application process whose frontmost is true');
  return result.status === 0 ? String(result.stdout).trim() : null;
}

function restoreFocus(name) {
  if (!name || name === 'Google Chrome') return;
  spawnSync('open', ['-a', name], { encoding: 'utf8' });
}

function closeChromeWindow(id) {
  runAppleScript(`
on run argv
  set targetId to (item 1 of argv) as integer
  tell application "Google Chrome"
    try
      close (first window whose id is targetId)
    end try
  end tell
end run
`, [String(id)]);
}

function runAppleScript(script, values = []) {
  return spawnSync('osascript', ['-e', script, ...values], { encoding: 'utf8' });
}

function fail(message) {
  console.error(message);
  process.exit(1);
}
