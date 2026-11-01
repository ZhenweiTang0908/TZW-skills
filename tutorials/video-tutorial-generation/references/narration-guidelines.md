# Narration guidelines

Default to German unless another language is explicitly requested. Describe the user's goal first and the visible action second. Keep each segment focused on one operation and normally between four and ten seconds. Use exact product terminology and say only what the viewer needs to complete the task.

## Opening greeting

Every narrated tutorial begins with a brief host greeting before the workflow explanation. For Chinese output, use Lily and adapt this template to the actual topic: “你好，我是 Lily。在这一份教程中，我会带你使用【产品或功能】完成【教程目标】，并说明如何将结果导出为【目标格式或去向】。” Replace all bracketed text for each video. For other explicitly requested languages, translate the same greeting and retain Lily as the host. Put the greeting at the start of the first scene; keep the browser visible and continuous, with no title card.

## Continuous presentation

- Narrate the workflow as one continuous operation. Do not announce a new "step" unless the user asked for numbered instructions.
- Describe the action at the moment the pointer reaches it, for example "Open My Shortlists" or "Choose CSV". Do not say "we will now start a new section" when only the page state changes.
- Describe reusable roles and states, such as "the shortlist you want to export", "the current shortlist", or "the selected candidate". Do not hard-code example shortlist names, candidate names, record counts, dates, or business IDs into narration, subtitles, or task labels unless the user explicitly asks to teach that exact case.
- It is fine to mention pointer actions in continuous mode because the pointer is always visible and the click is part of the visual explanation.
- Keep transitions between sentences natural. A new scene should sound like the next action, not a reset.

## Stepwise presentation

- Number every narration segment as a step when this presentation is explicitly selected. In German that is "Schritt eins", "Schritt zwei"; in Chinese, "步骤一", "步骤二".
- One segment carries one step, and numbering stays continuous across scenes.

## Shared rules

Name the field, button, menu item, or option and the action to take on it. Leave out background about the product, reasons behind a screen, policy warnings, and instructions to read unrelated documents. Do not narrate interface text the viewer can already read; if a step needs a value, put the value directly in the instruction.

Use stable, language-independent segment IDs so actions synchronize across translations. Preserve meaning across `de`, `en`, and `zh`; do not mechanically mirror word order. Prefer two short segments when two distinct actions occur.

Codex drafts narration from the source, routes, and requested workflow. The runtime does not call a separate writing model and does not ask the user to record interactions.
