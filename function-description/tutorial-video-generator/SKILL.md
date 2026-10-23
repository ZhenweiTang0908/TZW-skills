---
name: tutorial-video-generator
description: Create reproducible narrated tutorial videos for web applications from real background-captured browser windows, scripted UI interactions, continuous cursor motion, scene-level TTS, subtitles, and deterministic Remotion rendering. Supports default single-take walkthroughs and optional step-by-step presentations. Invoke only when the user explicitly asks for this skill or explicitly asks for a narrated product walkthrough; never select it on your own initiative. Running it authorizes the paid text-to-speech calls it needs.
metadata:
  author: NiuNiu Tang
  version: "0.12.3"
---

# Tutorial Video Generator

Build a tutorial as a deterministic artifact from a JSON storyboard. Use real application states and repeatable motion; never synthesize the product UI with a video model.

## Invocation and authorization

Invoke this skill only on an explicit request: the user names it, or the user asks for a narrated walkthrough of their own product. Never start it on your own initiative, and never read a passing mention of demo videos, screenshots, or product tours as a request for it.

That explicit request is also the authorization for the paid narration calls. While the skill runs, generate the text-to-speech audio without asking for separate approval. It is still not a licence to retry endlessly: one fallback attempt per segment, then stop with a precise error.

## Output isolation and Git tracking policy

Never let Git track generated video artifacts unless the user explicitly specifies that the resulting video belongs under version control for an exact project purpose. By default, always place all produced assets (rendered MP4s, poster frames, recorded UI screenshots, TTS audio segments, build caches, and test logs) in a disposable temporary directory such as `Temp/` or `Temporary/`, and ensure it is covered by `.gitignore` to prevent accidental commits.

## Defaults

```yaml
tts_provider: AIHubMix
tts_model: gemini-3.8-flash-lite-tts
tts_voice: Kore
tts_fallback_model: gpt-4o-mini-tts
tts_fallback_voice: cedar
tts_speed: 1.0
tts_endpoint: https://api.inferera.com/v1/audio/speech
tts_base_url: ${AI_HUB_BASEURL}
tts_api_key: ${AI_HUB_APIKEY}
rendering: Playwright + Remotion
timing: per-scene-audio
language: de
presentation: continuous
frame: browser
viewport: match-captured-window-pixels
fps: 30
codec: H.264
browser_state: clean
window_policy: new-window-per-run
tab_policy: run-owned
browser_control: chrome-extension
capture_mode: background-window
capture_shadow: false
task_label: true
foreground_control: allowed-when-needed
```

## Automation and foreground preference

For this user's tutorial workflow, prefer background DOM control and targeted window capture, and allow necessary foreground interaction through the documented Computer Use APIs. The user prefers complete automation over avoiding all foreground activity. Do not ask the user to click ordinary controls or handle routine file dialogs merely to keep the run in the background. Respect stricter instructions in the current task. Record foreground use, operate only task-owned windows, preserve the initial foreground application, and restore it after the run. This preference does not override tool security refusals, required authentication handoffs, or other higher-priority restrictions; never switch to native input to circumvent an operation explicitly denied by a tool.

## Presentation modes

