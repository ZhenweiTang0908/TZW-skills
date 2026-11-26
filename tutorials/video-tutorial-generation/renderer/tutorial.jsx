import React from 'react';
import {
  AbsoluteFill,
  Audio,
  Composition,
  Img,
  Sequence,
  registerRoot,
  staticFile,
  useCurrentFrame,
} from 'remotion';
import data from './public/data.json';

const { storyboard, manifest, theme } = data;
const fps = storyboard.fps || 30;
const presentation = storyboard.presentation || 'continuous';
const compWidth = storyboard.viewport.width;
const compHeight = storyboard.viewport.height;
const uiScale = compWidth / 1440;
const fontFamily = '"PingFang SC", "Noto Sans CJK SC", Arial, sans-serif';
const offsets = manifest.scenes.map((scene) => Math.round(scene.start * fps));
const sceneFrames = manifest.scenes.map((scene, index) => Math.max(1, Math.round(scene.end * fps) - offsets[index]));
const totalFrames = Math.max(1, Math.round(manifest.duration * fps));
const clamp = (value, min, max) => Math.max(min, Math.min(max, value));
const ease = (value) => 1 - Math.pow(1 - clamp(value, 0, 1), 3);
const easeInOutCubic = (value) => {
  const t = clamp(value, 0, 1);
  return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
};
const applyCameraEasing = (value, mode = 'smooth') => {
  if (mode === 'linear') return clamp(value, 0, 1);
  if (mode === 'snappy') return ease(value);
  return easeInOutCubic(value);
};
const pointOf = (action) => action.rect
  ? { x: action.rect.x + action.rect.width / 2, y: action.rect.y + action.rect.height / 2 }
  : { x: action.x, y: action.y };

