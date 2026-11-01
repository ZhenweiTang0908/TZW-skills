# Authoring and visual standard

Read this reference for every tutorial created with this skill.

## Information hierarchy

Apply these priorities in order:

1. **Complete:** include every action, required input, prerequisite, condition, decision, and observable result needed to finish the workflow.
2. **Concise:** remove repeated context, filler, and descriptions of irrelevant interface elements after completeness is secured.
3. **Readable:** make the sequence scannable through stable numbering, short paragraphs, clear separation, and balanced pages.

Do not trade away a necessary detail to make the page look cleaner. Improve the layout instead.

## Step content

Each numbered step should answer the applicable questions:

- What is this step for?
- What exactly should the user click, select, open, or enter?
- What exact value, format, or choice is required?
- Under which condition does the step apply?
- What should the user see afterward?

Use an action-led title followed by compact explanatory prose. In German, prefer direct imperatives and common UI wording, for example `Öffnen Sie ...`, `Wählen Sie ...`, or `Geben Sie ... ein`. Preserve exact interface labels in their original language and typography. Do not translate a button label if the screenshot shows a different label.

When text must be entered, name the field and give the literal value or a precise pattern. Use code styling or quotation marks only when they distinguish literal input from explanation.

## Annotation grammar

- Use red (`#D92D20`) as the primary annotation color.
- Draw a 3-5 px rounded rectangle around the smallest target area that remains unambiguous.
- Place a solid numbered badge near the upper-left edge of the target. Keep the badge inside the image and away from important source text.
- Match every badge to exactly one written step. Never reuse a number for a different action.
- Keep overlay labels to a few words. Put explanations in the PDF text beside or below the image.
- For a field requiring input, frame the field and explain the value in the step. Do not write a long value over the screenshot.
- If the source already has an unmistakable arrow, box, number, or textual callout, reference it in the prose and do not overlay the same guidance again.
- If several targets overlap, use separate close-up crops or a second annotated copy instead of stacking illegible boxes.
- Never obscure passwords, tokens, personal data, account identifiers, or essential UI labels. Redact sensitive source data before annotation.

## Image treatment

Preserve the original aspect ratio. Crop only irrelevant browser chrome or empty surroundings, and never crop away context needed to locate the target. Screenshots must remain sharp enough to read their UI labels at 100% page view.

One screenshot may carry several numbered steps when it represents one stable state. Keep those steps together as one visual group. Use separate screenshots when an action changes the state, opens a menu, displays a confirmation, or changes which target is visible.

## Page system

Default to A4 portrait with approximately 16-20 mm margins. Use a landscape page only when a wide interface would become unreadable in portrait.

Recommended hierarchy:

- Document title: 24-30 pt
- Section heading: 16-20 pt
- Screenshot-group heading: 13-16 pt
- Body text: 10.5-12 pt
- Notes and captions: 8.5-10 pt
- Line spacing: approximately 1.3-1.45 times the body size

Start content on the first page rather than creating a mostly empty cover page. Use restrained color, generous but not wasteful spacing, and one consistent type family. Add page numbers. Leave the rest of the footer empty unless the user explicitly requests specific footer text.

Keep the tutorial brand-neutral. Do not add the skill name, AI or model name, generator credit, creator credit, sample label, watermark, or other production metadata to the visible document or PDF metadata unless the user explicitly requests it.

Separate steps with a light border, tinted background, or 6-12 pt vertical spacing. Do not force every step onto a new page. Avoid orphaned headings, a screenshot separated from its first step, and a step card split across pages. Let a long screenshot group continue naturally onto the next page if needed.

Keep screenshot width consistent within a section. A short caption may explain the state shown, but it must not repeat the step text.

## Conditional branches

Introduce a branch with a clear condition, such as `Wenn Sie Administratorrechte haben ...`. Label alternatives with short names such as `Pfad A` and `Pfad B`, retain the global step order, and explicitly state where both paths continue.

Use a small branch callout or two-column comparison only when both branches are short. For long branches, use separate subsections. Do not use a dense flowchart when ordinary headings and numbered steps are clearer.

## Final visual review

Inspect page renders, not only extracted text. Confirm:

- 100% zoom is comfortable for body text and screenshot labels.
- Red boxes point to the intended controls without hiding them.
- Badges and step cards use identical numbering.
- No text, image, border, page number, or explicitly requested footer is clipped or overlapping.
- Spacing makes sections distinct without creating large blank regions.
- A screenshot and at least its first related instruction appear together.
- Branches, warnings, and exact input values are visually easy to find.
- Headers, page numbers, any explicitly requested footer, and typography are consistent.
- No unrequested generator or skill attribution appears in visible content or document metadata.