- `continuous` is the default. Build the whole workflow as one uninterrupted walkthrough. Keep one cursor across scene boundaries, move it to each target before a click, and do not reset it when the underlying page state changes. Do not draw focus boxes, dim the page, or show numbered step cards. Captions may remain, but they should read as one continuous explanation.
- Treat cursor motion as a limited budget. The pointer stays still unless it is moving toward a control that will actually be clicked, or toward a control the current narration explicitly names. Do not wander, hover over empty space, sweep across lists, or add decorative transitions. If a scene has no click, leave the pointer parked at its previous position.
- A continuous video must render its synchronized pointer path from the storyboard actions. Never deliver a still-frame fallback that drops pointer motion; if the normal renderer fails, repair its rendering environment or stop with the specific blocker. Before delivery, inspect the video at scene transitions and click moments to confirm the pointer visibly travels between real targets and stays parked during narration with no action.
- Show a short, persistent current-task phrase in the upper-left of the video. Change it at scene boundaries to name what the viewer is doing, for example "打开 Shortlists" or "导出 CSV". Keep the phrase to a few words and make it readable without covering the control being demonstrated.
- Scale overlay typography with composition width. At a 1440px playback width, target 28px for the current-task phrase and 34px for subtitles; a 2880px render therefore uses 56px and 68px. Check a reduced playback preview rather than judging readability only at native resolution. Keep captions to two lines when possible.
- For method comparisons, set root `methodCard` with `label`, `title`, `status`, `detail`, and `accent` (strings or language maps). The renderer keeps it in the lower-left safe area above the subtitles. Use it to state the capture boundary honestly, such as whether the result includes browser chrome or whether the method takes foreground focus.
- `stepwise` keeps the original segmented presentation: a stable screenshot per scene, per-segment focus targets, optional cursor click cues, and visible scene transitions. Use it only when the user explicitly asks for discrete steps or a slide-like tutorial.
- Start every narrated tutorial with a brief host greeting before the walkthrough begins. For Chinese tutorials, use Lily as the host and open with: “你好，我是 Lily。在这一份教程中，我会带你使用【产品或功能】完成【教程目标】，并说明如何将结果导出为【目标格式或去向】。” Replace the bracketed phrases with the current tutorial topic; do not keep stale product or format names. For other requested languages, translate this same concise greeting and retain Lily as the host. Add the opening as a narration segment at the start of the first scene, with a matching short task label, without introducing a title card or interrupting the continuous presentation.
- Scene records still exist in continuous mode as internal state changes. They are not user-facing chapters. Prefer direct cuts between captured UI states to avoid black flashes; use a crossfade only when it blends overlapping footage without exposing black. Never restart the cursor or repeat the same click because a new scene begins.

## Browser framing

- Open a new Chrome window in the user's existing browser profile for every Skill run. The new window may contain multiple tabs, but every tab opened, closed, or selected during the run must belong to that run-owned window. Hide the bookmarks bar and do not use the user's existing work window.
- Launch the new window in the background when the platform permits it, then keep that same window and record its ID before adding workflow tabs. Never substitute a temporary browser profile when the workflow needs existing login state.
- Load the real website in that same browser window, perform the real interaction there, and capture that exact window directly at each required state. The webpage, login state, tabs, address bar, toolbar, extensions, and pointer target must all belong to the same live browser window.
- Never display a previously captured page image inside another browser and then screenshot that browser. Never rebuild a browser scene from a page screenshot, even when the outer browser chrome is genuine. Keep every browser-window capture genuine. Do not show the automation pointer in the finished video.
- `frame: browser` is the default for continuous walkthroughs. The composition viewport should match the full browser window, including tabs and the address bar when available. Use the captured pixel dimensions; a 1440×903 logical window on a 2× display is normally a 2880×1806 composition. Do not shrink the whole window into a 16:9 content card.
- Playwright page screenshots contain the page viewport, not native browser chrome. They are not valid assets for `frame: browser`. Provide a `scene.asset` path to a direct system capture of the same live browser window in which the website is actually loaded and operated.
- `frame: page` is available for embedded apps or when browser chrome is intentionally excluded. In that mode the composition may use the page viewport only; do not letterbox it into a smaller preview.
- Never present a cropped page fragment as if it were the full browser. Keep whole-window context unless the user explicitly asks for a detail close-up.

## Background window capture

For `frame: browser`, use background targeted window capture as the standard on macOS. Control and capture are separate decisions. Prefer documented browser DOM operations; necessary foreground interaction is allowed under the foreground preference above. Continue to capture the genuine task window by ID, and avoid activating it merely for a screenshot when background capture works.

1. Open one new Chrome window in the user's existing profile with `new-window`. The helper uses `open -g -n`, restores the previously frontmost app immediately, and returns both the macOS `windowId` and Chrome `chromeWindowId`. The window may contain multiple run-owned tabs. Keep it unminimized.
2. Record both identifiers before the first scene. The CGWindow ID is fixed for capture; the Chrome ID is used only to close that run-owned window. If the run creates another window, enumerate again and record both new IDs.
3. Create or select tabs only through the browser-control layer. Tabs may be added, removed, or changed freely when they belong to this run-owned window. After each stable UI state, capture by the macOS `windowId`. Use `capture-window.mjs`, which calls `screencapture -l`, omits the shadow by default, reads the output dimensions, and never activates the target OS window.
4. Capture the complete on-screen window even when another app is in front. The target may be occluded by the active app; it must not be minimized or moved off-screen.
5. Recalibrate every pointer coordinate against the newly captured window. Reject a capture whose dimensions differ from the storyboard viewport multiplied by the display scale.
6. At the end of the run, close only the run-owned Chrome window with `close-browser-window.mjs`, using the Chrome `chromeWindowId` returned by `new-window`. The close command restores the previously frontmost app and must not call Computer Use.