function hexToRgba(hex, alpha) {
  if (typeof hex !== 'string') return `rgba(79,124,255,${alpha})`;
  const clean = hex.trim().replace(/^#/, '');
  const full = clean.length === 3 ? clean.split('').map((c) => c + c).join('') : clean;
  if (!/^[0-9a-fA-F]{6}$/.test(full)) return `rgba(79,124,255,${alpha})`;
  const num = parseInt(full, 16);
  return `rgba(${(num >> 16) & 255},${(num >> 8) & 255},${num & 255},${alpha})`;
}

const actionSeconds = (action) => action.duration ?? (action.type === 'move' ? 0.55 : action.type === 'click' ? 0.42 : action.type === 'highlight' ? 0.7 : 0.25);

function actionWindows(actions, segments, frames) {
  return actions.map((action, index) => {
    const segment = action.syncWith && segments.find((item) => item.id === action.syncWith);
    if (!segment) {
      const each = frames / Math.max(1, actions.length);
      const duration = Math.min(actionSeconds(action) * fps, each);
      return { action, index, start: index * each, end: index * each + duration };
    }
    const related = actions.slice(0, index).filter((item) => item.syncWith === action.syncWith);
    const earlier = related.reduce((sum, item) => sum + actionSeconds(item) * fps, 0);
    const rawOffset = action.offset;
    const offsetSeconds = rawOffset && typeof rawOffset === 'object' ? (rawOffset[manifest.language] ?? rawOffset.de ?? 0.12) : (rawOffset ?? 0.12);
    const start = segment.start * fps + fps * offsetSeconds + earlier;
    const duration = actionSeconds(action) * fps;
    const end = Math.min(segment.end * fps, start + duration);
    return { action, index, start: Math.min(start, end), end: Math.max(start + 1, end) };
  });
}

function sameRect(a, b) {
  return Boolean(a && b) && Math.abs(a.x - b.x) < 1 && Math.abs(a.y - b.y) < 1 && Math.abs(a.width - b.width) < 1 && Math.abs(a.height - b.height) < 1;
}

function focusIntervals(scene, meta, windows, frames) {
  const segments = meta.segments || [];
  const picked = new Map();
  for (const window of windows) {
    const action = window.action;
    if (!action.rect) continue;
    const segment = action.syncWith ? segments.find((item) => item.id === action.syncWith) : null;
    const key = segment ? segment.id : `action-${window.index}`;
    const start = segment ? segment.start * fps : window.start;
    const end = segment ? segment.end * fps : window.end;
    const existing = picked.get(key);
    if (!existing || action.type === 'highlight' || existing.type !== 'highlight') picked.set(key, { type: action.type, rect: action.rect, start, end, linked: Boolean(segment) });
  }
  const ordered = [...picked.values()].sort((a, b) => a.start - b.start);
  for (const [index, item] of ordered.entries()) {
    if (item.linked) continue;
    const next = ordered[index + 1];
    item.end = Math.max(item.end, next ? Math.min(next.start, frames) : frames);
  }
  const merged = [];
  for (const item of ordered) {
    const last = merged[merged.length - 1];
    if (last && sameRect(last.rect, item.rect) && item.start - last.end < fps * 0.4) last.end = Math.max(last.end, item.end);
    else merged.push({ ...item });
  }
  return merged;
}

function focusAt(frame, intervals) {
  let best = null;
  for (const item of intervals) {
    const alpha = Math.min(clamp((frame - item.start) / Math.max(1, fps * 0.22), 0, 1), clamp((item.end - frame) / Math.max(1, fps * 0.26), 0, 1));
    if (alpha > 0.01 && (!best || alpha >= best.alpha)) best = { rect: item.rect, alpha };
  }
  return best;
}

const Focus = ({ item }) => {
  if (!item || item.alpha <= 0.01) return null;
  const rect = item.rect;
  const pad = 8;
  return <div style={{ position: 'absolute', left: rect.x - pad, top: rect.y - pad, width: rect.width + pad * 2, height: rect.height + pad * 2, borderRadius: 10, border: `3px solid ${theme.accent}`, opacity: item.alpha, boxShadow: `0 0 0 9999px rgba(0,0,0,${theme.highlightDim ?? 0.18}), 0 0 26px ${theme.accent}aa, inset 0 0 0 1px rgba(255,255,255,.35)` }} />;
};

const FocusLayer = ({ scene, meta, frames }) => {
  const frame = useCurrentFrame();
  const windows = actionWindows(scene.actions || [], meta.segments || [], frames);
  return <Focus item={focusAt(frame, focusIntervals(scene, meta, windows, frames))} />;
};

function clickCues(scene, meta, frames) {
  return actionWindows(scene.actions || [], meta.segments || [], frames)
    .filter(({ action }) => action.type === 'click' && action.showCursor === true && action.rect)
    .map(({ action, start, end }) => {
      const cueStart = Math.min(frames - 1, start + fps * 0.3);
      const cueEnd = Math.min(frames, cueStart + Math.max(fps * 0.48, Math.min(fps * 0.72, end - start + fps * 0.18)));
      return { point: pointOf(action), start: cueStart, end: Math.max(cueStart + 1, cueEnd) };
    });
}

const PointerSvg = ({ x, y, opacity = 0.98, scaleComp = 1 }) => (
  <svg width={34 * uiScale * scaleComp} height={43 * uiScale * scaleComp} viewBox="0 0 30 38" style={{ position: 'absolute', left: x - 4 * uiScale * scaleComp, top: y - 3 * uiScale * scaleComp, opacity, zIndex: 9, filter: 'drop-shadow(0 4px 8px rgba(0,0,0,.6))' }}>
    <path d="M2 1v29l8-7 5 13 5-2-5-13h11z" fill="white" stroke="#07111f" strokeWidth="2.6" strokeLinejoin="round" />
  </svg>
);

const StepClickCue = ({ cue }) => {
  const frame = useCurrentFrame();
  const inFade = clamp((frame - cue.start) / Math.max(1, fps * 0.1), 0, 1);
  const outFade = clamp((cue.end - frame) / Math.max(1, fps * 0.16), 0, 1);
  const alpha = Math.min(inFade, outFade);
  if (alpha <= 0.01) return null;
  const pulseStart = cue.start + fps * 0.14;
  const pulse = clamp((frame - pulseStart) / Math.max(1, fps * 0.36), 0, 1);
  const ringAlpha = frame >= pulseStart ? alpha * (1 - pulse) : 0;
  return <>
    <PointerSvg x={cue.point.x} y={cue.point.y} opacity={alpha} />
    <div style={{ position: 'absolute', left: cue.point.x - 18, top: cue.point.y - 18, width: 36, height: 36, border: `3px solid ${theme.accent}`, borderRadius: '50%', opacity: ringAlpha, transform: `scale(${0.55 + pulse * 0.85})`, boxShadow: `0 0 18px ${theme.accent}cc`, zIndex: 2 }} />
  </>;
};

const StepClickLayer = ({ scene, meta, frames }) => (
  <>{clickCues(scene, meta, frames).map((cue, index) => <StepClickCue key={index} cue={cue} />)}</>
);

const globalEvents = (() => {
  const events = [];
  let previous = { x: compWidth - 70, y: compHeight - 56 };
  for (const [sceneIndex, scene] of storyboard.scenes.entries()) {
    const meta = manifest.scenes[sceneIndex];
    const windows = actionWindows(scene.actions || [], meta.segments || [], sceneFrames[sceneIndex]);
    for (const window of windows) {
      if (window.action.type === 'wait' || window.action.type === 'zoom') continue;
      const point = pointOf(window.action);
      if (!Number.isFinite(point.x) || !Number.isFinite(point.y)) continue;
      const start = offsets[sceneIndex] + window.start;
      const end = offsets[sceneIndex] + window.end;
      events.push({ action: window.action, start, end, sceneEnd: offsets[sceneIndex] + sceneFrames[sceneIndex], from: previous, to: point });
      previous = point;
    }
  }
  return events;
})();

const camCfg = storyboard.camera || {};
const cameraEnabled = camCfg.enabled === false
  ? false
  : Boolean(camCfg.enabled || storyboard.scenes.some((s) => s.camera || (s.actions || []).some((a) => a.type === 'zoom' || Number.isFinite(a.zoom))));
const camMode = camCfg.mode ?? 'manual';
const camDefaultZoom = clamp(camCfg.defaultZoom ?? 1.85, 1, 4);
const camMinZoom = clamp(camCfg.minZoom ?? 1, 1, 4);
const camMaxZoom = clamp(camCfg.maxZoom ?? 3, camMinZoom, 4);
const camDefaultDuration = Math.max(0.05, camCfg.transitionDuration ?? 0.65);
const camMotionBlur = clamp(camCfg.motionBlur ?? 0, 0, 1);
const camClampToViewport = camCfg.clampToViewport !== false;

const stageCfg = storyboard.stage || {};
const stageEnabled = Boolean(stageCfg.enabled);
const stagePad = stageEnabled ? Math.max(0, stageCfg.padding ?? 48) * uiScale : 0;
const stageScale = stageEnabled
  ? Math.max(0.2, Math.min((compWidth - 2 * stagePad) / compWidth, (compHeight - 2 * stagePad) / compHeight))
  : 1;
const stageRadius = stageEnabled ? Math.max(0, stageCfg.borderRadius ?? 18) * uiScale : 0;

function sampleCameraSegment(seg, frame) {
  const raw = clamp((frame - seg.startFrame) / Math.max(1, seg.endFrame - seg.startFrame), 0, 1);
  const t = applyCameraEasing(raw, seg.easing);
  return {
    x: seg.from.x + (seg.to.x - seg.from.x) * t,
    y: seg.from.y + (seg.to.y - seg.from.y) * t,
    zoom: seg.from.zoom + (seg.to.zoom - seg.from.zoom) * t,
  };
}

const cameraTrack = (() => {
  if (!cameraEnabled) return [];
  const raw = [];
  const center = { x: compWidth / 2, y: compHeight / 2 };
  for (const [sceneIndex, scene] of storyboard.scenes.entries()) {
    const meta = manifest.scenes[sceneIndex];
    const sceneOffset = offsets[sceneIndex];
    const frames = sceneFrames[sceneIndex];
    const windows = actionWindows(scene.actions || [], meta.segments || [], frames);
    const segments = meta.segments || [];
    const hasExplicitSceneCam = Boolean(scene.camera && (!Array.isArray(scene.camera) || scene.camera.length > 0));

    if (hasExplicitSceneCam) {
      const list = Array.isArray(scene.camera) ? scene.camera : [{ at: 0, ...scene.camera }];
      for (const kf of list) {
        let startFrame = sceneOffset + (kf.at ?? 0) * fps;
        if (kf.actionId) {
          const matched = windows.find((w) => w.action.id === kf.actionId);
          if (matched) startFrame = sceneOffset + matched.start + (kf.offset ?? 0) * fps;
        } else if (kf.syncWith) {
          const matched = segments.find((s) => s.id === kf.syncWith);
          if (matched) startFrame = sceneOffset + matched.start * fps + (kf.offset ?? 0) * fps;
        }
        const durFrames = Math.max(1, Math.round((kf.duration ?? camDefaultDuration) * fps));
        const pt = pointOf(kf);
        const z = clamp(kf.zoom ?? camDefaultZoom, camMinZoom, camMaxZoom);
        raw.push({
          startFrame: Math.max(0, startFrame),
          endFrame: Math.min(totalFrames, Math.max(0, startFrame) + durFrames),
          x: Number.isFinite(pt.x) ? pt.x : (z === 1 ? center.x : undefined),
          y: Number.isFinite(pt.y) ? pt.y : (z === 1 ? center.y : undefined),
          zoom: z,
          easing: kf.easing ?? 'smooth',
        });
      }
    }

    for (const w of windows) {
      const isZoomAction = w.action.type === 'zoom';
      const hasZoomOverride = Number.isFinite(w.action.zoom);
      if (isZoomAction || hasZoomOverride) {
        const pt = pointOf(w.action);
        const z = clamp(w.action.zoom ?? camDefaultZoom, camMinZoom, camMaxZoom);
        const lead = isZoomAction ? 0 : Math.min(w.start, fps * 0.15);
        const startFrame = Math.max(0, sceneOffset + w.start - lead);
        const durFrames = Math.max(1, Math.round((w.action.duration ?? camDefaultDuration) * fps));
        raw.push({
          startFrame,
          endFrame: Math.min(totalFrames, startFrame + durFrames),
          x: Number.isFinite(pt.x) ? pt.x : (z === 1 ? center.x : undefined),
          y: Number.isFinite(pt.y) ? pt.y : (z === 1 ? center.y : undefined),
          zoom: z,
          easing: w.action.easing ?? 'smooth',
        });
      }
    }

    if (camMode === 'auto' && !hasExplicitSceneCam) {
      const interactive = windows.filter((w) => ['move', 'click', 'highlight'].includes(w.action.type) && !Number.isFinite(w.action.zoom));
      if (interactive.length === 0) {
        if (!windows.some((w) => w.action.type === 'zoom')) {
          const durFrames = Math.max(1, Math.round(camDefaultDuration * fps));
          raw.push({ startFrame: sceneOffset, endFrame: Math.min(totalFrames, sceneOffset + durFrames), x: center.x, y: center.y, zoom: 1, easing: 'smooth' });
        }
      } else {
        if (interactive[0].start > fps * 0.8) {
          const durFrames = Math.max(1, Math.round(camDefaultDuration * fps));
          raw.push({ startFrame: sceneOffset, endFrame: Math.min(totalFrames, sceneOffset + durFrames), x: center.x, y: center.y, zoom: 1, easing: 'smooth' });
        }
        let lastPoint = null;
        for (const w of interactive) {
          const pt = pointOf(w.action);
          if (!Number.isFinite(pt.x) || !Number.isFinite(pt.y)) continue;
          if (lastPoint && Math.hypot(pt.x - lastPoint.x, pt.y - lastPoint.y) < 12) continue;
          const lead = Math.min(w.start, fps * 0.14);
          const startFrame = Math.max(sceneOffset, sceneOffset + w.start - lead);
          const durFrames = Math.max(1, Math.round(camDefaultDuration * fps));
          raw.push({
            startFrame,
            endFrame: Math.min(totalFrames, startFrame + durFrames),
            x: pt.x,
            y: pt.y,
            zoom: camDefaultZoom,
            easing: 'smooth',
          });
          lastPoint = pt;
        }
      }
    }
  }

  raw.sort((a, b) => a.startFrame - b.startFrame);
  const resolved = [];
  let prevState = { x: center.x, y: center.y, zoom: 1 };
  for (let i = 0; i < raw.length; i++) {
    const kf = raw[i];
    const start = Math.max(0, kf.startFrame);
    const from = resolved.length ? sampleCameraSegment(resolved[resolved.length - 1], start) : prevState;
    const to = {
      x: kf.x ?? from.x,
      y: kf.y ?? from.y,
      zoom: kf.zoom,
    };
    const seg = {
      startFrame: start,
      endFrame: Math.max(start + 1, kf.endFrame),
      from,
      to,
      easing: kf.easing,
    };
    resolved.push(seg);
    prevState = to;
  }
  return resolved;
})();

function evaluateCamera(frame) {
  const center = { x: compWidth / 2, y: compHeight / 2 };
  if (!cameraEnabled || !cameraTrack.length) return { x: center.x, y: center.y, zoom: 1 };
  let active = null;
  for (const seg of cameraTrack) {
    if (seg.startFrame <= frame) active = seg;
    else break;
  }
  const state = active ? sampleCameraSegment(active, frame) : { x: center.x, y: center.y, zoom: 1 };
  const z = Math.max(1, state.zoom);
  if (!camClampToViewport) return { x: state.x, y: state.y, zoom: z };
  const halfW = compWidth / (2 * z);
  const halfH = compHeight / (2 * z);
  return {
    x: clamp(state.x, halfW, compWidth - halfW),
    y: clamp(state.y, halfH, compHeight - halfH),
    zoom: z,
  };
}

const ContinuousPointer = ({ zoom = 1 }) => {
  const frame = useCurrentFrame();
  if (!globalEvents.length) return null;
  let active = null;
  for (const event of globalEvents) if (event.start <= frame) active = event;
  const event = active || globalEvents[0];
  const progress = active && frame < event.end ? ease((frame - event.start) / Math.max(1, event.end - event.start)) : 1;
  const x = event.from.x + (event.to.x - event.from.x) * progress;
  const y = event.from.y + (event.to.y - event.from.y) * progress;
  const visible = frame >= Math.max(0, globalEvents[0].start - fps * 0.2);
  const scaleComp = 1 / Math.max(1, Math.pow(zoom, 0.72));
  return <>
    {visible ? <PointerSvg x={x} y={y} scaleComp={scaleComp} /> : null}
    {globalEvents.filter((item) => item.action.type === 'click').map((item, index) => {
      const ring = frame >= item.end && frame - item.end <= fps * 0.6 ? clamp((frame - item.end) / (fps * 0.6), 0, 1) : null;
      return <React.Fragment key={index}>
        {ring !== null ? <div style={{ position: 'absolute', left: item.to.x - 20 * uiScale * scaleComp, top: item.to.y - 20 * uiScale * scaleComp, width: 40 * uiScale * scaleComp, height: 40 * uiScale * scaleComp, borderRadius: '50%', border: `${5 * uiScale * scaleComp}px solid ${theme.accent}`, opacity: 0.9 * (1 - ring), transform: `scale(${0.7 + ring * 2.4})`, zIndex: 8 }} /> : null}
      </React.Fragment>;
    })}
  </>;
};

const CurrentTask = () => {
  const frame = useCurrentFrame();
  if (storyboard.taskLabel === false) return null;
  let active = 0;
  for (const [index, scene] of storyboard.scenes.entries()) if (frame >= offsets[index]) active = index;
  const scene = storyboard.scenes[active];
  const task = typeof scene.task === 'string' ? scene.task : scene.task?.[manifest.language] ?? scene.task?.de;
  if (!task) return null;
  return <div style={{ position: 'absolute', left: 16 * uiScale, top: 96 * uiScale, zIndex: 12, display: 'flex', alignItems: 'center', gap: 8 * uiScale, maxWidth: 480 * uiScale, padding: `${8 * uiScale}px ${14 * uiScale}px`, borderRadius: 8 * uiScale, background: 'rgba(15,23,42,.9)', border: '1px solid rgba(255,255,255,.24)', boxShadow: '0 5px 18px rgba(0,0,0,.2)', color: '#fff', fontFamily, fontSize: 28 * uiScale, lineHeight: 1.25, fontWeight: 600 }}>
    <span style={{ width: 6 * uiScale, height: 6 * uiScale, flex: '0 0 auto', borderRadius: '50%', background: theme.accent }} />
    <span>{task}</span>
  </div>;
};

const MethodCard = () => {
  const card = storyboard.methodCard;
  if (!card) return null;
  const language = manifest.language || 'de';
  const value = (item) => typeof item === 'string' ? item : item?.[language] ?? item?.de;
  const accent = card.accent || theme.accent;
  return <div style={{ position: 'absolute', left: 16 * uiScale, bottom: 150 * uiScale, zIndex: 12, width: 510 * uiScale, boxSizing: 'border-box', padding: `${10 * uiScale}px ${14 * uiScale}px`, borderRadius: 9 * uiScale, border: `4px solid ${accent}`, background: 'rgba(15,23,42,.92)', boxShadow: '0 6px 22px rgba(0,0,0,.24)', color: '#fff', fontFamily }}>
    <div style={{ display: 'flex', alignItems: 'baseline', gap: 10 * uiScale }}>
      <span style={{ color: accent, fontSize: 19 * uiScale, fontWeight: 800 }}>{value(card.label)}</span>
      <span style={{ fontSize: 23 * uiScale, fontWeight: 700 }}>{value(card.title)}</span>
    </div>
    <div style={{ marginTop: 4 * uiScale, fontSize: 18 * uiScale, fontWeight: 700, color: accent }}>{value(card.status)}</div>
    <div style={{ marginTop: 2 * uiScale, fontSize: 16 * uiScale, lineHeight: 1.3, color: '#dbe6ef' }}>{value(card.detail)}</div>
  </div>;
};

const Caption = ({ meta, scene }) => {
  const frame = useCurrentFrame();
  const time = frame / fps;
  const segment = (meta.segments || []).find((item) => time >= item.start && time <= item.end);
  if (!segment) return null;
  // Fade only at real caption gaps; fading at a seamless boundary blinks the caption box off for a frame.
  const segments = meta.segments || [];
  const segmentIndex = segments.indexOf(segment);
  const joinedBefore = segmentIndex > 0 ? segment.start - segments[segmentIndex - 1].end < 0.1 : meta.start > 0;
  const joinedAfter = segmentIndex < segments.length - 1 ? segments[segmentIndex + 1].start - segment.end < 0.1 : meta.end < manifest.duration - 0.05;
  const fadeIn = joinedBefore ? 1 : clamp((time - segment.start) / 0.16, 0, 1);
  const fadeOut = joinedAfter ? 1 : clamp((segment.end - time) / 0.14, 0, 1);
  const where = scene?.captionPosition || theme.captionPosition;
  const position = where === 'top' ? { top: (scene?.captionPosition === 'top' ? 120 : 24) * uiScale } : { bottom: 24 * uiScale };
  const pill = theme.captionStyle === 'pill';
  const captionBg = theme.captionBg || (pill ? hexToRgba(theme.accent === '#0f766e' ? '#4f7cff' : theme.accent, 0.88) : 'rgba(0,0,0,.8)');
  const boxStyle = pill
    ? { display: 'inline-block', maxWidth: 1200 * uiScale, padding: `${8 * uiScale}px ${18 * uiScale}px`, borderRadius: 10 * uiScale, background: captionBg, color: 'white', fontFamily, fontSize: 33 * uiScale, fontWeight: 600, lineHeight: 1.3, boxShadow: `0 ${6 * uiScale}px ${22 * uiScale}px rgba(15,23,42,.24)`, textShadow: '0 1px 3px rgba(0,0,0,.25)' }
    : { display: 'inline-block', maxWidth: 1260 * uiScale, padding: `${10 * uiScale}px ${18 * uiScale}px`, borderRadius: 10 * uiScale, background: captionBg, color: 'white', fontFamily, fontSize: 34 * uiScale, fontWeight: 500, lineHeight: 1.35, textShadow: '0 2px 7px #000' };
  return <div style={{ position: 'absolute', left: '6%', right: '6%', ...position, textAlign: 'center', opacity: Math.min(fadeIn, fadeOut), zIndex: 14 }}>
    <div style={boxStyle}>{segment.text}</div>
  </div>;
};

const sceneFade = (scene, frame, frames) => {
  const transition = scene.transition || theme.transition || 'cut';
  return transition === 'cut' ? 1 : Math.min(1, frame / Math.max(1, fps * 0.18), (frames - frame) / Math.max(1, fps * 0.18));
};

// Every screenshot stays mounted for the whole composition. Mounting an <Img> per scene lets Chrome
// capture a frame before the new image is decoded and painted, which shows up as a one-frame blank flash.
const ScreenStack = () => {
  const frame = useCurrentFrame();
  return <AbsoluteFill style={{ background: '#111' }}>
    {storyboard.scenes.map((scene, index) => {
      const local = frame - offsets[index];
      const visible = local >= 0 && local < sceneFrames[index];
      return <Img key={scene.id} src={staticFile(scene.screenshot)} style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'contain', opacity: visible ? sceneFade(scene, local, sceneFrames[index]) : 0 }} />;
    })}
  </AbsoluteFill>;
};

