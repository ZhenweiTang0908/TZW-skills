#!/usr/bin/env node
import { mkdirSync } from 'node:fs';
import { mkdir, stat } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { spawnSync } from 'node:child_process';
import { parseArgs } from './lib.mjs';

const args = parseArgs(process.argv.slice(2));
const command = args._[0];

if (process.platform !== 'darwin') {
  fail('Background window capture is currently implemented for macOS only.');
}

if (!['list', 'capture'].includes(command)) {
  fail('Usage: node capture-window.mjs list [--app "Google Chrome"] [--json]\n       node capture-window.mjs capture --output shot.png (--window-id 123 | --app "Google Chrome" [--title "aiFind"]) [--shadow] [--json]');
}

if (command === 'list' && !args.app && !args.all) fail('list requires --app to avoid exposing unrelated window titles; pass --all only when a full local inventory is explicitly needed.');
const windows = command === 'list' || args['window-id'] === undefined ? await listWindows() : [];
if (command === 'list') {
  const filtered = filterWindows(windows, args);
  if (args.json) console.log(JSON.stringify(filtered, null, 2));
  else if (!filtered.length) console.log('No matching on-screen windows.');
  else for (const item of filtered) {
    console.log(`${item.windowId}\t${item.owner}\t${item.title || '(untitled)'}\t${item.width}x${item.height}\t${item.onscreen ? 'on-screen' : 'offscreen'}`);
  }
  process.exit(0);
}

const output = args.output && resolve(args.output);
if (!output) fail('capture requires --output <path.png>');
await mkdir(dirname(output), { recursive: true });

let target;
if (args['window-id'] !== undefined) {
  const windowId = Number(args['window-id']);
  if (!Number.isInteger(windowId) || windowId <= 0) fail('--window-id must be a positive integer');
  target = windows.find((item) => item.windowId === windowId) ?? { windowId, owner: '', title: '', onscreen: true };
} else {
  const matches = filterWindows(windows, args);
  if (!matches.length) fail('No matching on-screen window. Run the list command and pass --window-id if the title is ambiguous.');
  if (matches.length > 1) fail(`Window selector is ambiguous (${matches.map((item) => `${item.windowId}:${item.title || item.owner}`).join(', ')}). Pass --window-id.`);
  target = matches[0];
}
if (!target.onscreen) fail(`Window ${target.windowId} is not on-screen. macOS cannot reliably capture a minimized or off-screen window.`);

const captureArgs = ['-x'];
if (!args.shadow) captureArgs.push('-o');
captureArgs.push('-l', String(target.windowId), output);
const capture = spawnSync('screencapture', captureArgs, { encoding: 'utf8' });
if (capture.error) fail(`screencapture is unavailable: ${capture.error.message}`);
if (capture.status !== 0) fail(`Background capture failed. Check execution sandbox access first, then macOS Screen Recording permission and the target window state. ${capture.stderr || ''}`.trim());

const info = await stat(output).catch(() => null);
if (!info?.size) fail('Background capture produced no file or an empty file.');
const dimensions = imageDimensions(output);
const result = { output, windowId: target.windowId, owner: target.owner, title: target.title, width: dimensions.width, height: dimensions.height, includeShadow: Boolean(args.shadow), activated: false };
if (args.json) console.log(JSON.stringify(result, null, 2));
else console.log(`Captured window ${target.windowId} (${result.width}x${result.height}) without activating it: ${output}`);

async function listWindows() {
  const cache = process.env.TUTORIAL_SWIFT_CACHE || '/tmp/tutorial-video-swift-cache';
  mkdirSync(cache, { recursive: true });
  const script = `
import CoreGraphics
import Darwin
import Foundation
if !CGPreflightScreenCaptureAccess() {
  FileHandle.standardError.write(Data("Screen capture access is unavailable in this execution context. A sandbox can cause this result even when macOS Screen Recording access is granted. Retry this read-only command through the host authorization flow before concluding that macOS permission is denied.\\n".utf8))
  exit(2)
}
let options: CGWindowListOption = [.optionAll, .excludeDesktopElements]
let candidates = CGWindowListCopyWindowInfo(options, kCGNullWindowID) as? [[String: Any]] ?? []
let rows: [[String: Any]] = candidates.compactMap { item in
  guard let layer = item[kCGWindowLayer as String] as? Int, layer == 0 else { return nil }
  guard let windowId = item[kCGWindowNumber as String] as? Int else { return nil }
  guard let bounds = item[kCGWindowBounds as String] as? [String: CGFloat] else { return nil }
  let owner = item[kCGWindowOwnerName as String] as? String ?? ""
  let title = item[kCGWindowName as String] as? String ?? ""
  let alpha = item[kCGWindowAlpha as String] as? Double ?? 1
  let onscreen = item[kCGWindowIsOnscreen as String] as? Bool ?? false
  return [
    "windowId": windowId,
    "owner": owner,
    "title": title,
    "width": Int(bounds["Width"] ?? 0),
    "height": Int(bounds["Height"] ?? 0),
    "x": Int(bounds["X"] ?? 0),
    "y": Int(bounds["Y"] ?? 0),
    "alpha": alpha,
    "onscreen": onscreen
  ]
}
let data = try JSONSerialization.data(withJSONObject: rows, options: [])
print(String(data: data, encoding: .utf8)!)
`;
  const result = spawnSync('swift', ['-module-cache-path', cache, '-e', script], { encoding: 'utf8', maxBuffer: 8 * 1024 * 1024 });
  if (result.error) fail(`Cannot enumerate macOS windows: ${result.error.message}`);
  if (result.status !== 0) fail(`Swift window enumeration failed: ${(result.stderr || '').trim()}`);
  try { return JSON.parse(result.stdout); } catch { fail(`Could not parse window list: ${result.stdout.slice(0, 300)}`); }
}

function filterWindows(items, options) {
  const app = typeof options.app === 'string' ? options.app.toLocaleLowerCase() : null;
  const title = typeof options.title === 'string' ? options.title.toLocaleLowerCase() : null;
  return items.filter((item) => item.alpha > 0 && item.width > 0 && item.height > 0)
    .filter((item) => !app || item.owner.toLocaleLowerCase() === app)
    .filter((item) => !title || item.title.toLocaleLowerCase().includes(title));
}

function imageDimensions(file) {
  const result = spawnSync('sips', ['-g', 'pixelWidth', '-g', 'pixelHeight', file], { encoding: 'utf8' });
  const width = Number(result.stdout.match(/pixelWidth: (\d+)/)?.[1]);
  const height = Number(result.stdout.match(/pixelHeight: (\d+)/)?.[1]);
  if (!(width > 0 && height > 0)) fail(`Could not read captured image dimensions: ${file}`);
  return { width, height };
}

function fail(message) {
  console.error(message);
  process.exit(1);
}
