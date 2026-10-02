---
name: pdf-tutorial-generation
description: Create polished, screenshot-led PDF tutorials that explain complete sequential workflows, annotate UI targets, and handle conditional branches. Invoke only when the user explicitly requests $pdf-tutorial-generation or names PDF Tutorial Generation; never select it implicitly.
metadata:
  author: NiuNiu Tang
  version: "0.1.0"
---

# PDF Tutorial Generation

Create a finished, visually verified PDF that teaches a user how to complete one workflow. Default to German unless the user specifies another language.

## Invocation and source policy

Use this skill only when the user explicitly invokes it. A request to create an ordinary PDF, annotate an image, or explain a workflow does not count.

The default source mode is **user-provided images**. If the user has not supplied images and has not explicitly asked for capture, ask for the images and stop. Do not silently browse, operate an app, or capture the screen.

Enter **capture mode** only when the user explicitly asks this skill to collect its own screenshots. Before operating the UI, read [references/capture-mode.md](references/capture-mode.md). Capture authorization applies only to the named workflow and application; it does not authorize account creation, destructive actions, purchases, sending messages, publishing, or changes outside the demonstrated workflow.

## Generated-output location

Keep generated artifacts out of version control. When the project has a Git-ignored `Temp/` or `Temporary/` directory, place all copied source images, redacted variants, manifests, annotated images, rendered previews, and final PDFs beneath that directory. Otherwise follow the project's existing ignored temporary-output convention. Do not place generated artifacts inside the skill folder.

## Required authoring standard

Before drafting or rendering, read [references/authoring-standard.md](references/authoring-standard.md). It defines the annotation grammar, information priorities, German writing style, page layout, branching treatment, and visual acceptance criteria.

## Workflow

1. Establish the tutorial goal, intended audience, output language, image order, and starting assumptions from the request. Use German when no language is specified.
2. Acquire source images:
   - In provided-image mode, inventory every image and infer their sequence. Ask only about an ambiguity that would materially change the instructions.
   - In explicit capture mode, follow [references/capture-mode.md](references/capture-mode.md) and capture stable states with safe demonstration data.
3. Inspect every image before writing. Identify the state shown, every user action, any required input, the result of the action, and any branch or prerequisite. If one image contains four actions, document all four.
4. Build a step map before layout. Each action receives one stable number. Numbers in the screenshot and in the prose must match exactly. Reuse information already visible and clearly marked in the source instead of adding a duplicate annotation.
5. Annotate only actionable targets or input regions. Prefer a red rounded rectangle plus a numbered badge. Keep long explanations outside the image. For an input, box the field and state the exact value, format, or selection in the corresponding step text.
6. Draft concise but complete instructions. State what the step accomplishes, what the user does, what to enter when applicable, and what visible result confirms success. Completeness outranks brevity; remove repetition only after no action, input, condition, or outcome is missing.
7. Represent conditional paths explicitly. State the condition first, label each branch, and show where paths rejoin. Do not pretend that optional or role-dependent actions are universal.
8. Keep the output brand-neutral. Never add the skill name, an AI/model name, a generator credit, a sample watermark, or similar attribution to visible PDF content or PDF metadata. Include custom footer text only when the user explicitly supplies or requests that exact text; page numbers alone are the default.
9. Create a manifest following [references/manifest-schema.md](references/manifest-schema.md), then render with `scripts/render_tutorial.py`. Resolve relative image paths against the manifest directory.
10. Render the PDF pages to images and inspect every page at normal reading size. Fix clipped content, weak contrast, tiny text, mismatched numbers, excessive whitespace, awkward page breaks, repeated annotations, and split step blocks. Repeat until no visible defect remains.
11. Deliver the final PDF and briefly state its language, page count, source mode, and any assumptions that affect the instructions.

## Render command

Prefer the environment's virtual Python or `uv`:

```bash
uv run --with pillow --with reportlab python scripts/render_tutorial.py manifest.json --output tutorial.pdf
```

For non-Latin output, pass a suitable TrueType/OpenType font when automatic discovery cannot cover the requested script:

```bash
uv run --with pillow --with reportlab python scripts/render_tutorial.py manifest.json --output tutorial.pdf --font /path/to/font.ttf --font-bold /path/to/bold.ttf
```

Render the result with Poppler when available:

```bash
pdftoppm -png -r 150 tutorial.pdf tutorial-page
```

If the renderer cannot express a required layout, adapt or replace it rather than degrading the tutorial. Keep the manifest and generated annotation images with temporary build files, not beside the final PDF unless the user asks for editable sources.

## Completion conditions

Do not deliver unless all of these are true:

- Every supplied or intentionally captured image has been used or explicitly excluded for a reason.
- Every necessary action, input, condition, and expected result is documented.
- Screenshot numbers map one-to-one to the written steps and remain legible.
- Existing in-image guidance is not redundantly marked.
- Steps are visually distinct without forcing each step onto a new page or leaving large empty areas.
- No unrequested generator credit, skill name, watermark, or author attribution appears in the document or its metadata.
- The final rendered pages have been inspected, not merely generated.
