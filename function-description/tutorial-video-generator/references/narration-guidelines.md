# Narration guidelines

Default to German unless another language is explicitly requested. Describe the user's goal first and the visible action second. Keep each segment focused on one operation and normally between four and ten seconds. Avoid repeated filler, avoid reading unrelated interface text, and use exact product terminology.

Use stable, language-independent segment IDs so actions synchronize across translations. Preserve meaning across `de`, `en`, and `zh`; do not mechanically mirror word order. Prefer two short segments when two actions occur.

Mention a click only when its storyboard action has `showCursor: true` and the click itself is important to understanding the visible result. Otherwise describe the resulting screen state or operation without pointer language.

Codex drafts narration from source, routes, and the requested workflow. The runtime does not call a separate writing model and does not ask the user to record interactions.
