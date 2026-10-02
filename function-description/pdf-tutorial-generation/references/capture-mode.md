# Explicit screenshot capture mode

Read this reference only when the user explicitly asks the skill to capture its own tutorial images.

## Scope and prerequisites

Confirm the named application or website, the workflow endpoint, and the intended starting state from the request. If access, a URL, an account state, or essential sample data is missing, ask for that missing item instead of guessing.

Use the available browser or computer-control capability. Operate only the named workflow. A request to capture a tutorial does not authorize purchases, account deletion, publishing, sending messages, inviting people, changing permissions, or other consequential actions. Stop before such an action unless the user separately authorized it.

## Safe demonstration data

Prefer a demo environment, local fixture, sandbox, or obviously fictional values. Do not expose production records or unrelated personal information in screenshots. Before capture, hide or redact passwords, API keys, tokens, private messages, personal identifiers, and customer data.

If the workflow cannot be demonstrated without sensitive or real data, pause and ask the user for a safe source or permission to use a specifically identified source. Do not manufacture a successful state that the interface did not show.

## Capture sequence

1. Walk through the complete workflow once to identify state changes and branches.
2. Capture the starting state and each stable state needed to explain the next action.
3. Capture menus, dialogs, validation messages, and success confirmations while they are visible.
4. Use a consistent window size and zoom. Disable incidental motion when possible and wait until content is fully rendered.
5. Capture only the relevant application surface. Exclude unrelated tabs, notifications, desktops, and other applications.
6. Use descriptive, ordered filenames and record what each image demonstrates.

Do not simulate the product interface with generated imagery. Tutorial screenshots must come from the real application state or from user-provided images.

## Branches

Capture each branch only when it is relevant to the requested audience and safe to enter. If a branch requires a role or state that is unavailable, document the limitation and ask for the missing screenshot rather than inventing it.

## Capture quality gate

Reject and recapture any image that is blurred, incomplete, obstructed, inconsistently scaled, or missing the target state. Confirm that all text needed to locate the control is readable before beginning annotation.
