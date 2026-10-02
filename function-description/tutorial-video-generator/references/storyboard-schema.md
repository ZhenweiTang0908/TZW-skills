# Storyboard schema

The storyboard is the only authored source of truth. Use JSON, version it, and keep scene IDs stable across regenerations.

## Root fields

- `version`: `1` or `2`; use version 2 for segmented or multilingual narration.
- `title`: non-empty string.
- `language`: `de`, `zh`, `en`, or legacy `auto`; defaults to `de`.
- `baseUrl`: optional HTTP(S) origin; CLI `--base-url` takes precedence.
- `fps`: optional integer from 24 through 60; defaults to 30.
- `ttsSpeed`: optional narration speaking rate from `0.5` through `3`; defaults to `1.2`.
- `fixtures`: optional browser-side mock data installed before every page load; see Fixtures.
- `viewport`: `{ "width": 1280, "height": 720, "deviceScaleFactor": 1 }` with positive integers and scale from 1 through 3.
- `scenes`: non-empty ordered array.

## Scene fields

Each scene requires `id`, `route`, `narration`, and `actions`. Narration may be a legacy string or a language map whose values are strings or `{id,text}` arrays. Action `syncWith` links motion to a narration segment ID.

Use one scene for one continuous, stable page state—not one scene per sentence. Keep multiple narration segments and their actions in that scene while the user can still see the same page. Create a new scene only when the visible state genuinely changes, such as navigation, opening or closing a modal, or changing a form step. This keeps viewer attention continuous.

Capture occurs before scene actions. Actions describe motion displayed over that captured state and, during browser capture, prepare the following state.

Use optional `prepare` actions when a route must be brought to a stable state before its screenshot, for example opening a modal or filling non-sensitive example fields. `prepare` follows the same action schema but is not rendered as tutorial motion. It must not use customer data, secrets, or irreversible submissions.

Supported actions:

- `move`: selector/coordinates plus optional `duration` in seconds. It runs in the browser during capture and, with `syncWith`, marks what the segment is about. Its default duration is 0.45 seconds.
- `click`: selector/coordinates plus optional `button`, `duration`, and `showCursor`. Performed during capture. Set `showCursor: true` only when the click itself must be shown because it causes a visible result; the renderer then briefly shows a cursor and one click ripple after focus settles. Omit it for routine state-setting clicks.
- `highlight`: selector/coordinates plus optional `duration`.
- `fill`: selector plus string `value`; sensitive values must come from a safe fixture, never secrets.
- `press`: selector plus `key`.
- `wait`: `duration` only.

Use either `target` (a stable selector) or numeric `x` and `y`. Prefer `[data-tutorial='...']`; avoid generated class names and positional selectors.

Give the actions that belong to one narration segment the same `syncWith`, ordered as the narration introduces them. They exist to reach the right state during capture and to decide the segment's focus target; only an explicitly opted-in click also gets a short visual click cue.

Each narration segment holds one focused target. The renderer outlines that target for the whole segment and dims the rest of the page, taking the segment's `highlight` action when one exists and otherwise the last `move` or `click` target in that segment. Point one segment at one target so the outline does not jump mid-sentence, and add an explicit `highlight` action when the focus target differs from where the cursor moves.

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

`theme` may set `accent` (hex colour), `captionPosition` (`top` or `bottom`), `transition` (`cut`, `crossfade`, or `slide`), and `highlightDim` (0 through 0.6, the dim applied outside the focused target).

## Example

```json
{
  "version": 2,
  "title": "Time tracking tutorial",
  "language": "de",
  "viewport": { "width": 1280, "height": 720, "deviceScaleFactor": 1 },
  "scenes": [{
    "id": "select-project",
    "route": "/dashboard",
    "readySelector": "[data-tutorial='project-select']",
    "narration": { "de": [
      { "id": "choose-project", "text": "Wählen Sie zuerst Ihr Mandat aus." },
      { "id": "choose-date", "text": "Wählen Sie anschließend das Datum." }
    ] },
    "actions": [
      { "type": "move", "target": "[data-tutorial='project-select']", "duration": 0.8 },
      { "id": "open-project", "type": "click", "target": "[data-tutorial='project-select']", "showCursor": true, "syncWith": "choose-project" }
    ],
    "transition": "crossfade"
  }]
}
```

Capture writes resolved geometry. Generation records scene and segment timing, cache state, actual model/voice, fallback use, and tail cleanup. Selectors must resolve to one visible element unless `allowMultiple` is explicitly true.
