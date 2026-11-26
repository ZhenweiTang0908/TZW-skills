import assert from 'node:assert/strict';
import { mkdtemp, writeFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { spawnSync } from 'node:child_process';
import test from 'node:test';
import { validateStoryboard } from '../scripts/validate-storyboard.mjs';

const doctor = new URL('../scripts/doctor-storyboard.mjs', import.meta.url).pathname;
const pixel = Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+aD1sAAAAASUVORK5CYII=', 'base64');

function baseStoryboard(overrides = {}) {
  return {
    version: 2,
    title: 'Dynamic demo',
    language: 'en',
    presentation: 'continuous',
    frame: 'page',
    viewport: { width: 1280, height: 720, deviceScaleFactor: 1 },
    scenes: [
      {
        id: 'open-menu',
        route: '/contacts',
        narration: {
          en: [
            { id: 'intro', text: 'There are three ways to add contacts.' },
            { id: 'csv', text: 'Click import from CSV.' },
          ],
        },
        actions: [
          { id: 'open-btn', type: 'click', target: '[data-tutorial="new-contact"]', syncWith: 'csv', zoom: 2.1 },
        ],
      },
    ],
    ...overrides,
  };
}

test('validateStoryboard accepts camera, stage, taskLabel, pill captions, and zoom actions', () => {
  const data = baseStoryboard({
    taskLabel: false,
    camera: { enabled: true, mode: 'auto', defaultZoom: 1.9, minZoom: 1, maxZoom: 3, transitionDuration: 0.65, motionBlur: 0.25, clampToViewport: true },
    stage: { enabled: true, padding: 48, borderRadius: 18, shadow: true, background: 'studio-light', blobColor: '#3b6ef6' },
    theme: { accent: '#3b6ef6', captionStyle: 'pill', captionBg: 'rgba(59,110,246,0.9)' },
    scenes: [
      {
        ...baseStoryboard().scenes[0],
        camera: [
          { syncWith: 'intro', zoom: 1.0, duration: 0.5 },
          { actionId: 'open-btn', offset: -0.1, target: '[data-tutorial="new-contact"]', zoom: 2.2, easing: 'smooth' },
        ],
        actions: [
          { id: 'open-btn', type: 'click', target: '[data-tutorial="new-contact"]', syncWith: 'csv' },
          { type: 'zoom', zoom: 1.0, syncWith: 'csv' },
        ],
      },
    ],
  });
  assert.deepEqual(validateStoryboard(data), []);
});

test('validateStoryboard rejects invalid camera, stage, and captionStyle values', () => {
  const data = baseStoryboard({
    taskLabel: 'no',
    camera: { mode: 'orbit', defaultZoom: 9, motionBlur: 2 },
    stage: { padding: -5 },
    theme: { captionStyle: 'floating' },
  });
  const errors = validateStoryboard(data);
  assert.ok(errors.some((e) => e.startsWith('taskLabel:')));
  assert.ok(errors.some((e) => e.startsWith('camera.mode:')));
  assert.ok(errors.some((e) => e.startsWith('camera.defaultZoom:')));
  assert.ok(errors.some((e) => e.startsWith('camera.motionBlur:')));
  assert.ok(errors.some((e) => e.startsWith('stage.padding:')));
  assert.ok(errors.some((e) => e.startsWith('theme.captionStyle:')));
});

test('doctor accepts taskLabel=false and zoom=1 reset in browser-framed storyboards', async () => {
  const dir = await mkdtemp(join(tmpdir(), 'tutorial-camera-doctor-'));
  try {
    const storyboard = {
      version: 2,
      title: 'Zoomed browser demo',
      language: 'en',
      presentation: 'continuous',
      frame: 'browser',
      taskLabel: false,
      camera: { enabled: true, mode: 'manual' },
      capture: { mode: 'background-window', windowPolicy: 'new-window', app: 'Google Chrome' },
      viewport: { width: 1, height: 1 },
      scenes: [
        {
          id: 'zoom-reset',
          route: 'https://example.test',
          asset: 'shot.png',
          narration: { en: [{ id: 's1', text: 'Overview.' }] },
          camera: [{ syncWith: 's1', zoom: 1 }],
          actions: [{ type: 'zoom', zoom: 1, syncWith: 's1' }],
        },
      ],
    };
    await writeFile(join(dir, 'storyboard.json'), JSON.stringify(storyboard));
    await writeFile(join(dir, 'shot.png'), pixel);
    const result = spawnSync(process.execPath, [doctor, join(dir, 'storyboard.json'), '--stage', 'captured'], { encoding: 'utf8' });
    const report = JSON.parse(result.stdout);
    assert.equal(result.status, 0, result.stdout);
    assert.equal(report.captureReady, true);
  } finally {
    await rm(dir, { recursive: true, force: true });
  }
});
