#!/usr/bin/env node
import { dirname, resolve } from 'node:path';
import { stat } from 'node:fs/promises';
import { loadAndValidate } from './validate-storyboard.mjs';
import { parseArgs, writeJson } from './lib.mjs';
import { pngDimensions } from './image-dimensions.mjs';

const args = parseArgs(process.argv.slice(2));
if (!args._[0]) { console.error('Usage: node doctor-storyboard.mjs <storyboard.json> [--stage preflight|captured] [--output report.json]'); process.exit(2); }
const stage = args.stage ?? 'preflight';
if (!['preflight', 'captured'].includes(stage)) throw new Error('stage must be preflight or captured');
const storyboardPath = resolve(args._[0]);
const storyboard = await loadAndValidate(storyboardPath);
const warnings = [], errors = [];
const presentation = storyboard.presentation ?? 'continuous';
const browserFrame = (storyboard.frame ?? 'browser') === 'browser';
let captureReady = true, verifiedAssets = 0;
function pending(code, path, message) {
  captureReady = false;
  (stage === 'captured' ? errors : warnings).push({ code, path, message });
}
if (presentation === 'continuous' && browserFrame && storyboard.viewport.width < 1280) {
  warnings.push({ code: 'narrow-browser-frame', path: 'viewport.width', message: 'Use a full browser window width, for example 1440px.' });
}
for (const scene of storyboard.scenes) {
  if (browserFrame) {
    if (!scene.asset) pending('browser-scene-missing-asset', scene.id, 'Provide a direct window capture before generation.');
    else {
      const file = resolve(dirname(storyboardPath), scene.asset);
      const info = await stat(file).catch(error => { if (error.code === 'ENOENT') return null; throw error; });
      if (!info) pending('asset-file-missing', scene.id, 'The declared window capture has not been created.');
      else {
        try {
          const actual = await pngDimensions(file);
          if (actual.width !== storyboard.viewport.width || actual.height !== storyboard.viewport.height) {
            errors.push({ code: 'asset-size-mismatch', path: scene.id, expected: storyboard.viewport, actual });
            captureReady = false;
          } else verifiedAssets++;
        } catch (error) {
          errors.push({ code: 'invalid-window-asset', path: scene.id, message: error.message });
          captureReady = false;
        }
      }
    }
    if (presentation === 'continuous' && !scene.task) pending('missing-task-label', scene.id, 'Set the short current-task phrase.');
    for (const [index, action] of scene.actions.entries()) {
      if (action.type === 'wait') continue;
      const path = `${scene.id}.actions[${index}]`;
      if (!Number.isFinite(action.x) || !Number.isFinite(action.y)) pending('unresolved-window-action', path, 'Calibrate this action against the captured whole-window image.');
      else if (action.x < 0 || action.y < 0 || action.x >= storyboard.viewport.width || action.y >= storyboard.viewport.height) pending('action-outside-window', path, 'The pointer target must be inside the full window capture.');
    }
  }
  for (const [index, action] of scene.actions.entries()) {
    if (!action.target) continue;
    const path = `${scene.id}.actions[${index}].target`;
    if (/nth-(?:child|of-type)|:(?:first|last)-child/.test(action.target)) warnings.push({ code: 'fragile-positional-selector', path, selector: action.target });
    if (/^\.[A-Za-z0-9_-]+$/.test(action.target)) warnings.push({ code: 'class-only-selector', path, selector: action.target });
    if (/:has-text\(|text=|getByText/.test(action.target)) warnings.push({ code: 'locale-sensitive-selector', path, selector: action.target });
    if (!/data-tutorial|aria-label|role=|#[A-Za-z]/.test(action.target)) warnings.push({ code: 'prefer-stable-attribute', path, selector: action.target });
  }
}
const report = { stage, status: errors.length ? 'error' : warnings.length ? 'warning' : 'ok', captureReady, verifiedAssets, warnings, errors };
if (args.output) await writeJson(resolve(args.output), report);
console.log(JSON.stringify(report, null, 2));
if (errors.length) process.exitCode = 1;
