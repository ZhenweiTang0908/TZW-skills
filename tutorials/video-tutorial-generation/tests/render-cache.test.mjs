import assert from 'node:assert/strict';
import { mkdtemp, mkdir, writeFile, readFile, chmod, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { spawnSync } from 'node:child_process';
import test from 'node:test';

test('cached render restores video and framing metadata after voice rewrites the manifest', async () => {
  const dir = await mkdtemp(join(tmpdir(), 'tutorial-render-cache-'));
  const command = (name, args) => {
    const result = spawnSync(name, args, { encoding: 'utf8' });
    assert.equal(result.status, 0, result.stderr);
  };
  try {
    await mkdir(join(dir, 'screenshots'));
    await mkdir(join(dir, 'audio'));
    command('ffmpeg', ['-v', 'error', '-f', 'lavfi', '-i', 'testsrc2=size=32x32:rate=30', '-f', 'lavfi', '-i', 'anullsrc=r=24000:cl=mono', '-t', '1.2', '-c:v', 'libx264', '-c:a', 'aac', '-y', join(dir, 'fixture.mp4')]);
    command('ffmpeg', ['-v', 'error', '-i', join(dir, 'fixture.mp4'), '-frames:v', '1', '-update', '1', '-y', join(dir, 'screenshots', 'one.png')]);
    command('ffmpeg', ['-v', 'error', '-f', 'lavfi', '-i', 'anullsrc=r=24000:cl=mono', '-t', '1.2', '-y', join(dir, 'audio', 'one.wav')]);
    const storyboard = { frame: 'page', presentation: 'continuous', viewport: { width: 32, height: 32 }, scenes: [{ id: 'one', screenshot: 'screenshots/one.png' }] };
    const voiceManifest = { scenes: [{ id: 'one', audio: 'audio/one.wav', start: 0, end: 1.2, duration: 1.2 }], cache: { audioHits: 1 } };
    await writeFile(join(dir, 'storyboard.resolved.json'), JSON.stringify(storyboard));
    await writeFile(join(dir, 'tutorial-manifest.json'), JSON.stringify(voiceManifest));
    // Supply a deterministic MP4 at the renderer boundary; no browser or external service is used.
    const fakeRenderer = join(dir, 'fake-remotion.mjs');
    await writeFile(fakeRenderer, `#!/usr/bin/env node\nimport {copyFileSync,writeFileSync} from 'node:fs';\ncopyFileSync(${JSON.stringify(join(dir, 'fixture.mp4'))},process.argv[5]);\nwriteFileSync(${JSON.stringify(join(dir, 'renderer-called'))},'rendered');\n`);
    await chmod(fakeRenderer, 0o755);
    const args = [new URL('../scripts/render-tutorial.mjs', import.meta.url).pathname, join(dir, 'storyboard.resolved.json'), '--output', dir, '--remotion-bin', fakeRenderer, '--browser-executable', '/unused-for-test'];
    command(process.execPath, args);
    // The next build's voice stage produces a fresh manifest without render metadata.
    await writeFile(join(dir, 'tutorial-manifest.json'), JSON.stringify(voiceManifest));
    await rm(join(dir, 'renderer-called'));
    command(process.execPath, args);
    const restored = JSON.parse(await readFile(join(dir, 'tutorial-manifest.json'), 'utf8'));
    assert.equal(restored.frame, 'page');
    assert.equal(restored.capture, null);
    assert.equal(restored.presentation, 'continuous');
    assert.equal(restored.video.codec, 'h264');
    assert.equal(restored.video.width, 32);
    assert.equal(restored.cache.renderHit, true);
    await assert.rejects(readFile(join(dir, 'renderer-called')), { code: 'ENOENT' });
  } finally { await rm(dir, { recursive: true, force: true }); }
});
