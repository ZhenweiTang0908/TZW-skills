# Animation guidelines

Motion must explain the operation, not decorate it. The renderer draws no cursor by default; the only in-scene motion is the focus outline unless a click action explicitly opts into a brief click cue.

- Prefer one continuous scene for each stable page state. Narration segments change the focus within that scene; do not cut simply because the narration changes sentence.
- Focus the target that the current narration segment talks about, and hold that focus for the whole segment instead of flashing it on every action. Crossfade between segment targets with roughly 0.2 second fades; never strobe an outline on and off. A segment's focus target is its explicit `highlight` action when present, otherwise the last target it moves to or clicks.
- Make the focus unmistakable: an accent outline with a soft glow, a subtle inner light ring for contrast, and a gentle dim over everything outside the outline. Keep the dim shallow enough that surrounding context stays readable, and never hide labels or input contents.
- Keep the focus rectangle still while a segment is on screen. It must not drift, resize, or blink between frames.
- Narration must not describe pointer movement or hovering. If the operation genuinely depends on a click causing a visible result, the click may set `showCursor: true`; after the target is focused, the renderer briefly shows a cursor and one click ripple, then removes it. Do not add this cue to routine clicks.
- `move` and `click` actions still run in the browser during capture so later scenes open in the right state. They are not rendered unless a `click` explicitly sets `showCursor: true`. Give them `syncWith` when they identify what the segment is about.
- A scene whose segment has no focus target is a defect when the narration points at something specific. Add a `highlight` action, or move the segment's target with `move` or `click`.
- Let narration determine scene length. A scene that only repeats a static screenshot after its focus has settled should be shortened.
- Use 200–350 ms crossfades by default. Use cuts when continuity matters and slides only when the product itself changes navigation level.
- Keep captions inside a bottom safe area, at most two lines, with strong contrast and no overlap with important controls.
- Honor the storyboard viewport exactly. Use device scale factor only for capture quality, not layout changes.
- Disable page animations, blinking cursors, random data, live clocks, and network-dependent decorations before screenshots.
- Render at 30 fps unless the storyboard specifies 24–60 fps. Focus fades and scene transitions must change across frames; a video of static stills with no focus change is invalid.
- Themes may set accent color, top/bottom captions, default transition, and focus dim strength through `highlightDim`.