const StageBackdrop = () => {
  if (!stageEnabled) return null;
  const bg = stageCfg.background || 'studio-light';
  const blob = stageCfg.blobColor || (theme.accent === '#0f766e' ? '#3b6ef6' : theme.accent);
  const preset = bg === 'studio-dark'
    ? 'linear-gradient(135deg, #0f172a 0%, #1e293b 52%, #0b1120 100%)'
    : bg === 'aurora'
      ? 'linear-gradient(135deg, #e0e7ff 0%, #f5f3ff 48%, #dbeafe 100%)'
      : bg === 'studio-light'
        ? 'linear-gradient(135deg, #eef2ff 0%, #f8fafc 48%, #e2e8f0 100%)'
        : bg;
  const isPreset = ['studio-light', 'studio-dark', 'aurora'].includes(bg);
  return <AbsoluteFill style={{ background: preset, overflow: 'hidden' }}>
    {isPreset ? <>
      <div style={{ position: 'absolute', left: -140 * uiScale, top: -120 * uiScale, width: 380 * uiScale, height: 380 * uiScale, borderRadius: '50%', background: hexToRgba(blob, bg === 'studio-dark' ? 0.28 : 0.72), filter: `blur(${2 * uiScale}px)` }} />
      <div style={{ position: 'absolute', right: -110 * uiScale, bottom: -130 * uiScale, width: 340 * uiScale, height: 340 * uiScale, borderRadius: '50%', background: hexToRgba(blob, bg === 'studio-dark' ? 0.24 : 0.8), filter: `blur(${2 * uiScale}px)` }} />
    </> : null}
  </AbsoluteFill>;
};

