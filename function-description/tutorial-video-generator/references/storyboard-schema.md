# Storyboard schema

The storyboard is the only authored source of truth. Use JSON, version it, and keep scene IDs stable across regenerations.

## Root fields

- `version`: `1` or `2`; use version 2 for segmented or multilingual narration.
- `title`: non-empty string.
- `language`: `de`, `zh`, `en`, or legacy `auto`; defaults to `de`.
- `presentation`: `continuous` or `stepwise`; defaults to `continuous`. Continuous keeps one visible cursor across scenes and omits focus boxes and step cards. Stepwise uses the legacy segmented focus presentation.
- `frame`: `browser` or `page`; defaults to `browser`. Browser framing keeps the full browser window in view. Page framing captures only the page viewport for embedded or standalone app surfaces.
- `baseUrl`: optional HTTP(S) origin; CLI `--base-url` takes precedence.
- `fps`: optional integer from 24 through 60; defaults to 30.
- `ttsSpeed`: optional narration speaking rate from `0.5` through `3`; defaults to `1.0`.
- `fixtures`: optional browser-side mock data installed before every page load; see Fixtures.
- `capture`: background-window settings: `{ "mode": "background-window", "windowPolicy": "new-window", "app": "Google Chrome", "titleIncludes": "aiFind", "includeShadow": false }`. Each run opens one new Chrome window in the existing profile and may manage multiple tabs inside it. A recorded `windowId` identifies the run-owned window after enumeration.
- `viewport`: positive integer composition pixels. For browser framing, use the exact pixel dimensions reported by `capture-window.mjs`; a 1440×903 logical Retina window commonly produces a 2880×1806 screenshot. Do not force a 16:9 card.
- `scenes`: non-empty ordered array.
- `scene.task`: short string or language map shown in the upper-left current-task label. Continuous tutorials should provide one phrase per scene, for example `"Open Shortlists"` or a `{ "zh": "打开 Shortlists", "de": "Shortlists öffnen" }` map.

## Scene fields

Each scene requires `id`, `route`, `narration`, and `actions`. Narration may be a legacy string or a language map whose values are strings or `{id,text}` arrays. Action `syncWith` links motion to a narration segment ID.

For `frame: browser`, the real website must be loaded and operated in the same live browser window shown by every scene asset. Use a clean window in the user's existing browser profile unless the user explicitly requests isolation. A page screenshot displayed inside a second browser is invalid, as is any browser image assembled from separate parts.

Use `asset` on a scene when a full-window screenshot has already been captured outside Playwright, for example a browser window with tabs and the address bar. For browser scenes, this asset must be a direct, uncomposited capture of the complete native browser window; never splice browser chrome onto a page image. The path is relative to the storyboard file. The capture stage copies that asset into the build instead of taking a page screenshot; use composition-pixel `x`/`y` actions in this mode and recalibrate them after every recapture.

Add optional `captureTarget` to a scene only when that state lives in a different native window. It accepts `windowId`, `app`, `titleIncludes`, and `includeShadow`. Capture every browser asset with `capture-window.mjs`, which uses `screencapture -l` and does not activate the target. A browser-framed scene without `asset` is invalid; page screenshots are reserved for `frame: page`.

The native window screenshot represents the active tab of that window. The Skill may create, remove, and select its own tabs through a browser-control channel so the required tab is active for each capture. Keep those tab operations inside the run-owned window and keep the OS window behind the user's current work when possible.

```json
{
  "id": "open-dashboard",
  "route": "https://app.example.com/dashboard",
  "asset": "captures/01-dashboard.png",
  "narration": { "en": [{ "id": "open", "text": "Open My Shortlists." }] },
  "actions": [{ "type": "click", "x": 386, "y": 544, "syncWith": "open" }]
}
```

Use one scene for one continuous, stable page state—not one scene per sentence. Keep multiple narration segments and their actions in that scene while the user can still see the same page. Create a new scene only when the visible state genuinely changes, such as navigation, opening or closing a modal, or changing a form step. This keeps viewer attention continuous.

Capture occurs before scene actions. Actions describe motion displayed over that captured state and, during browser capture, prepare the following state.

Use optional `prepare` actions when a route must be brought to a stable state before its screenshot, for example opening a modal or filling non-sensitive example fields. `prepare` follows the same action schema but is not rendered as tutorial motion. It must not use customer data, secrets, or irreversible submissions.

Supported actions:

