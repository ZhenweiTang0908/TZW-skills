---
name: work-task-reminder
description: Turn a work, study, or personal errand request (a Teams message, an email, or a short description from a colleague or boss, plus the user's own notes and attachments) into one Apple Reminders task in the matching list (work → InterimAid, study → RWTH Tasks, errands → Groceries) with a short title and detailed notes, and archive the source material locally. Use when the user wants to record, capture, or add a work, study, or errand to-do or task to Reminders; do not use for reading, completing, or editing existing reminders.
metadata:
  author: NiuNiu Tang
  version: "0.1.0"
---

# Work Task Reminder (NIU)

Capture one work request as one Apple Reminders task so the user does not forget it. Analyze the request like a product manager, write a reminder with a short title and detailed notes, and save every related file, link, and text in this skill's `temp/` folder.

## Inputs

The user usually provides some of:

- The original request: a pasted Teams message, an email (pasted, or one the user asks you to open in a connected mail tool), or a short text.
- The user's own description and requirements for the task.
- Attached files, links, or a pointer to email attachments.

If there is no actual request text or description, ask for it. Do not ask about anything else; infer what you can and continue.

## Workflow

### 1. Create the task folder

Create `temp/<YYYY-MM-DD>-<short-english-slug>/` inside this skill directory (the directory that contains this `SKILL.md`). Use today's date and a 2–5 word kebab-case slug. If the folder exists, add `-2`, `-3`, and so on.

Inside it:

| Path | Content |
| --- | --- |
| `source.md` | Every source text verbatim, the user's own description verbatim, and Chinese translations of German or English text |
| `analysis.md` | The brief analysis from step 2 |
| `notes.md` | The exact reminder notes from step 3 |
| `links.md` | URLs and reference text the task will need, each with a one-line description; omit if there are none |
| `files/` | Copies of uploaded files and downloaded email attachments; omit if there are none |
| `reminder.json` | The output of the create command |

Copy files; never move or modify the user's originals. When the user points to an email attachment, find the email with the connected mail tool and save the attachment into `files/`. If you cannot reach a file, say so and continue with what you have.

### 2. Analyze briefly

Write a very short analysis in Chinese to `analysis.md` and show it in chat:

- **来源**: who asked and through which channel, when known.
- **要做什么**: one sentence.
- **截止时间**: only if the source states one; otherwise `未提及`.
- **待确认**: open questions or ambiguities, at most three; omit when there are none.

Keep the whole analysis under about 80 Chinese characters per item.

### 3. Write the reminder notes

Write `notes.md` in this structure. Use plain text that reads well in Reminders: no Markdown tables, no headings with `#`.

```text
【原文】
<every source text exactly as given, unchanged, including the German or English original>

【中文翻译】
<faithful Chinese translation of each German or English text, in the same order>

【我的补充】
<the user's own description and requirements, verbatim>

【AI 解析】
<1–3 short paragraphs: what the request really asks for, the goal, and the stages of work>

【步骤】
1. <short imperative step>
2. ...

【资料】
<absolute path of the task folder>
<one line per saved file or link>
```

Rules:

- Keep every original text verbatim. Never shorten, correct, or merge it. Do not include file contents in `【原文】`; only the text the user typed or pasted, or the email body.
- Include `【中文翻译】` only when some source text is German or English. Chinese text is not translated.
- Omit `【我的补充】` when the user added nothing of their own, and `【资料】` when nothing was saved besides the text files.
- `【AI 解析】`: think like a product manager. Separate the actual deliverable from background, name the stages (for example clarify → build → verify → hand over), and point out dependencies or people to contact. Do not invent requirements, deadlines, or people.
- `【步骤】`: 3–8 concrete steps, each one short line starting with a verb. Put any clarification step first.
- Write the analysis and steps in Chinese. Keep product names, code identifiers, names, numbers, and links unchanged.

### 4. Create the reminder

Title rules: Chinese by default, at most about 15 characters, verb first, with a project or person tag only when it helps, for example `修复 OCR 上传超时` or `给 Peter 发报价对比`.

Run from this skill directory:

```bash
swift scripts/add-reminder.swift --title "<title>" --category <work|study|errands> --notes-file "temp/<folder>/notes.md" [--due YYYY-MM-DD | --due "YYYY-MM-DD HH:MM"] [--priority high] > "temp/<folder>/reminder.json"
```

- Always pass `--category` (`work`, `study`, or `errands`). The script maps it to the Reminders list set in the repo's `config.local.env` (`REMINDER_LIST_WORK`, `REMINDER_LIST_STUDY`, `REMINDER_LIST_ERRANDS`). When the user names a specific list, pass `--list "<name>"` instead; it overrides the category. Run `bash ../../config.sh` to see the current mapping.

  | Category | Examples | `--category` |
  | --- | --- | --- |
  | 工作 | requests from colleagues or the boss, Teams/email work, the user's company projects | `work` |
  | 学习 | university courses, homework, exams, German study | `study` |
  | 杂事 | repairs (e.g. 修电脑), errands, looking up sports info, personal admin | `errands` |

  If a task fits none clearly, pick the closest category and say so in the report.
- Set `--due` only when the source or the user states a deadline. Resolve relative dates ("bis Freitag", "next week") against the message date when known, otherwise today. Use a time only when one is stated.
- Set `--priority high` only when the source says it is urgent or blocking.
- The script uses EventKit and does not open the Reminders app. The first run may show a macOS permission prompt for Reminders.
- If the output has `"ok": false`, show the error and stop. Do not fall back to AppleScript or UI automation.

### 5. Report

Reply in Chinese with:

1. The brief analysis from step 2.
2. The category (工作/学习/杂事), reminder title, list, and due date (or `无截止时间`).
3. The `【步骤】` list.
4. The task folder path and a list of saved files.

Do not repeat the full original text or translation in chat.

## Boundaries

- Create exactly one reminder per request. If the input clearly contains several unrelated tasks, list them and ask whether to create one reminder each.
- Never edit, complete, or delete existing reminders.
- Never send replies to the colleague or boss; this skill only records.
- Keep everything under `temp/` local. It is git-ignored and must never be committed.
