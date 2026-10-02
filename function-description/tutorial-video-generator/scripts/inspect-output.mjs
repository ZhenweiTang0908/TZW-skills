#!/usr/bin/env node
import { access, readFile } from 'node:fs/promises';
import { join, resolve } from 'node:path';
import { spawn } from 'node:child_process';

const output = resolve(process.argv[2] ?? 'tutorial-output');
const errors = [];
for (const [file, role] of [['tutorial.mp4', 'rendered video'], ['tutorial.vtt', 'subtitle track'], ['tutorial-poster.png', 'poster frame'], ['tutorial-manifest.json', 'build manifest']]) try { await access(join(output, file)); } catch { errors.push(`missing the ${role}`); }
let manifest;
try { manifest = JSON.parse(await readFile(join(output, 'tutorial-manifest.json'), 'utf8')); } catch (error) { errors.push(`invalid manifest: ${error.message}`); }
if (manifest) {
  let previous = 0;
  for (const scene of manifest.scenes ?? []) {
    if (Math.abs(scene.start - previous) > 0.01) errors.push(`${scene.id}: timeline is not continuous`);
    if (!(scene.end > scene.start)) errors.push(`${scene.id}: invalid time range`);
    const file = join(output, scene.audio);
    try { const duration = await probeDuration(file); if (Math.abs(duration - scene.duration) > 0.03) errors.push(`${scene.id}: manifest/audio duration differs`); if (await tailBurst(file, duration)) errors.push(`${scene.id}: probable tail burst`); } catch (error) { errors.push(`${scene.id}: ${error.message}`); }
    let segmentCursor = 0;
    for (const segment of scene.segments ?? []) {
      if (Math.abs(segment.start - segmentCursor) > 0.03) errors.push(`${scene.id}/${segment.id}: segment timeline is not continuous`);
      if (!(segment.end > segment.start)) errors.push(`${scene.id}/${segment.id}: invalid segment time range`);
      segmentCursor = segment.end;
    }
    if (scene.segments?.length && Math.abs(segmentCursor - scene.duration) > 0.05) errors.push(`${scene.id}: segment durations do not cover scene audio`);
    previous = scene.end;
  }
  try {
    const probe = JSON.parse(await run('ffprobe', ['-v', 'error', '-show_entries', 'stream=codec_name,width,height:format=duration', '-of', 'json', join(output, 'tutorial.mp4')]));
    const video = probe.streams?.find(s => s.width);
    if (video?.codec_name !== 'h264') errors.push(`video codec is ${video?.codec_name ?? 'missing'}, expected h264`);
    if (manifest.video && (video?.width !== manifest.video.width || video?.height !== manifest.video.height)) errors.push('video dimensions differ from manifest');
    if (Math.abs(Number(probe.format?.duration) - previous) > 0.12) errors.push('video duration differs from narration timeline');
  } catch (error) { errors.push(`cannot inspect video: ${error.message}`); }
  try { const vtt = await readFile(join(output, 'tutorial.vtt'), 'utf8'); const expected = manifest.scenes.reduce((sum, scene) => sum + Math.max(1, scene.segments?.length ?? 0), 0); if ((vtt.match(/-->/g) ?? []).length !== expected) errors.push('VTT cue count differs from narration segment count'); } catch {}
  try { const quality = JSON.parse(await readFile(join(output, 'quality-report.json'), 'utf8')); if (quality.errors?.length) errors.push(`quality report contains ${quality.errors.length} error(s)`); } catch (error) { errors.push(`invalid quality report: ${error.message}`); }
}
if (errors.length) { console.error(`Output inspection failed:\n- ${errors.join('\n- ')}`); process.exit(1); }
console.log(`Output inspection passed: ${output}`);

async function probeDuration(file) { const value = Number((await run('ffprobe', ['-v','error','-show_entries','format=duration','-of','default=nw=1:nk=1',file])).trim()); if (!(value > 0)) throw new Error('invalid WAV duration'); return value; }
async function peak(file,start,duration) { const out=await run('ffmpeg',['-hide_banner','-ss',String(Math.max(0,start)),'-t',String(duration),'-i',file,'-af','volumedetect','-f','null','-'],true); const m=out.match(/max_volume:\s*(-?(?:\d+(?:\.\d+)?|inf)) dB/); return m?Number(m[1]):-Infinity; }
async function tailBurst(file,duration) { if(duration<.35)return false; const tail=await peak(file,duration-.25,.25),before=await peak(file,Math.max(0,duration-.75),Math.min(.5,duration-.25)); return tail>=-.5&&tail-before>=6; }
function run(command,args,stderrToo=false){return new Promise((ok,fail)=>{const child=spawn(command,args);let stdout='',stderr='';child.stdout.on('data',d=>stdout+=d);child.stderr.on('data',d=>stderr+=d);child.on('error',e=>fail(new Error(`${command} is unavailable: ${e.message}`)));child.on('close',code=>code===0?ok(stderrToo?stdout+stderr:stdout):fail(new Error(`${command} failed (${code}): ${stderr.trim()}`)));});}