- `move`: selector/coordinates plus optional `duration` in seconds. It runs in the browser during capture and, with `syncWith`, marks what the segment is about. Its default duration is 0.45 seconds.
- `click`: selector/coordinates plus optional `button` and `duration`. In continuous presentation the pointer is visible by default and every click gets one ripple at the actual click point. In stepwise presentation, use `showCursor: true` only when the click itself must be shown.
- `highlight`: selector/coordinates plus optional `duration`.
- `fill`: selector plus string `value`; sensitive values must come from a safe fixture, never secrets.
- `press`: selector plus `key`.
- `wait`: `duration` only.

Use either `target` (a stable selector) or numeric `x` and `y`. Prefer `[data-tutorial='...']`; avoid generated class names and positional selectors.

Give the actions that belong to one narration segment the same `syncWith`, ordered as the narration introduces them. They exist to reach the right state during capture and to decide the segment's focus target; only an explicitly opted-in click also gets a short visual click cue.

In `stepwise` presentation, each narration segment holds one focused target. The renderer outlines that target for the whole segment and dims the rest of the page, taking the segment's `highlight` action when one exists and otherwise the last `move` or `click` target in that segment. Point one segment at one target so the outline does not jump mid-sentence, and add an explicit `highlight` action when the focus target differs from where the cursor moves.

In `continuous` presentation, every `move` and `click` contributes to one persistent pointer path. The pointer starts at its current position, moves to the target, pauses briefly, and clicks. Do not repeat an action simply because a new scene begins. The renderer preserves the pointer position across scene boundaries. Omit hover-only actions: if a scene has no click and the narration does not explicitly point to a new control, give the scene no actions and let the pointer remain parked.

Capture assets from the run-owned new Chrome window. Keep only tabs created for this Skill run, hide the bookmarks bar, and avoid personal profile information or unused pinned extensions. Capture the whole native browser window directly. Drawn, cloned, or composited browser tabs, address bars, and toolbars are not valid browser assets.

Keep narration and `scene.task` generic across realistic data. Use operational phrases such as "选择候选人名单" and avoid example shortlist names, candidate names, fixed record counts, dates, or business identifiers unless the walkthrough is explicitly about that exact record.

The user profile, login state, website, browser chrome, extensions, and interaction target must all come from the same captured live window. Never route, embed, or replay a screenshot inside another browser for capture.

## Fixtures

A tutorial must never be captured against real business data. Use `fixtures` to install local mock data before the app boots, or point the storyboard at the project's own demo mode. Values are deterministic and browser-side only.

```json
"fixtures": {
  "window": { "__TUTORIAL_DATA__": { "projects": [{ "name": "Mandat Demo Nord", "open": 12 }] } },
  "localStorage": { "tutorial.projects": [{ "name": "Mandat Demo Nord", "open": 12 }] },
  "sessionStorage": { "tutorial.step": "review" }
}
```

`window` entries are assigned before any page script runs; `localStorage` and `sessionStorage` entries are written at the same time. String values are stored verbatim and everything else is serialized as JSON.

Fixtures apply to every scene in the storyboard, so keep them small, obvious, and free of real names, records, or identifiers. When a scene needs a different state after load, express it with `prepare` actions instead of adding more fixtures.

## Theme

`theme` may set `accent` (hex colour), `captionPosition` (`top` or `bottom`), `transition` (`cut`, `crossfade`, or `slide`), and `highlightDim` (0 through 0.6, the dim applied outside the focused target in stepwise mode only). Continuous presentation ignores focus dimming and outlines.

## Example

```json
{
  "version": 2,
  "title": "Time tracking tutorial",
  "language": "de",
  "presentation": "continuous",
  "frame": "browser",
  "capture": { "mode": "background-window", "windowPolicy": "new-window", "app": "Google Chrome", "titleIncludes": "Example App" },
  "viewport": { "width": 2880, "height": 1806, "deviceScaleFactor": 1 },
  "scenes": [{
    "id": "select-project",
    "route": "/dashboard",
    "asset": "captures/select-project.png",
    "readySelector": "[data-tutorial='project-select']",
    "narration": { "de": [
      { "id": "choose-project", "text": "Wählen Sie zuerst Ihr Mandat aus." },
      { "id": "choose-date", "text": "Wählen Sie anschließend das Datum." }
    ] },
    "actions": [
      { "type": "move", "x": 920, "y": 742, "duration": 0.8, "syncWith": "choose-project" },
      { "id": "open-project", "type": "click", "x": 920, "y": 742, "syncWith": "choose-project" }
    ],
    "transition": "crossfade"
  }]
}
```

Capture writes resolved geometry. Generation records scene and segment timing, cache state, actual model/voice, fallback use, and tail cleanup. Selectors must resolve to one visible element unless `allowMultiple` is explicitly true. After capture, inspect the frame at each click time and correct every pointer endpoint before rendering the final video.