The native screenshot shows the window's currently active tab. The Skill may select its own tab through the browser-control layer, so it can deliberately switch among run-owned tabs without clicking the browser chrome or raising the OS window. Do not change tabs belonging to the user's other windows.

```bash
node scripts/open-browser-window.mjs --url https://app.example.com
node scripts/capture-window.mjs list --app "Google Chrome"
node scripts/capture-window.mjs capture --window-id 123 --output captures/01-dashboard.png
node scripts/close-browser-window.mjs --chrome-window-id 456
```

Define the intended target in root `capture` and, when a workflow needs a different window, override it on a scene with `captureTarget`. Full-window scenes still reference the resulting file through `scene.asset`. The capture stage must stop when a browser-framed scene lacks an asset; silently falling back to a Playwright page screenshot is invalid.

Use `--app` when listing windows and do not persist a full unrelated window list; window titles can contain personal or business information. The run-owned window ID is fixed for that run. Record it once and do not reuse it in a later run.

The first use may require Screen Recording permission for the terminal or host that runs Codex. If `screencapture` fails, first distinguish sandbox restrictions from macOS permission as described in the troubleshooting reference. Foreground activation does not grant missing Screen Recording permission. Restore a task window when needed only through permitted controls, and never bypass an explicit security refusal.

### Preferred control path

When the connected Chrome extension browser exposes the `management` capability, use it for the whole interaction instead of Computer Use:

1. Call `browser.capabilities.get("management")`.
2. Create a blank window with `management.windows.create({ focused: false, state: "normal", width: 1440, height: 903 })`.
3. Read its initial tab ID from `management.windows.getAll({ populate: true })`, then claim it with `browser.user.claimTab(String(tabId))`.
4. Navigate with `tab.goto(url)` and prefer `tab.playwright` locators, `fill`, `click`, and keyboard actions. Use documented foreground Computer Use for necessary interactions not covered by the available DOM control, subject to the foreground preference and tool policy.
5. Compare Chrome windows before and after creation to find the new macOS CGWindow ID, then capture that window with `capture-window.mjs`.
6. Close the claimed tab with `tab.close()` when it is the only tab; this closes the run-owned window without bringing it forward. Verify the window no longer appears.

The extension API policy blocks `data:`, `chrome://`, and `chrome-extension://` in `tab.goto`. Use a fresh HTTPS page for the walkthrough. If a required browser-management surface cannot be reached through the extension, stop and report it rather than switching to Computer Use by default.

### Known limitations

- `capture-window.mjs` is a capture primitive, not a browser controller. It does not select a tab, navigate, click, or fill a form. The extension control channel must put the intended state in the target window first.
- One `screencapture -l` call captures one window. A system file picker, permission sheet, or another application dialog is a separate window; capture it with its own `captureTarget`, or use `frame: page` for that scene. Do not splice it onto a browser screenshot.
- The implementation is intentionally macOS-only and requires Screen Recording permission. This is the supported environment for this Skill.
- The build command still requires the operator to obtain each scene asset with `capture-window.mjs` before `capture`/`render`; it does not infer a live browser window from `capture` metadata automatically. This is intentional because switching state requires a control channel.
- Automated checks can verify dimensions and declared capture mode, but cannot prove that a browser screenshot was not composited elsewhere. Keep the live-window capture rule and spot-check transition/click frames.

The preferred extension path avoids foreground takeover for normal page control and capture. For routine system dialogs and browser chrome, use permitted foreground automation when needed rather than assuming a manual handoff. Required authentication handoffs and explicit security refusals still apply. Disclose foreground use in the run report. The `new-window`/`close-window` AppleScript utilities are fallback tools for environments without the extension management capability; they restore focus after window creation and closure.

