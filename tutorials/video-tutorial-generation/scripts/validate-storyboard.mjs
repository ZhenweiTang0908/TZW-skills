#!/usr/bin/env node
import { readFile } from 'node:fs/promises';
import { pathToFileURL } from 'node:url';
import { narrationSegments } from './lib.mjs';

const TYPES = new Set(['move', 'click', 'highlight', 'fill', 'press', 'wait', 'zoom']);
const TRANSITIONS = new Set(['cut', 'crossfade', 'slide']);
const LANGUAGES = new Set(['de', 'en', 'zh', 'auto']);
const PRESENTATIONS = new Set(['continuous', 'stepwise']);
const FRAMES = new Set(['browser', 'page']);
const CAMERA_MODES = new Set(['auto', 'manual']);
const CAMERA_EASINGS = new Set(['smooth', 'snappy', 'linear']);
const CAPTION_STYLES = new Set(['bar', 'pill']);

export function validateStoryboard(data) {
  const errors = [];
  const fail = (path, message) => errors.push(`${path}: ${message}`);
  if (!data || typeof data !== 'object' || Array.isArray(data)) return ['root: must be an object'];
  if (data.version !== undefined && ![1, 2].includes(data.version)) fail('version', 'must be 1 or 2');
  if (typeof data.title !== 'string' || !data.title.trim()) fail('title', 'must be a non-empty string');
  if (!LANGUAGES.has(data.language ?? 'de')) fail('language', 'must be de, en, zh, or auto');
  if (!PRESENTATIONS.has(data.presentation ?? 'continuous')) fail('presentation', 'must be continuous or stepwise');
  if (!FRAMES.has(data.frame ?? 'browser')) fail('frame', 'must be browser or page');
  if (data.baseUrl !== undefined && !isHttpUrl(data.baseUrl)) fail('baseUrl', 'must be an HTTP(S) URL');
  if (data.fps !== undefined && (!Number.isInteger(data.fps) || data.fps < 24 || data.fps > 60)) fail('fps', 'must be an integer from 24 through 60');
  if (data.fixtures !== undefined && (!isPlainObject(data.fixtures) || ['window', 'localStorage', 'sessionStorage'].some((key) => data.fixtures[key] !== undefined && !isPlainObject(data.fixtures[key])))) fail('fixtures', 'must be an object with optional window, localStorage, and sessionStorage maps');
  if (data.ttsSpeed !== undefined && (typeof data.ttsSpeed !== 'number' || data.ttsSpeed < 0.5 || data.ttsSpeed > 3)) fail('ttsSpeed', 'must be a number between 0.5 and 3');
  if (data.taskLabel !== undefined && typeof data.taskLabel !== 'boolean') fail('taskLabel', 'must be a boolean');
  if (data.camera !== undefined) validateCameraConfig(data.camera, 'camera', fail);
  if (data.stage !== undefined) validateStageConfig(data.stage, 'stage', fail);
  if (data.theme !== undefined) validateThemeConfig(data.theme, 'theme', fail);
  if (data.capture !== undefined) validateCaptureTarget(data.capture, 'capture', fail, true);
  if ((data.frame ?? 'browser') === 'browser' && data.capture === undefined) fail('capture', 'is required for browser framing; use mode=background-window');

  const viewport = data.viewport;
  if (!viewport || typeof viewport !== 'object') fail('viewport', 'is required');
  else {
    for (const key of ['width', 'height']) if (!Number.isInteger(viewport[key]) || viewport[key] <= 0) fail(`viewport.${key}`, 'must be a positive integer');
    if (viewport.deviceScaleFactor !== undefined && (typeof viewport.deviceScaleFactor !== 'number' || viewport.deviceScaleFactor < 1 || viewport.deviceScaleFactor > 3)) fail('viewport.deviceScaleFactor', 'must be between 1 and 3');
  }

  if (!Array.isArray(data.scenes) || !data.scenes.length) fail('scenes', 'must be a non-empty array');
  const ids = new Set();
  for (const [index, scene] of (data.scenes ?? []).entries()) {
    const path = `scenes[${index}]`;
    if (!scene || typeof scene !== 'object') { fail(path, 'must be an object'); continue; }
    if (!validId(scene.id)) fail(`${path}.id`, 'must be a lowercase filename-safe ID');
    else if (ids.has(scene.id)) fail(`${path}.id`, 'must be unique');
    else ids.add(scene.id);
    if (typeof scene.route !== 'string' || !scene.route.trim()) fail(`${path}.route`, 'must be a non-empty string');
    if (scene.asset !== undefined && (typeof scene.asset !== 'string' || !scene.asset.trim())) fail(`${path}.asset`, 'must be a non-empty path');
    if (scene.captureTarget !== undefined) validateCaptureTarget(scene.captureTarget, `${path}.captureTarget`, fail, false);
    validateNarration(scene.narration, `${path}.narration`, fail);
    if (scene.readySelector !== undefined && (typeof scene.readySelector !== 'string' || !scene.readySelector.trim())) fail(`${path}.readySelector`, 'must be a non-empty string');
    if (!TRANSITIONS.has(scene.transition ?? 'crossfade')) fail(`${path}.transition`, 'must be cut, crossfade, or slide');
    if (!Array.isArray(scene.actions)) fail(`${path}.actions`, 'must be an array');

    const actionIds = new Set();
    const segmentIds = new Set(['narration']);
    for (const language of ['de', 'en', 'zh']) for (const segment of narrationSegments(scene, language)) segmentIds.add(segment.id);
    for (const [actionIndex, action] of (scene.actions ?? []).entries()) {
      const actionPath = `${path}.actions[${actionIndex}]`;
      if (!action || typeof action !== 'object') { fail(actionPath, 'must be an object'); continue; }
      if (action.id !== undefined) {
        if (!validId(action.id)) fail(`${actionPath}.id`, 'must be a lowercase filename-safe ID');
        else if (actionIds.has(action.id)) fail(`${actionPath}.id`, 'must be unique within the scene');
        else actionIds.add(action.id);
      }
      if (!TYPES.has(action.type)) fail(`${actionPath}.type`, `must be one of ${[...TYPES].join(', ')}`);
      if (action.duration !== undefined && (typeof action.duration !== 'number' || action.duration < 0)) fail(`${actionPath}.duration`, 'must be a non-negative number');
      const target = typeof action.target === 'string' && action.target.trim();
      const point = Number.isFinite(action.x) && Number.isFinite(action.y);
      const isResetZoom = action.type === 'zoom' && action.zoom === 1;
      if (action.type !== 'wait' && !isResetZoom && !target && !point) fail(actionPath, 'requires target or numeric x/y');
      if (action.zoom !== undefined && (typeof action.zoom !== 'number' || action.zoom < 1 || action.zoom > 4)) fail(`${actionPath}.zoom`, 'must be a number from 1 through 4');
      if (action.easing !== undefined && !CAMERA_EASINGS.has(action.easing)) fail(`${actionPath}.easing`, 'must be smooth, snappy, or linear');
      if (['fill', 'press'].includes(action.type) && !target) fail(actionPath, `${action.type} requires target`);
      if (action.type === 'fill' && typeof action.value !== 'string') fail(`${actionPath}.value`, 'must be a string');
      if (action.type === 'press' && (typeof action.key !== 'string' || !action.key)) fail(`${actionPath}.key`, 'must be a non-empty string');
      if (action.syncWith !== undefined && !segmentIds.has(action.syncWith)) fail(`${actionPath}.syncWith`, `does not match a narration segment: ${action.syncWith}`);
    }
    if (scene.camera !== undefined) validateSceneCamera(scene.camera, `${path}.camera`, segmentIds, actionIds, fail);
  }
  return errors;
}