const SceneAudioAndOverlays = ({ scene, meta, frames }) => {
  const frame = useCurrentFrame();
  return <AbsoluteFill style={{ opacity: sceneFade(scene, frame, frames) }}>
    <Audio src={staticFile(meta.audio)} />
    <Caption meta={meta} scene={scene} />
  </AbsoluteFill>;
};

const StepwiseStageOverlays = ({ scene, meta, index, frames }) => {
  const frame = useCurrentFrame();
  return <AbsoluteFill style={{ opacity: sceneFade(scene, frame, frames) }}>
    <FocusLayer scene={scene} meta={meta} frames={frames} />
    <StepClickLayer scene={scene} meta={meta} frames={frames} />
  </AbsoluteFill>;
};

const Tutorial = () => {
  const frame = useCurrentFrame();
  const cam = evaluateCamera(frame);
  const prevCam = camMotionBlur > 0 && frame > 0 ? evaluateCamera(frame - 1) : cam;
  const totalScale = stageScale * cam.zoom;
  const tx = (compWidth / 2 - cam.x) * totalScale;
  const ty = (compHeight / 2 - cam.y) * totalScale;
  const velocity = camMotionBlur > 0
    ? Math.hypot((cam.x - prevCam.x) / compWidth, (cam.y - prevCam.y) / compHeight) * 60 + Math.abs(cam.zoom - prevCam.zoom) * 18
    : 0;
  const blurPx = camMotionBlur > 0 ? Math.min(4 * camMotionBlur * uiScale, Math.max(0, velocity - 0.12) * 3.5 * camMotionBlur * uiScale) : 0;
  const useTransform = stageEnabled || cameraEnabled;
  const stageCardStyle = useTransform
    ? {
        position: 'absolute',
        left: 0,
        top: 0,
        width: compWidth,
        height: compHeight,
        transformOrigin: 'center center',
        transform: `translate(${tx}px, ${ty}px) scale(${totalScale})`,
        borderRadius: stageRadius,
        overflow: stageEnabled ? 'hidden' : 'visible',
        boxShadow: stageEnabled && stageCfg.shadow !== false
          ? (typeof stageCfg.shadow === 'string' ? stageCfg.shadow : `0 ${22 * uiScale}px ${64 * uiScale}px rgba(15,23,42,.22), 0 ${4 * uiScale}px ${16 * uiScale}px rgba(15,23,42,.08)`)
          : 'none',
        filter: blurPx >= 0.08 ? `blur(${blurPx.toFixed(2)}px)` : 'none',
      }
    : { position: 'absolute', inset: 0 };

  return <AbsoluteFill style={{ background: stageEnabled ? '#f8fafc' : '#000' }}>
    <StageBackdrop />
    <div style={stageCardStyle}>
      <ScreenStack />
      {presentation === 'stepwise' ? storyboard.scenes.map((scene, index) => (
        <Sequence key={`step-${scene.id}`} from={offsets[index]} durationInFrames={sceneFrames[index]}>
          <StepwiseStageOverlays scene={scene} meta={manifest.scenes[index]} index={index} frames={sceneFrames[index]} />
        </Sequence>
      )) : null}
      {presentation === 'continuous' ? <ContinuousPointer zoom={cam.zoom} /> : null}
    </div>
    {storyboard.scenes.map((scene, index) => (
      <Sequence key={scene.id} from={offsets[index]} durationInFrames={sceneFrames[index]}>
        <SceneAudioAndOverlays scene={scene} meta={manifest.scenes[index]} frames={sceneFrames[index]} />
      </Sequence>
    ))}
    <CurrentTask />
    <MethodCard />
  </AbsoluteFill>;
};

const Root = () => (
  <Composition id="Tutorial" component={Tutorial} durationInFrames={totalFrames} fps={fps} width={storyboard.viewport.width} height={storyboard.viewport.height} />
);

registerRoot(Root);
