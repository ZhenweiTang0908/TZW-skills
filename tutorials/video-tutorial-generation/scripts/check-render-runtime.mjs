#!/usr/bin/env node
import { resolve } from 'node:path';
import { parseArgs, run, writeJson } from './lib.mjs';

const args = parseArgs(process.argv.slice(2));
const report = { status: 'ok', checks: {}, errors: [] };
let browser;
try {
  for (const command of ['ffmpeg', 'ffprobe']) {
    await run(command, ['-version']);
    report.checks[command] = 'available';
  }
  process.env.PLAYWRIGHT_BROWSERS_PATH ??= '0';
  const { chromium } = await import('playwright');
  // This isolated process tests the renderer only; it never opens workflow pages or a user profile.
  browser = await chromium.launch({ headless: true, timeout: 15000, ...(args['browser-executable'] ? { executablePath: args['browser-executable'] } : {}) });
  report.checks.chromium = { launched: true, version: browser.version() };
} catch (error) {
  report.status = 'error';
  report.errors.push({ code: 'render-runtime-unavailable', message: error.message, recovery: 'If Chromium exits with SIGABRT in a sandbox, retry this same technical check through the host authorization flow before changing dependencies or generating paid narration.' });
} finally { if (browser) await browser.close(); }
if (args.output) await writeJson(resolve(args.output), report);
console.log(JSON.stringify(report, null, 2));
if (report.errors.length) process.exitCode = 1;
