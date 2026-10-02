#!/usr/bin/env node
import { resolve } from 'node:path';
import { loadAndValidate } from './validate-storyboard.mjs';
import { parseArgs, writeJson } from './lib.mjs';

const args = parseArgs(process.argv.slice(2));
if (!args._[0]) { console.error('Usage: node doctor-storyboard.mjs <storyboard.json> [--output quality-report.json]'); process.exit(2); }
const storyboard = await loadAndValidate(resolve(args._[0]));
const warnings = [];
for (const scene of storyboard.scenes) for (const [index, action] of scene.actions.entries()) {
  if (!action.target) continue;
  const path = `${scene.id}.actions[${index}].target`;
  if (/nth-(?:child|of-type)|:(?:first|last)-child/.test(action.target)) warnings.push({ code: 'fragile-positional-selector', path, selector: action.target });
  if (/^\.[A-Za-z0-9_-]+$/.test(action.target)) warnings.push({ code: 'class-only-selector', path, selector: action.target });
  if (/:has-text\(|text=|getByText/.test(action.target)) warnings.push({ code: 'locale-sensitive-selector', path, selector: action.target });
  if (!/data-tutorial|aria-label|role=|#[A-Za-z]/.test(action.target)) warnings.push({ code: 'prefer-stable-attribute', path, selector: action.target });
}
const report = { status: warnings.length ? 'warning' : 'ok', warnings, errors: [] };
if (args.output) await writeJson(resolve(args.output), report);
console.log(JSON.stringify(report, null, 2));
