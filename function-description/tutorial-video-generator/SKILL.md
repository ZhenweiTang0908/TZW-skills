---
name: tutorial-video-generator
description: Create reproducible narrated tutorial videos for web applications from real UI screenshots, scripted UI interactions, optional click cues, scene-level TTS, subtitles, and deterministic Remotion rendering. Invoke only when the user explicitly asks for this skill or explicitly asks for a narrated product walkthrough; never select it on your own initiative. Running it authorizes the paid text-to-speech calls it needs.
metadata:
  author: NiuNiu Tang
  version: "0.9.1"
---

# Tutorial Video Generator

Build a tutorial as a deterministic artifact from a JSON storyboard. Use real application states and repeatable motion; never synthesize the product UI with a video model.

## Invocation and authorization

Invoke this skill only on an explicit request: the user names it, or the user asks for a narrated walkthrough of their own product. Never start it on your own initiative, and never read a passing mention of demo videos, screenshots, or product tours as a request for it.

That explicit request is also the authorization for the paid narration calls. While the skill runs, generate the text-to-speech audio without asking for separate approval. It is still not a licence to retry endlessly: one fallback attempt per segment, then stop with a precise error.

## Defaults

```yaml
tts_provider: AIHubMix
tts_model: gemini-3.8-flash-lite-tts
tts_voice: Kore
tts_fallback_model: gpt-4o-mini-tts
tts_fallback_voice: cedar
tts_speed: 1.2
tts_endpoint: https://api.inferera.com/v1/audio/speech
tts_base_url: ${AI_HUB_BASEURL}
tts_api_key: ${AI_HUB_APIKEY}
rendering: Playwright + Remotion
timing: per-scene-audio
language: de
viewport: 1280x720
fps: 30
codec: H.264
```

Credentials come from the `ENV` file in this skill directory; real environment variables win.

## Credentials

This skill keeps its own environment variables in the `ENV` file at the skill root. Always use that file for `AI_HUB_BASEURL` and `AI_HUB_APIKEY`; do not assume the variables are already exported in the shell.

```env
AI_HUB_BASEURL=https://api.inferera.com/v1
AI_HUB_APIKEY=your-key
```

`generate-voice.mjs` loads this file before any provider call, so `build`, `voice`, and `--mock` runs work without exporting anything manually. One `KEY=VALUE` per line, `#` starts a comment, optional surrounding quotes are stripped, and blank values are ignored. A variable that is already set in the real environment wins over the file, which is what CI and automated tests should use.

`AI_HUB_BASEURL` is the API base and `AI_HUB_APIKEY` is the bearer token. Speech is posted to `https://api.inferera.com/v1/audio/speech` with `Authorization: Bearer`, `Content-Type: application/json`, and a body of `model`, `voice`, `input`, `response_format: "wav"`, and `language`. The runtime appends `/audio/speech` to the base and normalizes the common spellings, so `https://api.inferera.com`, `https://api.inferera.com/v1`, and the full endpoint all resolve to the same URL. Keep the base in the file instead of hard-coding the endpoint in a project.
Never commit, print, paste, or copy values from `ENV` into storyboards, manifests, logs, or any other file. The file is listed in this skill's `.gitignore` and is expected to exist only on the machine that runs the build.

## Data and fixtures

A tutorial must never render real business data. Default to mock data: a local fixture this skill installs before the page loads, the project's own demo mode, or data the user explicitly named for this walkthrough.

- Prefer the project's demo mode or local seed script. When it has none, author a fixture in the storyboard and let the capture install it before the app boots.
- Keep mock values obviously fake, deterministic, and rich enough to demonstrate the workflow. Never use real names, emails, customer records, totals, identifiers, or production screenshots.
- Never point capture at production data, a live tenant, or a customer account, and never read production records to build a fixture.
- If the workflow cannot be shown without data and neither a mock source nor explicit user-provided data exists, stop and ask for it instead of continuing.

Storyboards declare browser-side mock data through root `fixtures`; see [references/storyboard-schema.md](references/storyboard-schema.md).

## Workflow

1. Inspect source and routes to trace the requested workflow. Do not create accounts, seed data, automate login, or require interactive recording.
2. Create `storyboard.json` as the single source of truth. Follow [references/storyboard-schema.md](references/storyboard-schema.md), draft concise narration with [references/narration-guidelines.md](references/narration-guidelines.md), then run `validate` and `doctor`.
3. Capture stable states with `capture-scenes.mjs`. Treat a stable page state as one continuous scene even when it has several narration segments and focus changes. Wait for an explicit ready selector, disable incidental motion, capture the state shown during narration, resolve target geometry, then perform actions that prepare the next state.
4. Generate narration per phrase at the default 1.2x speaking rate, concatenate it per scene, and use measured segment durations for subtitles and synchronized actions. Read [references/tts-and-timing.md](references/tts-and-timing.md) before changing provider or pacing behavior.
5. Render with `render-tutorial.mjs`. Apply whole-segment target focus, scene transitions, narration, and captions according to [references/animation-guidelines.md](references/animation-guidelines.md). The renderer hides the cursor by default; mark only causally important click actions with `showCursor: true` when the click itself must be visible.
6. Run `inspect-output.mjs` and fix every reported error before delivery. Check tail bursts/clipping, timeline continuity, subtitle coverage, viewport, H.264 encoding, and audio/video duration.

## Commands

The runtime is self-contained in this skill directory. Use the unified entrypoint from any working directory; it resolves Playwright, Remotion, React, and Chromium from the skill itself. Point `--output` at the target project's disposable tutorial build directory.

`package.json` and `package-lock.json` are the committed dependency declarations. Never commit `node_modules/`; it is excluded by this skill's `.gitignore`. After cloning or moving the skill to a new machine, prepare the local runtime once:

```bash
npm ci
npm run setup
```

The setup command installs Playwright Chromium below this skill's own `node_modules` rather than a project or global dependency directory.

```bash
node scripts/tutorial-video.mjs build /path/to/storyboard.json --base-url http://127.0.0.1:3000 --output /project/tutorial-output
```

German is the default. Use `--language en` for one alternate language or `--languages de,en,zh` for batch output. Use `--scene`, `--force`, `--reuse-screenshots`, `--update-baseline`, `--theme`, and `--pricing` only when needed. Individual `validate`, `doctor`, `capture`, `voice`, `render`, and `inspect` subcommands support resuming. Add `--mock` in tests so no API credit is consumed.

## Safety and failure behavior

- Read credentials only from `AI_HUB_BASEURL` and `AI_HUB_APIKEY`, loaded from the `ENV` file in this skill directory. Never print, persist, interpolate into generated files, or commit them.
- Real TTS generation is a paid external operation, and running this skill is the user's authorization for those calls. Generate the narration audio without asking again, but never place calls outside an explicitly requested run and never retry in a loop.
- On primary TTS failure or failed audio quality checks, try the fallback once and record the actual model and voice in the manifest. Do not silently loop.
- Stop with a precise scene/action error when a selector, page load, dependency, codec, or API response is invalid. Do not guess coordinates unless the storyboard explicitly provides them.
- Resolve Playwright, Chromium, Remotion, and React from this skill's own installed runtime. Require system `ffmpeg` and `ffprobe`; report missing tools clearly.

## Deliverables

Produce the finished video, its subtitle track, a poster frame, a build manifest, quality and build reports, per-scene and per-segment audio, the captured screenshots, visual diffs, baselines, and a disposable build cache. Do not prescribe the file names; treat them as an internal detail of the output directory. Keep all build state inside the output directory.

Report results by artifact role and by the output directory. Never state the names of the produced files in the response.
