#!/usr/bin/env node
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { readJson, writeJson, run } from './lib.mjs';

const root=resolve(dirname(fileURLToPath(import.meta.url)),'..'),scripts=join(root,'scripts'),[command,input,...rest]=process.argv.slice(2),commands=new Set(['validate','doctor','capture','voice','render','inspect','build']);if(!commands.has(command)||(!input&&command!=='inspect'))usage();
if(command==='validate')await node('validate-storyboard.mjs',[input,...rest]);
if(command==='doctor')await node('doctor-storyboard.mjs',[input,...rest]);
if(command==='capture')await node('capture-scenes.mjs',[input,...rest]);
if(command==='voice')await node('generate-voice.mjs',[input,...rest]);
if(command==='render')await node('render-tutorial.mjs',[input,...rest]);
if(command==='inspect')await node('inspect-output.mjs',[input??'tutorial-output',...rest]);
if(command==='build'){
  const storyboard=await readJson(resolve(input)),baseOutput=resolve(value(rest,'--output')??join(process.cwd(),'tutorial-output')),languages=(value(rest,'--languages')?.split(',').filter(Boolean)??[value(rest,'--language')??(storyboard.language==='auto'?null:storyboard.language)??'de']);
  await node('validate-storyboard.mjs',[input]);
  for(const language of languages){const output=languages.length===1?baseOutput:join(baseOutput,language),stageArgs=setArg(setArg(removeArg(rest,'--languages'),'--output',output),'--language',language),timings={};
    timings.doctor=await timed(()=>node('doctor-storyboard.mjs',[input,'--output',join(output,'quality-report.json')]));
    timings.capture=await timed(()=>node('capture-scenes.mjs',[input,...stageArgs]));
    timings.voice=await timed(()=>node('generate-voice.mjs',[input,...stageArgs]));
    timings.render=await timed(()=>node('render-tutorial.mjs',[join(output,'storyboard.resolved.json'),...stageArgs]));
    timings.inspect=await timed(()=>node('inspect-output.mjs',[output]));
    const manifest=await readJson(join(output,'tutorial-manifest.json')),quality=await readJson(join(output,'quality-report.json'),{}),pricingPath=value(rest,'--pricing');let estimatedCost=null;if(pricingPath){const pricing=await readJson(resolve(pricingPath));estimatedCost=manifest.scenes.flatMap(s=>s.segments??[]).reduce((sum,s)=>sum+(s.text.length/1_000_000)*(pricing.models?.[s.model]?.perMillionCharacters??0),0);}
    await writeJson(join(output,'build-report.json'),{language,generatedAt:new Date().toISOString(),timings,cache:manifest.cache,tts:manifest.tts,quality:{status:quality.status,warnings:quality.warnings?.length??0,errors:quality.errors?.length??0},estimatedCost,pricingConfigured:Boolean(pricingPath)});
  }
}
async function node(script,args){return run(process.execPath,[join(scripts,script),...args],{inherit:true,env:{...process.env,PLAYWRIGHT_BROWSERS_PATH:process.env.PLAYWRIGHT_BROWSERS_PATH??'0',TUTORIAL_SKILL_ROOT:root}});}async function timed(work){const start=performance.now();await work();return Number(((performance.now()-start)/1000).toFixed(3));}
function value(args,name){const i=args.indexOf(name);return i>=0?args[i+1]:undefined;}function removeArg(args,name){const out=[];for(let i=0;i<args.length;i++){if(args[i]===name){if(args[i+1]&&!args[i+1].startsWith('--'))i++;continue;}out.push(args[i]);}return out;}function setArg(args,name,val){const out=removeArg(args,name);return[...out,name,val];}
function usage(){console.error(`Usage:
  node scripts/tutorial-video.mjs build <storyboard.json> --base-url <url> [--output dir] [--language de|--languages de,en,zh] [--mock]
  node scripts/tutorial-video.mjs validate|doctor|capture|voice|render <input> [options]
  node scripts/tutorial-video.mjs inspect <tutorial-output>`);process.exit(2);}
