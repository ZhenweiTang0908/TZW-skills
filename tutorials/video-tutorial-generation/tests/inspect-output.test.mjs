import assert from 'node:assert/strict';
import { mkdtemp, writeFile, copyFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { spawnSync } from 'node:child_process';
import test from 'node:test';

async function inspect({ fps = 30, audio = true } = {}) {
  const dir = await mkdtemp(join(tmpdir(), 'tutorial-inspect-'));
  const command = (name, args) => {
    const result = spawnSync(name, args, { encoding: 'utf8' });
    assert.equal(result.status, 0, result.stderr);
  };
  try {
    command('ffmpeg', ['-v', 'error', '-f', 'lavfi', '-i', `testsrc2=size=32x32:rate=${fps}`, ...(audio ? ['-f', 'lavfi', '-i', 'anullsrc=r=24000:cl=mono'] : []), '-t', '1.2', '-c:v', 'libx264', '-pix_fmt', 'yuv420p', ...(audio ? ['-c:a', 'aac'] : ['-an']), '-y', join(dir, 'tutorial.mp4')]);
    command('ffmpeg', ['-v', 'error', '-f', 'lavfi', '-i', 'anullsrc=r=24000:cl=mono', '-t', '1.2', '-y', join(dir, 'audio.wav')]);
    command('ffmpeg', ['-v', 'error', '-i', join(dir, 'tutorial.mp4'), '-frames:v', '1', '-update', '1', '-y', join(dir, 'shot.png')]);
    await copyFile(join(dir, 'shot.png'), join(dir, 'tutorial-poster.png'));
    await writeFile(join(dir, 'tutorial-manifest.json'), JSON.stringify({ frame: 'page', video: { width: 32, height: 32 }, scenes: [{ id: 'one', start: 0, end: 1.2, duration: 1.2, audio: 'audio.wav' }] }));
    await writeFile(join(dir, 'storyboard.resolved.json'), JSON.stringify({ fps: 30, viewport: { width: 32, height: 32 }, scenes: [{ id: 'one', screenshot: 'shot.png' }] }));
    await writeFile(join(dir, 'quality-report.json'), JSON.stringify({ errors: [] }));
    await writeFile(join(dir, 'tutorial.vtt'), 'WEBVTT\n\n00:00:00.000 --> 00:00:01.200\n自检。\n');
    return spawnSync(process.execPath, [new URL('../scripts/inspect-output.mjs', import.meta.url).pathname, dir], { encoding: 'utf8' });
  } finally { await rm(dir, { recursive: true, force: true }); }
}

test('inspection accepts H.264 + AAC at the storyboard frame rate', { skip: process.platform !== 'darwin' }, async () => {
  const result = await inspect();
  assert.equal(result.status, 0, result.stderr);
});
test('inspection rejects a missing AAC audio stream', { skip: process.platform !== 'darwin' }, async () => {
  const result = await inspect({ audio: false });
  assert.equal(result.status, 1);
  assert.match(result.stderr, /audio codec is missing, expected aac/);
});
test('inspection rejects a video with the wrong frame rate', { skip: process.platform !== 'darwin' }, async () => {
  const result = await inspect({ fps: 24 });
  assert.equal(result.status, 1);
  assert.match(result.stderr, /video frame rate differs from storyboard fps 30/);
});
