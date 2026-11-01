import assert from 'node:assert/strict';
import { mkdtemp, writeFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { spawnSync } from 'node:child_process';
import test from 'node:test';

const doctor = new URL('../scripts/doctor-storyboard.mjs', import.meta.url).pathname;
const pixel = Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+aD1sAAAAASUVORK5CYII=', 'base64');

async function inspect(stage, modify = () => {}, image = null) {
  const dir = await mkdtemp(join(tmpdir(), 'tutorial-doctor-'));
  try {
    const storyboard = {
      version: 2, title: '检查', language: 'zh', presentation: 'continuous', frame: 'browser',
      capture: { mode: 'background-window', windowPolicy: 'new-window', app: 'Google Chrome' },
      viewport: { width: 1, height: 1 },
      scenes: [{ id: 'wait', route: 'https://example.test', asset: 'shot.png', task: '等待读取', narration: { zh: '等待读取完成。' }, actions: [] }],
    };
    modify(storyboard);
    await writeFile(join(dir, 'storyboard.json'), JSON.stringify(storyboard));
    if (image) await writeFile(join(dir, 'shot.png'), image);
    const result = spawnSync(process.execPath, [doctor, join(dir, 'storyboard.json'), '--stage', stage], { encoding: 'utf8' });
    return { exit: result.status, report: JSON.parse(result.stdout) };
  } finally { await rm(dir, { recursive: true, force: true }); }
}

test('preflight reports nonexistent planned assets as not ready', async () => {
  const { exit, report } = await inspect('preflight');
  assert.equal(exit, 0);
  assert.equal(report.captureReady, false);
  assert.ok(report.warnings.some(item => item.code === 'asset-file-missing'));
});

test('captured stage rejects missing files before paid generation', async () => {
  const { exit, report } = await inspect('captured');
  assert.equal(exit, 1);
  assert.ok(report.errors.some(item => item.code === 'asset-file-missing'));
});

test('captured stage rejects mismatched image dimensions', async () => {
  const { exit, report } = await inspect('captured', data => { data.viewport.width = 2; }, pixel);
  assert.equal(exit, 1);
  assert.ok(report.errors.some(item => item.code === 'asset-size-mismatch'));
});

test('captured stage rejects unresolved and out-of-window click points', async () => {
  const { exit, report } = await inspect('captured', data => {
    data.scenes[0].actions = [{ type: 'click', target: '#download' }, { type: 'click', x: 2, y: 0 }];
  }, pixel);
  assert.equal(exit, 1);
  assert.ok(report.errors.some(item => item.code === 'unresolved-window-action'));
  assert.ok(report.errors.some(item => item.code === 'action-outside-window'));
});

test('parked cursor and wait actions are valid after capture', async () => {
  const { exit, report } = await inspect('captured', data => { data.scenes[0].actions = [{ type: 'wait', duration: 1 }]; }, pixel);
  assert.equal(exit, 0);
  assert.equal(report.captureReady, true);
  assert.equal(report.warnings.some(item => item.code === 'continuous-scene-without-interaction'), false);
});

test('an existing non-PNG file is not accepted as a window capture', async () => {
  const { exit, report } = await inspect('captured', () => {}, Buffer.from('not a PNG'));
  assert.equal(exit, 1);
  assert.ok(report.errors.some(item => item.code === 'invalid-window-asset'));
});

test('capture stage accepts a wait action without pointer coordinates', async () => {
  const dir = await mkdtemp(join(tmpdir(), 'tutorial-capture-'));
  try {
    const image = join(dir, 'shot.png');
    const generated = spawnSync('ffmpeg', ['-v', 'error', '-f', 'lavfi', '-i', 'color=c=red:s=32x32,drawbox=x=0:y=0:w=16:h=16:color=white:t=fill', '-frames:v', '1', '-update', '1', '-y', image], { encoding: 'utf8' });
    assert.equal(generated.status, 0, generated.stderr);
    const data = { version: 2, title: '检查', language: 'zh', frame: 'browser', capture: { mode: 'background-window', windowPolicy: 'new-window', app: 'Google Chrome' }, viewport: { width: 32, height: 32 }, scenes: [{ id: 'wait', route: 'https://example.test', asset: 'shot.png', task: '等待', narration: { zh: '等待。' }, actions: [{ type: 'wait', duration: 1 }] }] };
    await writeFile(join(dir, 'storyboard.json'), JSON.stringify(data));
    const result = spawnSync(process.execPath, [new URL('../scripts/capture-scenes.mjs', import.meta.url).pathname, join(dir, 'storyboard.json'), '--output', join(dir, 'run')], { encoding: 'utf8' });
    assert.equal(result.status, 0, result.stderr);
  } finally { await rm(dir, { recursive: true, force: true }); }
});