## Authentication and handoff

Use the user's existing browser profile when the walkthrough depends on an existing session. Every run opens one new window inside that profile; a separate temporary profile is not a substitute because it loses the user's cookies and login state.

- The browser-control layer may create a dedicated tab, select it, remove it, or place it in a task tab group inside the run-owned window. Those are control actions, not side effects of `capture-window.mjs`. Keep the workflow tabs in the one new window and use the same window ID for the run.
- The target tab must be active before a full-window capture. Make the tab active through the browser-control layer; keep the OS window behind the user's current work when possible.
- Before recording, check whether the page is authenticated. If a login, passkey, CAPTCHA, SSO prompt, or consent screen appears, pause automation and hand control to the user. Do not capture the login page and do not enter or reuse stored credentials automatically.
- After the user finishes signing in, wait for the intended application state, confirm the same browser window, and capture a fresh asset. Never use a pre-login screenshot as if it represented the authenticated state.
- If Chrome was not running at the start, launching the existing profile may make a window visible. Disclose that one-time setup step; do not claim the whole run was background-only.
- Keep credentials, recovery codes, tokens, and login-page frames out of storyboards, screenshots, logs, build reports, and the final video.

If authentication expires mid-run, stop at the last stable application state, perform the handoff, then resume from a newly captured asset. Do not try to mask a stale session with screenshots from another tab or profile.

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

Read [references/execution-troubleshooting.md](references/execution-troubleshooting.md) before connecting the browser. It covers browser-capability discovery, staged calls with sufficient tool lifetime, sandbox-aware capture permissions, window ownership, and the difference between planning and capture readiness.

For a requested automated tutorial, verify supported control for every required operation before recording or paid narration. Include browser chrome, extension removal and installation, native file dialogs, tab activation, and hiding the bookmarks bar when the requested workflow needs them. Window creation and HTTP(S) DOM control alone do not prove that extension management is supported. If a core operation is unsupported or explicitly denied, report the exact capability gap once and stop the automated run; do not silently replace it with repeated manual recording handoffs. Preserve the separate required handoffs for authentication, CAPTCHA, and permission prompts. A user may explicitly choose a partly manual workflow, but never assume that choice from general authorization to operate the browser. Do not bypass a tool's security rejection to satisfy automation coverage.

1. Inspect source and routes to trace the requested workflow. Do not create accounts, seed data, automate login, or require interactive recording.
2. Create `storyboard.json` as the single source of truth. Follow [references/storyboard-schema.md](references/storyboard-schema.md), give every continuous scene a short `task` phrase for the upper-left status label, draft concise narration with [references/narration-guidelines.md](references/narration-guidelines.md), then run `validate` and `doctor`.
   For a browser-extension tutorial intended for first-time users, include the installation prerequisite: download and extract the package, open extension management, enable Developer mode when needed, load the extracted folder, and check that the extension is enabled. Explain toolbar pinning when useful. Omit installation only when the user explicitly scopes the video to an already-installed workflow.
3. Open one new Chrome window in the user's existing browser profile. Prefer the extension `management.windows.create({focused:false})` path, claim its initial tab, and operate through `tab.playwright`. Use the `new-window` AppleScript fallback only when the extension management capability is unavailable. Keep all task tabs inside the run-owned window. Prefer background control and targeted capture; use permitted foreground control when needed under the foreground preference. Never route page images through a second browser or replay screenshots. In continuous mode, treat the entire workflow as one visible take even though the renderer stores intermediate states internally.
4. Generate narration per phrase at normal speed by default, concatenate it per scene, and use measured segment durations for subtitles and synchronized actions. Read [references/tts-and-timing.md](references/tts-and-timing.md) before changing provider or pacing behavior.
   Before any paid narration, run `doctor <storyboard> --stage captured` after all real assets and pointer coordinates exist, and `node scripts/check-render-runtime.mjs` to test the renderer process. The default `--stage preflight` is for planning and may report `captureReady: false`; structural validity is not recording completion. The unified build runs both gates automatically.
