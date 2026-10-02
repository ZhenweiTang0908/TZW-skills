# Narration guidelines

Default to German unless another language is explicitly requested. Describe the user's goal first and the visible action second. Keep each segment focused on one operation and normally between four and ten seconds. Avoid repeated filler, avoid reading unrelated interface text, and use exact product terminology.

Number every narration segment as a step. In German that is "Schritt eins", "Schritt zwei", and so on; in Chinese, "步骤一", "步骤二". One segment carries exactly one step, and the step numbers stay continuous across scenes so the viewer can follow a single numbered sequence from start to finish.

Say only what the viewer has to do. Name the field, button, menu item, or option and the action to take on it. Leave out background about the product, reasons behind a screen, consequences of a choice, cost or policy warnings, and any instruction to read a document, agreement, or notice. Do not narrate what the interface says on the viewer's behalf. If a step needs a value, put the value in the step text instead of describing what the field is for.

Use stable, language-independent segment IDs so actions synchronize across translations. Preserve meaning across `de`, `en`, and `zh`; do not mechanically mirror word order. Prefer two short segments when two actions occur.

Mention a click only when its storyboard action has `showCursor: true` and the click itself is important to understanding the visible result. Otherwise describe the resulting screen state or operation without pointer language.

Codex drafts narration from source, routes, and the requested workflow. The runtime does not call a separate writing model and does not ask the user to record interactions.