function validateCameraConfig(value, path, fail) {
  if (!isPlainObject(value)) { fail(path, 'must be an object'); return; }
  if (value.enabled !== undefined && typeof value.enabled !== 'boolean') fail(`${path}.enabled`, 'must be a boolean');
  if (value.mode !== undefined && !CAMERA_MODES.has(value.mode)) fail(`${path}.mode`, 'must be auto or manual');
  for (const key of ['defaultZoom', 'minZoom', 'maxZoom']) {
    if (value[key] !== undefined && (typeof value[key] !== 'number' || value[key] < 1 || value[key] > 4)) fail(`${path}.${key}`, 'must be a number from 1 through 4');
  }
  if (value.minZoom !== undefined && value.maxZoom !== undefined && value.minZoom > value.maxZoom) fail(`${path}.minZoom`, 'must not exceed maxZoom');
  if (value.transitionDuration !== undefined && (typeof value.transitionDuration !== 'number' || value.transitionDuration <= 0)) fail(`${path}.transitionDuration`, 'must be a positive number');
  if (value.motionBlur !== undefined && (typeof value.motionBlur !== 'number' || value.motionBlur < 0 || value.motionBlur > 1)) fail(`${path}.motionBlur`, 'must be a number from 0 through 1');
  if (value.clampToViewport !== undefined && typeof value.clampToViewport !== 'boolean') fail(`${path}.clampToViewport`, 'must be a boolean');
}

