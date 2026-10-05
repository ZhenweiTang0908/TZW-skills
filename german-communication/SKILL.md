---
name: german-communication
description: Draft or revise concise German internal messages for familiar startup colleagues. Use for status updates, questions, coordination, and quick feedback in an informal team context; do not use for customer facing, legal, HR, or other formal communication.
metadata:
  author: NiuNiu Tang
  version: "0.1.0"
---

# Communication

Write German messages for close startup colleagues who already know each other well. Sound like a capable teammate and friend: direct, relaxed, warm, and efficient.

If the user sends German, translate it into Chinese. If the user sends Chinese and explicitly invokes this Skill, translate it into German using this Skill.

## Core style

* Get to the point without ceremonial greetings, small talk, or closing formulas.
* Use natural spoken German while keeping grammar and meaning clear.
* Be friendly without sounding submissive, apologetic, distant, or overly polished.
* Prefer short sentences and common words. Remove repetition and details that do not help the recipient act or understand the update.
* Preserve concrete facts, names, times, uncertainty, commitments, and open questions from the source.
* Do not invent deadlines, promises, priorities, explanations, or certainty.
* Use `du` unless the user explicitly requests another form of address.

## Punctuation and typography

* Do not use dashes as punctuation or for stylistic emphasis. Rewrite with a comma, a period, or a separate sentence.
* Avoid hyphenated German compounds when natural wording without a hyphen is available. For example, prefer `Impressumextraktion` and `Fonio Outbound`.
* Preserve a hyphen only when it belongs to an exact identifier, URL, command, code fragment, or official name that must not be changed.
* Avoid quotation marks unless a literal quotation or exact label requires them.
* Avoid decorative symbols, excessive parentheses, semicolons, and exclamation marks.

## Message shape

Use only the parts the message needs:

1. State the update or observation.
2. Add the relevant timing, status, or next step.
3. End with the concrete question or request when there is one.

Do not turn a short chat message into a structured memo. A greeting such as `Hi Müller,` is fine when it feels natural, but it is not required.

## Wording choices

Prefer active, personal wording when the actor is known:

* Prefer `wir können die Oberfläche noch verbessern` over `die Oberfläche lässt sich noch verbessern`.
* Prefer `mit dem ich mich einloggen kann` over the impersonal `mit dem man sich einloggen kann` when the speaker means themself.
* Prefer `Sobald ich etwas Luft habe, kümmere ich mich darum` over a repetitive or formal closing.

Use casual wording such as `Ich bin gerade daran` or `Sobald ich etwas Luft habe` only when it matches the real level of certainty. If timing matters and the source provides it, state it directly.

## Examples

Status update followed by a question:

> Hi Müller, die Statistik im KT Tool geht heute um 12:30 Uhr live. Die Impressumextraktion kommt voraussichtlich heute Abend. Morgen schicke ich dir und Steffen dazu noch eine Mail.
>
> Ich bin gerade an Fonio Outbound dran. Hast du einen Fonio Account, mit dem ich mich im Adminbereich einloggen kann?

Observation and next step:

> Mir ist aufgefallen, dass wir die Oberfläche vom KT Response Tool und vom Application Filter noch verbessern können, zum Beispiel mit einer besseren Seitennavigation und Filtern nach blauen Lesezeichen oder Kampagnen. Zuletzt habe ich am Angebotstool und an Fonio Outbound gearbeitet. Sobald ich etwas Luft habe, kümmere ich mich darum.

## Output

When the user asks for a message, return the finished German message first. Explain edits only when requested or when an ambiguity materially affects the wording. Do not add a greeting, signoff, deadline, or context that the user did not provide.
