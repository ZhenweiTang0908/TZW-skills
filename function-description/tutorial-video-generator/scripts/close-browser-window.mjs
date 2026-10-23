#!/usr/bin/env node
import { spawnSync } from 'node:child_process';
import { parseArgs } from './lib.mjs';

const args = parseArgs(process.argv.slice(2));
const chromeWindowId = Number(args['chrome-window-id']);
if (!Number.isInteger(chromeWindowId) || chromeWindowId <= 0) {
  fail('Usage: node close-browser-window.mjs --chrome-window-id <id> [--json]');
}
if (process.platform !== 'darwin') fail('Background Chrome window closure is currently implemented for macOS only.');
const previousApp = frontmostApp();

const script = `
on run argv
  set targetId to (item 1 of argv) as integer
  tell application "Google Chrome"
    try
      set targetWindow to first window whose id is targetId
      close targetWindow
      return "closed"
    on error
      return "missing"
    end try
  end tell
end run
`;
const result = spawnSync('osascript', ['-e', script, String(chromeWindowId)], { encoding: 'utf8' });
if (result.error) fail(`Cannot close Chrome window: ${result.error.message}`);
if (result.status !== 0) fail(`Chrome window closure failed: ${(result.stderr || '').trim()}`);
const status = result.stdout.trim();
if (status !== 'closed') fail(`Run-owned Chrome window ${chromeWindowId} was not found; do not close another window.`);
restoreFocus(previousApp);
if (args.json) console.log(JSON.stringify({ chromeWindowId, closed: true, activated: false, restoredFrontmost: previousApp }, null, 2));
else console.log(`Closed run-owned Chrome window ${chromeWindowId}.`);

function frontmostApp() {
  const query = spawnSync('osascript', ['-e', 'tell application "System Events" to get name of first application process whose frontmost is true'], { encoding: 'utf8' });
  return query.status === 0 ? query.stdout.trim() : null;
}

function restoreFocus(name) {
  if (!name || name === 'Google Chrome') return;
  spawnSync('open', ['-a', name], { encoding: 'utf8' });
}

function fail(message) {
  console.error(message);
  process.exit(1);
}
