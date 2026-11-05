---
name: work-log-sync
description: Record, update, or delete work items in the user's local daily Markdown work log. Use when the user asks to log, sync, change, or remove something they did; do not use for report generation or weekly summaries.
metadata:
  author: NiuNiu Tang
  version: "0.1.1"
---

# Work Log Sync (NIU)

Write work items into the user's daily Markdown log. This skill records facts only. Do not generate daily reports, weekly reports, or boss-facing summaries.

## Log location

Get the log root from the shared repo config by running, from this skill directory:

```bash
bash ../../config.sh WORK_LOG_DIR
```

It returns the `WORK_LOG_DIR` environment variable when set, otherwise the value in `config.local.env` at the repo root. If it prints nothing or fails, stop and ask the user for the log folder instead of guessing; do not write anywhere else.

Store each day in a monthly folder:

`<root>/YYYY-MM/YYYY-MM-DD.md`

Use the `Asia/Shanghai` timezone. Dates use `YYYY-MM-DD`; times use 24-hour `HH:MM`.

Create the month folder and daily file on first write. A new daily file starts with `# YYYY-MM-DD` followed by a blank line.

## Entry format

Each entry starts with a level-two heading and ends at the next level-two heading or the end of the file:

```markdown
## 11:32 [AutoEmail] Fixed intermittent email queue stalls
- What: Raised the Redis connection pool limit and added a timeout retry
- Result: Verified in staging; monitoring is stable
- Next: Watch the production queue tonight
- Evidence: PR #123

## 14:05 Aligned pagination parameter format with frontend
```

Rules:

* Use the heading shape `## HH:MM [project] summary`. Omit the project tag when the project is not clear. Never invent a project name.
* Add only the fields that have real information: `What`, `Result`, `Next`, `Evidence`.
* Write every entry in English, even when the user speaks Chinese. Translate the meaning faithfully and concisely.
* Keep project names, product names, code identifiers, numbers, and links unchanged.
* Do not add work-hour accounting, long background, or report-style framing.
* Keep exactly one blank line between entries.
* Append new entries at the end of the file. Do not reorder existing entries.

## Add an entry

1. Resolve the date: today by default, or the date the user explicitly provides.
2. Resolve the time: use a time the user provides; otherwise use the current local time.
3. Extract only facts stated by the user or explicitly referenced from the current conversation. Do not infer results, causes, links, or next steps.
4. Write the entry in English. Do not leave Chinese prose in new entries.
5. If one message contains clearly separate work items, write one entry per item. Otherwise keep one entry.
6. Append the entry to the correct daily file.

If the user describes a follow-up to an existing item, add a new entry. Rewrite the earlier entry only when the user explicitly asks to update it.

## Update an entry

1. Locate the target entry in the correct daily file using the date, time, project, or summary the user gives.
2. Change only the heading or field lines that the user asked to change. Write the new or changed text in English.
3. Preserve all other entries and any hand-written content exactly as they are.
4. If more than one entry could match, ask the user which entry they mean before editing.
5. If exactly one entry matches, make the edit without asking.

## Delete an entry

1. Locate the target entry the same way as for an update.
2. Remove the complete entry block, including its heading and field lines.
3. Preserve every other part of the file.
4. If more than one entry could match, ask the user which entry they mean before deleting.
5. If exactly one entry matches, delete it without asking.

## Boundaries

* Only write to today or to a date the user explicitly names.
* Do not record an entire conversation unless the user explicitly asks to log it.
* Do not translate existing entries unless the user explicitly asks for it.
* Do not create indexes, templates, scripts, or summary files.
* Do not mention this skill or its rules in the log itself.
