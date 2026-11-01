# Animation guidelines

Motion must explain the operation, not decorate it. The default presentation is a single continuous walkthrough with a persistent, visible pointer. `stepwise` remains available for explicitly requested slide-like tutorials.

## Continuous presentation

- Treat the full workflow as one take. Scenes are internal state changes, not visible chapters, and must not reset the cursor or present a numbered card.
- Keep one pointer visible across scene boundaries. At the first action it enters from a natural screen edge; afterward every movement starts from the previous pointer position.
- Move the pointer only for a control that will be clicked or that the current narration explicitly introduces. Keep it parked through scenes with no interaction. Never add an exploratory hover, a sweep over a list, or a decorative crossing of the page.
- Keep a compact current-task phrase in the upper-left of the video. Use a few words that describe the active operation and change it with the scene. It should remain secondary to the browser content and must not cover the target control.
- Move before clicking. Give each move enough time to be followed, then place the pointer tip on the center of the actual target. Show a short ripple at the click point.
- Treat coordinates as belonging to one exact capture. After any recapture, resize, crop, or viewport change, recalibrate every target from the new asset; never reuse coordinates from an earlier frame. Extract the rendered frame at each click moment and verify the pointer tip is centered on the visible control.
- Do not draw focus outlines, dim the rest of the screen, or animate callout boxes around targets. The pointer and the real click result explain the interaction.
- Keep the full browser window in view whenever browser chrome matters. Do not shrink the application into a small inset card or crop away the tabs, address bar, or other context needed to follow the workflow.
- Open one new window in the user's existing browser profile for every run. Keep all task-owned tabs in that window; they may be created, selected, changed, or removed freely. Load and operate the real website in the same window that is captured. A browser shell showing an embedded, routed, or replayed screenshot is invalid even when its tabs and address bar are genuine. Capture the complete native window by its recorded window ID with `capture-window.mjs`; prefer leaving the task window behind the user's active app, and use permitted foreground interaction when needed under the Skill's foreground preference. Keep the task window on-screen and restore the original foreground application after the run. Do not draw, clone, splice, composite, replace, or simulate any part of the browser.
- Use a cut or a short crossfade only when the UI state changes. Preserve pointer continuity across that transition. Avoid decorative wipes and repeated establishing shots.
- Captions may stay visible, but they should read as one continuous explanation. Avoid wording such as "now we start step three" unless the user asked for a stepwise tutorial.
- If a page state changes too abruptly to feel continuous, add a brief narration pause or a short visual dissolve; do not manufacture a second cursor or replay the same click.

## Stepwise presentation

- Use one stable screenshot per scene and keep the original per-segment focus behavior: an accent outline and a shallow dim over the surrounding page.
- Focus the target named by the current narration segment and hold it for the segment. Crossfade between targets instead of strobing outlines.
- A click cue may be shown only when the click itself causes a result the viewer must understand. Routine navigation does not need a click animation.
- Number narration segments only when the requested format is explicitly step-by-step.

## Shared rules

- Narration determines timing. Do not leave a static image after its narration has finished unless the action result needs a short hold.
- Keep captions inside a bottom safe area, at most two lines, with strong contrast and no overlap with the active control.
- Honor the storyboard viewport exactly. Device scale factor affects capture quality, never layout.
- Disable page animations, blinking cursors, random data, live clocks, and network-dependent decoration before screenshots.
- Render at 30 fps unless the storyboard specifies 24–60 fps.
- Prefer real target geometry from the DOM or a precisely measured full-window asset. Never estimate a click point and ship it without checking the frame at the click moment.
