#!/usr/bin/env node
import { access, cp, mkdir, readFile, writeFile } from 'node:fs/promises';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { hash, parseArgs, readJson, run, writeJson } from './lib.mjs';

const args = parseArgs(process.argv.slice(2));
if (!args._[0]) {
  console.error('Usage: node render-tutorial.mjs <storyboard.resolved.json> [--output dir] [--theme theme.json] [--max-width 1920] [--concurrency 1] [--force]');
  process.exit(2);
}

const storyboardPath = resolve(args._[0]);
const output = resolve(args.output ?? dirname(storyboardPath));
const storyboard = JSON.parse(await readFile(storyboardPath, 'utf8'));
const manifestPath = join(output, 'tutorial-manifest.json');
const manifest = JSON.parse(await readFile(manifestPath, 'utf8'));
if (storyboard.scenes.length !== manifest.scenes.length) throw new Error('Storyboard and manifest scene counts differ');

const presentation = storyboard.presentation ?? 'continuous';
const defaults = {
  accent: '#0f766e',
  captionPosition: 'bottom',
  transition: presentation === 'continuous' ? 'cut' : 'crossfade',
  highlightDim: presentation === 'continuous' ? 0 : 0.18,
};
const external = args.theme ? await readJson(resolve(args.theme), {}) : {};
const theme = { ...defaults, ...storyboard.theme, ...external };
const skillRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const rendererHash = hash(await readFile(join(skillRoot, 'renderer', 'tutorial.jsx')));

const inputHashes = [];
for (const scene of storyboard.scenes) inputHashes.push(hash(await readFile(join(output, scene.screenshot))));
for (const scene of manifest.scenes) inputHashes.push(hash(await readFile(join(output, scene.audio))));
const renderScenes = manifest.scenes.map((scene) => ({
  ...scene,
  segments: (scene.segments ?? []).map(({ cacheHit, ...segment }) => segment),
}));
const maxWidth = Number(args['max-width'] ?? 1920);
const renderScale = Math.min(1, maxWidth / storyboard.viewport.width);
const concurrency = Number(args.concurrency ?? 1);
const renderKey = hash({ v: 11, renderScale, concurrency, rendererHash, presentation, storyboard, manifest: renderScenes, theme, inputHashes });
const renderCachePath = join(output, '.cache', 'render.json');
const video = join(output, 'tutorial.mp4');
const previous = await readJson(renderCachePath, {});
if (!args.force && previous.key === renderKey && await exists(video) && await exists(join(output, 'tutorial-poster.png'))) {
  await saveVideoManifest(true);
  console.log('Reused the rendered video from the cache');
  process.exit(0);
}

const work = join(output, '.remotion');
const publicDir = join(work, 'public');
await mkdir(publicDir, { recursive: true });
await cp(join(output, 'screenshots'), join(publicDir, 'screenshots'), { recursive: true, force: true });
await cp(join(output, 'audio'), join(publicDir, 'audio'), { recursive: true, force: true });
await cp(join(skillRoot, 'renderer', 'tutorial.jsx'), join(work, 'tutorial.jsx'), { force: true });
await writeFile(join(publicDir, 'data.json'), JSON.stringify({ storyboard, manifest, theme }));

const remotion = args['remotion-bin'] ?? process.env.REMOTION_BIN ?? await findRemotion(skillRoot, process.cwd(), dirname(output), output);
process.env.PLAYWRIGHT_BROWSERS_PATH ??= '0';
let browserExecutable = args['browser-executable'];
if (!browserExecutable) {
  try { const { chromium } = await import('playwright'); browserExecutable = chromium.executablePath(); }
  catch { throw new Error('The skill-local Playwright runtime is unavailable; run npm ci and npm run setup.'); }
}

await run(remotion, [
  'render',
  join(work, 'tutorial.jsx'),
  'Tutorial',
  video,
  '--codec=h264',
  '--pixel-format=yuv420p',
  `--public-dir=${publicDir}`,
  `--browser-executable=${browserExecutable}`,
  // Chrome intermittently returns blank or mis-tiled captures for very large pages (e.g. 2880-wide Retina
  // captures) when several frames render in parallel; each shows up as a one-frame flash. Rendering at most
  // 1920 wide with one worker removes it, and inspect-output.mjs scans every frame to prove it.
  `--scale=${renderScale}`,
  `--concurrency=${concurrency}`,
], { inherit: true });

await run('ffmpeg', ['-v', 'error', '-i', video, '-frames:v', '1', '-y', join(output, 'tutorial-poster.png')]);
await saveVideoManifest(false);
await writeJson(renderCachePath, { key: renderKey, createdAt: new Date().toISOString() });
console.log(`Rendered the ${presentation} tutorial video into ${output}`);

async function saveVideoManifest(renderHit) {
  const probe = JSON.parse(await run('ffprobe', ['-v', 'error', '-show_entries', 'stream=codec_name,width,height:format=duration', '-of', 'json', video]));
  const videoStream = probe.streams?.find((stream) => stream.width);
  manifest.video = { file: 'tutorial.mp4', codec: videoStream?.codec_name, width: videoStream?.width, height: videoStream?.height, duration: Number(probe.format?.duration) };
  manifest.cache = { ...manifest.cache, renderHit };
  manifest.presentation = presentation;
  manifest.frame = storyboard.frame ?? 'browser';
  manifest.capture = storyboard.capture ?? null;
  manifest.theme = theme;
  await writeJson(manifestPath, manifest);
}

async function findRemotion(...roots) {
  for (const root of roots) {
    const file = join(root, 'node_modules', '.bin', 'remotion');
    try { await access(file); return file; } catch {}
  }
  throw new Error('Remotion CLI not found. Run npm ci in the skill directory.');
}

async function exists(path) {
  try { await access(path); return true; } catch { return false; }
}