function validateStageConfig(value, path, fail) {
  if (!isPlainObject(value)) { fail(path, 'must be an object'); return; }
  if (value.enabled !== undefined && typeof value.enabled !== 'boolean') fail(`${path}.enabled`, 'must be a boolean');
  if (value.padding !== undefined && (typeof value.padding !== 'number' || value.padding < 0)) fail(`${path}.padding`, 'must be a non-negative number');
  if (value.borderRadius !== undefined && (typeof value.borderRadius !== 'number' || value.borderRadius < 0)) fail(`${path}.borderRadius`, 'must be a non-negative number');
  if (value.shadow !== undefined && typeof value.shadow !== 'boolean' && typeof value.shadow !== 'string') fail(`${path}.shadow`, 'must be a boolean or CSS shadow string');
  if (value.background !== undefined && (typeof value.background !== 'string' || !value.background.trim())) fail(`${path}.background`, 'must be a non-empty string');
  if (value.blobColor !== undefined && (typeof value.blobColor !== 'string' || !value.blobColor.trim())) fail(`${path}.blobColor`, 'must be a non-empty string');
}

function validateThemeConfig(value, path, fail) {
  if (!isPlainObject(value)) { fail(path, 'must be an object'); return; }
  if (value.captionStyle !== undefined && !CAPTION_STYLES.has(value.captionStyle)) fail(`${path}.captionStyle`, 'must be bar or pill');
  if (value.captionBg !== undefined && (typeof value.captionBg !== 'string' || !value.captionBg.trim())) fail(`${path}.captionBg`, 'must be a non-empty string');
}

function validateSceneCamera(value, path, segmentIds, actionIds, fail) {
  const list = Array.isArray(value) ? value : [value];
  if (Array.isArray(value) && !value.length) { fail(path, 'must not be an empty array'); return; }
  for (const [index, kf] of list.entries()) {
    const kfPath = Array.isArray(value) ? `${path}[${index}]` : path;
    if (!isPlainObject(kf)) { fail(kfPath, 'must be an object'); continue; }
    if (kf.zoom !== undefined && (typeof kf.zoom !== 'number' || kf.zoom < 1 || kf.zoom > 4)) fail(`${kfPath}.zoom`, 'must be a number from 1 through 4');
    if (kf.at !== undefined && (typeof kf.at !== 'number' || kf.at < 0)) fail(`${kfPath}.at`, 'must be a non-negative number');
    if (kf.offset !== undefined && typeof kf.offset !== 'number') fail(`${kfPath}.offset`, 'must be a number');
    if (kf.duration !== undefined && (typeof kf.duration !== 'number' || kf.duration <= 0)) fail(`${kfPath}.duration`, 'must be a positive number');
    if (kf.easing !== undefined && !CAMERA_EASINGS.has(kf.easing)) fail(`${kfPath}.easing`, 'must be smooth, snappy, or linear');
    if (kf.syncWith !== undefined && !segmentIds.has(kf.syncWith)) fail(`${kfPath}.syncWith`, `does not match a narration segment: ${kf.syncWith}`);
    if (kf.actionId !== undefined && !actionIds.has(kf.actionId)) fail(`${kfPath}.actionId`, `does not match an action id: ${kf.actionId}`);
    if (kf.target !== undefined && (typeof kf.target !== 'string' || !kf.target.trim())) fail(`${kfPath}.target`, 'must be a non-empty string');
    if ((kf.x !== undefined) !== (kf.y !== undefined) || (kf.x !== undefined && (!Number.isFinite(kf.x) || !Number.isFinite(kf.y)))) {
      fail(kfPath, 'requires both finite numeric x and y when coordinates are provided');
    }
  }
}