5. After every screenshot recapture, recalibrate every click against the new full-window asset. Render with `render-tutorial.mjs`. In `continuous` mode, keep one persistent cursor, move it only to targets that will be clicked or that the narration explicitly introduces, and omit focus boxes and step cards. Leave it stationary through scenes without interaction. At each click time, extract a frame and verify that the pointer tip sits on the center of the real control. In `stepwise` mode, apply the legacy whole-segment focus behavior. Follow [references/animation-guidelines.md](references/animation-guidelines.md).
6. Run `inspect-output.mjs` and fix every reported error before delivery. Check tail bursts/clipping, timeline continuity, subtitle coverage, viewport, H.264 encoding, and audio/video duration.
7. Close only the run-owned window after the build is complete. If using the extension path, close its final claimed tab with `tab.close()`; otherwise use `close-window --chrome-window-id ...`. Never use Computer Use to focus or close it. Verify that the user's pre-existing Chrome windows are still open and unchanged. Do not reuse the run-owned window in a later tutorial run.

## Commands

The runtime is self-contained in this skill directory. Use the unified entrypoint from any working directory; it resolves Playwright, Remotion, React, and Chromium from the skill itself. Point `--output` at the target project's disposable tutorial build directory. Window capture is a separate macOS utility and does not open a browser window.

`package.json` and `package-lock.json` are the committed dependency declarations. Never commit `node_modules/`; it is excluded by this skill's `.gitignore`. After cloning or moving the skill to a new machine, prepare the local runtime once:

```bash
npm ci
npm run setup
```

The setup command installs Playwright Chromium below this skill's own `node_modules` rather than a project or global dependency directory.

```bash
node scripts/tutorial-video.mjs build /path/to/storyboard.json --base-url http://127.0.0.1:3000 --output /project/tutorial-output
node scripts/open-browser-window.mjs --url https://app.example.com
node scripts/capture-window.mjs list --app "Google Chrome"
node scripts/capture-window.mjs capture --window-id 123 --output /project/tutorial-output/screenshots/scene-001.png
node scripts/tutorial-video.mjs close-window --chrome-window-id 456
```

German is the default. Use `--language en` for one alternate language or `--languages de,en,zh` for batch output. Use `--scene`, `--force`, `--reuse-screenshots`, `--update-baseline`, `--theme`, and `--pricing` only when needed. Individual `validate`, `doctor`, `capture`, `voice`, `render`, and `inspect` subcommands support resuming. Add `--mock` in tests so no API credit is consumed.

`capture-window.mjs` is deliberately separate from `capture`: the latter prepares browser state and copies full-window assets, while the window utility records the already-open native window without changing focus. `open-browser-window.mjs` returns both Chrome's AppleScript window ID and the macOS CGWindow ID; keep both. Close only with `close-window` and the Chrome window ID. Pass `--shadow` only when a design explicitly needs the macOS shadow effect.

## Safety and failure behavior

- Read credentials only from `AI_HUB_BASEURL` and `AI_HUB_APIKEY`, loaded from the `ENV` file in this skill directory. Never print, persist, interpolate into generated files, or commit them.
- Real TTS generation is a paid external operation, and running this skill is the user's authorization for those calls. Generate the narration audio without asking again, but never place calls outside an explicitly requested run and never retry in a loop.
- On primary TTS failure or failed audio quality checks, try the fallback once and record the actual model and voice in the manifest. Do not silently loop.
- Stop with a precise scene/action error when a selector, page load, dependency, codec, or API response is invalid. Do not guess coordinates unless the storyboard explicitly provides them.
- Resolve capture failures through supported sandbox authorization and task-window controls. Restore a minimized or off-screen task window through permitted foreground automation when necessary. Missing Screen Recording permission, an ambiguous target, or inconsistent dimensions must be resolved before accepting assets. Never bypass a tool security refusal.
- Resolve Playwright, Chromium, Remotion, and React from this skill's own installed runtime. Require system `ffmpeg` and `ffprobe`; report missing tools clearly.

## Deliverables

Produce the finished video, its subtitle track, a poster frame, a build manifest, quality and build reports, per-scene and per-segment audio, the captured screenshots, visual diffs, baselines, and a disposable build cache. Do not prescribe the file names; treat them as an internal detail of the output directory. Keep all build state inside the output directory.

Report results by artifact role and by the output directory. Never state the names of the produced files in the response.
