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
const uiScale = storyboard.viewport.width / 1440;
const fontFamily = '"PingFang SC", "Noto Sans CJK SC", Arial, sans-serif';
const offsets = manifest.scenes.map((scene) => Math.round(scene.start * fps));
const sceneFrames = manifest.scenes.map((scene, index) => Math.max(1, Math.round(scene.end * fps) - offsets[index]));
const totalFrames = Math.max(1, Math.round(manifest.duration * fps));
const clamp = (value, min, max) => Math.max(min, Math.min(max, value));
const ease = (value) => 1 - Math.pow(1 - clamp(value, 0, 1), 3);
const pointOf = (action) => action.rect
  ? { x: action.rect.x + action.rect.width / 2, y: action.rect.y + action.rect.height / 2 }
  : { x: action.x, y: action.y };

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
    const start = segment.start * fps + fps * 0.12 + earlier;
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

const PointerSvg = ({ x, y, opacity = 0.98 }) => (
  <svg width="30" height="38" viewBox="0 0 30 38" style={{ position: 'absolute', left: x - 4, top: y - 3, opacity, zIndex: 9, filter: 'drop-shadow(0 3px 5px rgba(0,0,0,.55))' }}>
    <path d="M2 1v29l8-7 5 13 5-2-5-13h11z" fill="white" stroke="#07111f" strokeWidth="2.4" strokeLinejoin="round" />
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
  let previous = { x: storyboard.viewport.width - 70, y: storyboard.viewport.height - 56 };
  for (const [sceneIndex, scene] of storyboard.scenes.entries()) {
    const meta = manifest.scenes[sceneIndex];
    const windows = actionWindows(scene.actions || [], meta.segments || [], sceneFrames[sceneIndex]);
    for (const window of windows) {
      const point = pointOf(window.action);
      if (!Number.isFinite(point.x) || !Number.isFinite(point.y)) continue;
      const start = offsets[sceneIndex] + window.start;
      const end = offsets[sceneIndex] + window.end;
      events.push({ action: window.action, start, end, from: previous, to: point });
      previous = point;
    }
  }
  return events;
})();

const ContinuousPointer = () => {
  const frame = useCurrentFrame();
  if (!globalEvents.length) return null;
  let active = null;
  for (const event of globalEvents) if (event.start <= frame) active = event;
  const event = active || globalEvents[0];
  const progress = active && frame < event.end ? ease((frame - event.start) / Math.max(1, event.end - event.start)) : 1;
  const x = event.from.x + (event.to.x - event.from.x) * progress;
  const y = event.from.y + (event.to.y - event.from.y) * progress;
  const visible = frame >= Math.max(0, globalEvents[0].start - fps * 0.2);
  return <>
    {visible ? <PointerSvg x={x} y={y} /> : null}
    {globalEvents.filter((item) => item.action.type === 'click').map((item, index) => {
      const age = frame - item.end;
      if (age < 0 || age > fps * 0.46) return null;
      const ripple = clamp(age / (fps * 0.46), 0, 1);
      return <div key={index} style={{ position: 'absolute', left: item.to.x - 12, top: item.to.y - 12, width: 24, height: 24, borderRadius: '50%', border: `3px solid ${theme.accent}`, opacity: 0.88 * (1 - ripple), transform: `scale(${0.7 + ripple * 2.1})`, boxShadow: `0 0 22px ${theme.accent}aa`, zIndex: 8 }} />;
    })}
  </>;
};

const CurrentTask = () => {
  const frame = useCurrentFrame();
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

const Caption = ({ meta }) => {
  const frame = useCurrentFrame();
  const time = frame / fps;
  const segment = (meta.segments || []).find((item) => time >= item.start && time <= item.end);
  if (!segment) return null;
  const fadeIn = clamp((time - segment.start) / 0.16, 0, 1);
  const fadeOut = clamp((segment.end - time) / 0.14, 0, 1);
  const position = theme.captionPosition === 'top' ? { top: 24 * uiScale } : { bottom: 24 * uiScale };
  return <div style={{ position: 'absolute', left: '6%', right: '6%', ...position, textAlign: 'center', opacity: Math.min(fadeIn, fadeOut) }}>
    <div style={{ display: 'inline-block', maxWidth: 1260 * uiScale, padding: `${10 * uiScale}px ${18 * uiScale}px`, borderRadius: 10 * uiScale, background: 'rgba(0,0,0,.8)', color: 'white', fontFamily, fontSize: 34 * uiScale, fontWeight: 500, lineHeight: 1.35, textShadow: '0 2px 7px #000' }}>{segment.text}</div>
  </div>;
};

const SceneVisual = ({ scene, meta, index, frames }) => {
  const frame = useCurrentFrame();
  const transition = scene.transition || theme.transition || 'cut';
  const fade = transition === 'cut' ? 1 : Math.min(1, frame / Math.max(1, fps * 0.18), (frames - frame) / Math.max(1, fps * 0.18));
  return <AbsoluteFill style={{ opacity: fade, background: '#111' }}>
    <Img src={staticFile(scene.screenshot)} style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
    <Audio src={staticFile(meta.audio)} />
    {presentation === 'stepwise' ? <FocusLayer scene={scene} meta={meta} frames={frames} /> : null}
    {presentation === 'stepwise' ? <StepClickLayer scene={scene} meta={meta} frames={frames} /> : null}
    <Caption meta={meta} />
  </AbsoluteFill>;
};

const Tutorial = () => (
  <AbsoluteFill style={{ background: '#000' }}>
    {storyboard.scenes.map((scene, index) => (
      <Sequence key={scene.id} from={offsets[index]} durationInFrames={sceneFrames[index]}>
        <SceneVisual scene={scene} meta={manifest.scenes[index]} index={index} frames={sceneFrames[index]} />
      </Sequence>
    ))}
    <CurrentTask />
    <MethodCard />
    {presentation === 'continuous' ? <ContinuousPointer /> : null}
  </AbsoluteFill>
);

const Root = () => (
  <Composition id="Tutorial" component={Tutorial} durationInFrames={totalFrames} fps={fps} width={storyboard.viewport.width} height={storyboard.viewport.height} />
);

registerRoot(Root);
