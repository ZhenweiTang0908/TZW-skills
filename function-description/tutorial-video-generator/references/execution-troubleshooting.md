# Execution and recovery

## Discover the browser before declaring it unavailable

Discover capabilities with `await browser.capabilities.list()`. Do not infer capability availability from `JSON.stringify(browser)` or `Object.keys`: API methods may serialize as empty objects while remaining fully callable. Test the documented capability directly before reporting that management is missing.

Separate ordinary HTTP(S) tab control from privileged Chrome surfaces. A policy rejection for `chrome://extensions` does not establish that window management, tab claiming, or normal website DOM operations are broken. Preserve the exact scope of the rejection. If the rejection explicitly forbids alternate surfaces or indirect execution, stop that operation and retain the handoff; do not try native input, AppleScript, raw CDP, or another surface to achieve it.

After requesting a manual handoff, wait for completion evidence or the user's completion message. A tab title or URL remaining unchanged cannot prove whether an extension was installed. Do not repeatedly poll the same unchanged inventory, repeatedly restate the handoff request, or treat “I am handling it” as completion. Continue independent authorized preparation and report the blocked operation once when no independent work remains.

The Chrome extension browser may be exposed through the connected browser runtime rather than a separately named browser tool. Read its returned API documentation. A browser handle obtained through `cua.getBrowser` can expose `capabilities`, `tabs`, and `user`, including the management capability. Using its documented `tab.playwright` methods is DOM control; it is different from native CUA mouse or keyboard simulation. Preserve any user restrictions on native input.

Inspect existing windows before creating one. Save the run-owned Chrome window ID, initial tab ID, macOS CGWindow ID, initial foreground app, and original Chrome window IDs in the output directory. Reuse those handles during recovery. Do not create another window until inspection proves the old one is gone. Keep unrelated tab names and window titles out of persisted logs.

Chrome's bookmarks-bar preference can affect the whole profile. Record its original visibility and restore it during cleanup. Do not claim original windows are unchanged without accounting for profile-wide settings. Native browser-chrome actions are subject to the user's input restrictions; they are not a substitute for page DOM control.

## Separate controller latency from page failure

In an observed macOS extension session, a read-only page request returned in 33 seconds and a DOM snapshot in 30 seconds. A 15–20 second tool timeout killed the JavaScript kernel first. That was not evidence of a broken website or missing browser control.

- Use a 60-second tool lifetime for one browser operation. Keep individual waits bounded and provide a progress update between calls.
- Apply this lifetime to recovery and setup calls too, especially when a previous request is still pending. Do not revert to a 10-second outer timeout merely because a metadata call was fast earlier.
- Split binding, navigation, load checks, DOM reads, and actions into separate calls. Print a short stage marker before the uncertain operation and catch its actual error.
- After a navigation timeout, inspect the existing tab URL and application state before navigating again. The navigation may already have succeeded.
- Preserve browser and tab handles after an operation error. Reset the runtime only when required by the tool or when handles are proven stale. After a forced reset, follow bootstrap instructions before reconnecting to the same tab.
- If `user.claimTab` appears slow, diagnose it alone. For a tab already owned by this run, the documented `browser.tabs.get(id)` can recover its handle. Never use this to bypass a permission or ownership rejection.
- A failed DOM snapshot does not prove every page action is broken. Try one small read-only locator query using the full tool lifetime.
- A loaded title or screenshot proves only what it shows. Confirm aiFind's intended application state rather than inferring it from a title.

If a full-lifetime operation still fails, read the runtime's troubleshooting documentation and test one discriminating hypothesis. Do not repeat identical short calls or switch to prohibited native input.

A download event wait combined with a click exceeded 60 seconds in this session, while a standalone click returned successfully in 34 seconds. The reason for that event-path delay is not established. Do not claim that a click proves a completed download. Check the download artifact or native dialog before repeating; keep page-read, click, event, and artifact-save outcomes distinct in the run log.

## Separate sandbox access from macOS privacy permission

`CGPreflightScreenCaptureAccess()` can return false in a restricted execution context. It cannot identify the cause by itself. If the first window-list command reports unavailable screen access, use the host's authorization flow to retry that same read-only command. If the authorized command lists windows and a targeted capture succeeds, record that capture requires authorized execution; do not send the user to change macOS settings unnecessarily.

If authorized execution still fails, distinguish a missing permission from a minimized or off-screen task window. Use permitted foreground automation to restore task-window state when needed; foreground activation does not grant Screen Recording permission. Preserve explicit tool refusals and required permission handoffs.

Use `capture-window.mjs list --app "Google Chrome" --json` and parse JSON when mapping the run-owned window. Human-readable output contains spaces in application names and titles; splitting it on whitespace can map the wrong window. Do not discover a target by trial captures of unrelated windows.

Recheck screenshot pixel dimensions after browser-chrome changes. Even small outer-window changes require consistent recapture and coordinate calibration. A native capture can include a controller's injected pointer or debugging banner; inspect for these before accepting a scene for the tutorial. Do not call a diagnostic screenshot a finished scene merely because its file exists.

## Planning is not capture readiness

Before a fully automated run, map each required operation to an advertised, documented control method. Check control coverage before creating recording state or making paid narration calls. In particular, `management` window/tab organization and successful HTTP(S) navigation do not imply access to privileged Chrome pages or extension install/uninstall controls. An unsupported core operation is an automation blocker, not an invitation to repeatedly ask the user to perform the recording. Report that gap once; continue only independent preparation or an explicitly accepted partly manual workflow. Never claim that this preflight check itself supplies the missing control capability.

`validate` checks structure. `doctor --stage preflight` allows planned but missing assets and reports `captureReady: false`. After real capture and coordinate calibration, run `doctor --stage captured`; it fails on missing or invalid PNG assets, pixel-size mismatches, missing task labels, and unresolved or out-of-window targets.

The unified build runs this gate before paid narration. A scene with no click may intentionally keep its cursor parked; do not add meaningless movement to satisfy a warning. Asset validation cannot prove screenshot provenance or complete interaction coverage: check those from the live run and final rendered video.

The build also runs `check-render-runtime.mjs` before narration. It checks ffmpeg, ffprobe, and an actual headless Chromium launch without loading workflow pages. In this session rendering failed with SIGABRT inside the sandbox and the identical authorized build passed. Use the host authorization flow for that process restriction; do not replace the renderer with still frames. Final inspection checks AAC audio and the storyboard frame rate as well as H.264 video.

Test both a fresh render and a repeated cached build. The voice stage rewrites its manifest, so the renderer must restore video metadata, framing, capture provenance, and theme even when reusing the existing MP4. A cache hit that merely sets `renderHit` leaves the manifest incomplete and can fail final inspection. `npm test` includes this regression and fixture-based asset, timing-format, and capture checks without paid TTS.

## Scope data checks to the state being captured

A production-hosted empty download page or extension-management page does not itself contain production candidate records. Capture authorized setup states while resolving later data needs. Keep the Skill's business-data restrictions for scenes that actually display candidate data. Do not invent a mock aiFind UI, silently modify records, or substitute old screenshots to bridge a missing dataset.

User instructions take precedence over Skill defaults within the applicable safety rules. Do not interpret live browser operation as permission to create a fake interface or expose credentials. If data authorization is genuinely missing at the export boundary, state exactly which data and destination need clarification; do not ask the user to repair unrelated setup.