function validateCaptureTarget(value, path, fail, allowMode) {
  if (!isPlainObject(value)) { fail(path, 'must be an object'); return; }
  if (allowMode && value.mode === undefined) fail(`${path}.mode`, 'is required and must be background-window');
  if (allowMode && value.mode !== undefined && value.mode !== 'background-window') fail(`${path}.mode`, 'must be background-window');
  if (allowMode && value.windowPolicy !== 'new-window') fail(`${path}.windowPolicy`, 'must be new-window for every Skill run');
  if (value.windowId !== undefined && (!Number.isInteger(value.windowId) || value.windowId <= 0)) fail(`${path}.windowId`, 'must be a positive integer');
  if (value.app !== undefined && (typeof value.app !== 'string' || !value.app.trim())) fail(`${path}.app`, 'must be a non-empty string');
  if (value.titleIncludes !== undefined && (typeof value.titleIncludes !== 'string' || !value.titleIncludes.trim())) fail(`${path}.titleIncludes`, 'must be a non-empty string');
  if (value.includeShadow !== undefined && typeof value.includeShadow !== 'boolean') fail(`${path}.includeShadow`, 'must be a boolean');
  if (value.windowId === undefined && value.app === undefined) fail(path, 'requires windowId or app');
}

function validateNarration(value, path, fail) {
  if (typeof value === 'string') { if (!value.trim()) fail(path, 'must not be empty'); return; }
  if (!value || typeof value !== 'object' || Array.isArray(value)) { fail(path, 'must be a string or language map'); return; }
  if (!Object.keys(value).some((key) => ['de', 'en', 'zh'].includes(key))) fail(path, 'must include de, en, or zh');
  for (const [language, segments] of Object.entries(value)) {
    if (!['de', 'en', 'zh'].includes(language)) { fail(`${path}.${language}`, 'unsupported language'); continue; }
    if (typeof segments === 'string') { if (!segments.trim()) fail(`${path}.${language}`, 'must not be empty'); continue; }
    if (!Array.isArray(segments) || !segments.length) { fail(`${path}.${language}`, 'must be a non-empty string or array'); continue; }
    const ids = new Set();
    for (const [index, segment] of segments.entries()) {
      if (typeof segment === 'string') { if (!segment.trim()) fail(`${path}.${language}[${index}]`, 'must not be empty'); continue; }
      if (!segment || !validId(segment.id) || typeof segment.text !== 'string' || !segment.text.trim()) fail(`${path}.${language}[${index}]`, 'requires a filename-safe id and non-empty text');
      else if (ids.has(segment.id)) fail(`${path}.${language}[${index}].id`, 'must be unique');
      else ids.add(segment.id);
    }
  }
}

const isPlainObject = (value) => Boolean(value) && typeof value === 'object' && !Array.isArray(value);
const validId = (value) => typeof value === 'string' && /^[a-z0-9][a-z0-9-]*$/.test(value);

function isHttpUrl(value) {
  try { return ['http:', 'https:'].includes(new URL(value).protocol); } catch { return false; }
}

export async function loadAndValidate(path) {
  let data;
  try { data = JSON.parse(await readFile(path, 'utf8')); }
  catch (error) { throw new Error(`Cannot read storyboard ${path}: ${error.message}`); }
  const errors = validateStoryboard(data);
  if (errors.length) throw new Error(`Invalid storyboard:\n- ${errors.join('\n- ')}`);
  return data;
}

if (import.meta.url === pathToFileURL(process.argv[1]).href) {
  const path = process.argv[2];
  if (!path) { console.error('Usage: node validate-storyboard.mjs <storyboard.json>'); process.exit(2); }
  try {
    const data = await loadAndValidate(path);
    console.log(`Valid storyboard: ${data.scenes.length} scene(s), ${data.presentation ?? 'continuous'} presentation, version ${data.version ?? 1}`);
  } catch (error) { console.error(error.message); process.exit(1); }
}
