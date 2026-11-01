---
name: work-log-recall
description: Read the user's local daily work log and answer what they did during a requested period. Use for recall questions such as what did I do today, this week, or on a project; do not write or modify the log.
metadata:
  author: NiuNiu Tang
  version: "0.1.1"
---

# Work Log Recall

Read the user's daily Markdown work log and answer recall questions. This skill is read-only. Do not modify log files and do not save generated summaries.

## Log location

Use `WORK_LOG_DIR` when it is set. Otherwise use:

`/Users/niuniutang/Projects/InterimAid-Logs`

Daily files live at:

`<root>/YYYY-MM/YYYY-MM-DD.md`

Use the `Asia/Shanghai` timezone.

## Resolve the date range

* An explicit date: read that day only.
* Today: read today.
* Yesterday: read yesterday.
* This week: read Monday through today.
* Last week: read the previous Monday through Sunday.
* Last 7 days: read today and the previous six days.
* No range given and the user asks generally what they did recently: read the previous seven days.

Read only files that exist. Do not infer work for missing dates.

## Read and answer

1. Read the daily files for the resolved range.
2. Keep entries grouped by date. If the user asks about a specific project, filter by the project tag or summary text.
3. Return concise bullets. Preserve the original project names, status, results, open items, numbers, and links.
4. Log entries are written in English. Answer in the language the user uses for the request unless they ask for another language.
5. Do not invent details, merge unrelated items into a result, or claim work that is not in the log.
6. If no matching file or entry exists, say clearly that there is no record for that period or project.
7. If the user asks for a boss-facing phrasing, you may rewrite the recorded facts for that audience in the current reply. Do not save the rewrite and do not invent missing evidence.

## Boundaries

* Never edit, delete, or reorganize entries while answering.
* Do not create indexes, caches, or summary files.
* Do not use unrelated dates or projects to fill gaps.
