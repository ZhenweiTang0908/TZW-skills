# TZW Skills

English | [简体中文](README.zh-CN.md)

NiuNiu Tang's personal agent skills, shared by Claude Code and Codex. They cover daily work records, the full software development lifecycle, computer maintenance, hard-problem research, and product tutorial production.

Every skill's display name ends with `(NIU)` to distinguish it from third-party skills.

## Directory structure

```text
TZW-skills/
├── work/                               # Daily work
│   ├── german-communication/           # Draft and polish German messages to colleagues
│   ├── work-log-sync/                  # Write, update, or delete daily work log entries
│   ├── work-log-recall/                # Answer "what did I do" from the work log
│   └── write-todo-reminder/            # Turn a work request into an Apple Reminders task
├── lightweight-developments/           # Software development skill pack (14 active skills; 9 deprecated)
│   ├── .agents/skills/                 # The individual development skills
│   ├── catalog.yaml                    # Category catalog
│   ├── ROUTING.md / DESIGN.md          # Routing rules and design notes
│   ├── docs/USER-GUIDE.md              # User guide
│   ├── scripts/                        # Validation and packaging scripts
│   └── tests/
├── computer/                           # Computer maintenance (read-only checks)
│   ├── computer-health-check/          # Checkup: heat, slowness, battery, suspicious programs
│   └── computer-software-audit/        # Installed-software inventory and cleanup candidates
├── research/
│   └── web-troubleshoot/               # Deep web research for hard problems
├── tutorials/                          # Product tutorials
│   ├── pdf-tutorial-generation/        # Annotated, screenshot-based PDF tutorials
│   └── video-tutorial-generation/      # Narrated, subtitled product walkthrough videos
├── Temp/                               # Generated artifacts and temporary files (git-ignored)
└── output/                             # Legacy artifact folder (git-ignored)
```

## Skills

### Daily work (`work/`)

| Skill | Purpose |
| --- | --- |
| `german-communication` | Write German messages to familiar colleagues in a natural, informal `du` tone, and translate German into Chinese. Not for customer, legal, HR, or other formal communication. |
| `work-log-sync` | Record what you did in a daily Markdown work log (one folder per month), with update and delete support. Entries are always in English. |
| `work-log-recall` | Read the work log and answer "what did I do today / this week / on a project". Read-only. |
| `write-todo-reminder` | Turn a request from a colleague or boss (Teams message, email, or text) into one Reminders task: a short title, with the original text, a Chinese translation when needed, and an AI explanation in the notes. Attachments and links are saved in the skill's `temp/` folder. |

### Software development (`lightweight-developments/`)

A pack covering requirements, design, implementation, verification, and release. See [ROUTING.md](lightweight-developments/ROUTING.md) for routing rules and [USER-GUIDE.md](lightweight-developments/docs/USER-GUIDE.md) for usage.

**Daily development and analysis**

| Skill | Purpose |
| --- | --- |
| `brief-to-mini-spec` | Turn a small request into a Mini Spec; for branching flows, add a walkthrough and Mermaid diagrams (spec-explainer is folded in). |
| `diagnose` | Gather evidence and test hypotheses before proposing a minimal fix. |
| `production-database-analysis` | Query production databases under enforced read-only controls to answer statistics, anomaly, and operations questions. |
| `read-module` | Entry point for explaining an existing system; routes to the three skills below. |
| `read-code-horizonally` | Explain a module, class, or function: responsibilities and reading order. |
| `read-code-vertically` | Trace a feature end to end through UI, APIs, services, and data writes. |
| `read-state-and-model` | Map entity lifecycles, state transitions, data relationships, and invariants. |
| `backfill-task` | Design pausable, resumable, idempotent data backfill jobs. |

**Quality and delivery**

| Skill | Purpose |
| --- | --- |
| `engineering-quality` | General quality constraints to follow while writing code. |
| `code-review` | Three modes: review code changes; challenge a spec, plan, or migration against its contract; audit business rules and state transitions for counterexamples. Linked to Codex only, to avoid clashing with Claude Code's built-in `/code-review`. |
| `session-handoff` | Leave a compact handoff record when switching sessions or agents. |
| `transfer-job` | Hand token-heavy, already-planned execution work to the Pi agent on DeepSeek Flash, then verify independently. Use only when explicitly asked. |
| `ship-change` | Require explicit authorization before merging, deploying, or migrating, with pre/post checks and a rollback plan. |

### Computer maintenance (`computer/`)

| Skill | Purpose |
| --- | --- |
| `computer-health-check` | macOS checkup: CPU, memory, heat, battery, disk, background jobs, dev processes, security settings, suspicious programs. Read-only; any fix needs per-item confirmation. |
| `computer-software-audit` | Inventory installed apps, CLI tools, runtimes, and leftover data to find cleanup candidates. Read-only; never uninstalls anything. |

### Research (`research/`)

| Skill | Purpose |
| --- | --- |
| `web-troubleshoot` | For hard production, cloud, or integration problems: gather cases and primary sources broadly, compare them with local evidence, and produce ranked hypotheses and next checks. Replies in Chinese by default. |

### Tutorials (`tutorials/`)

Both skills run only when explicitly named.

| Skill | Purpose |
| --- | --- |
| `pdf-tutorial-generation` | Build step-by-step PDF tutorials from UI screenshots, with red frames and numbered badges. German by default. |
| `video-tutorial-generation` | Record real browser-window interactions, add TTS narration and subtitles, and render a walkthrough video with Remotion. Uses a paid text-to-speech API. |

## Installation

Skills are installed by symlinking them into the global skill directories. Use the script, which skips deprecated skills:

```bash
bash lightweight-developments/scripts/link_skills.sh ~/.claude/skills ~/.codex/skills
```

Skills marked `status: "deprecated"` in their SKILL.md frontmatter are never linked. Do not link them by hand. The link name is the skill's directory name. After moving or renaming a skill, rerun the script and remove stale links.

### Personal settings

Values that differ per person or machine (work-log folder, Reminders list names, project folders) live in one file, `config.local.env`, at the repo root. It is git-ignored. On a new machine:

```bash
cp config.example.env config.local.env
```

Then edit the values. Run `bash config.sh` to print the resolved settings. An environment variable with the same name overrides the file; `NIU_SKILLS_CONFIG` points to a config file elsewhere.

| Key | Used by |
| --- | --- |
| `WORK_LOG_DIR` | `work-log-sync`, `work-log-recall` |
| `REMINDER_LIST_WORK` / `_STUDY` / `_ERRANDS` | `write-todo-reminder` |
| `PROJECT_DIRS` | `computer-health-check` |

## Conventions

1. **Naming**: The folder name matches `name`; all lowercase, words joined by hyphens, never underscores.
2. **Metadata**: Every SKILL.md frontmatter has `metadata.author` and `metadata.version`. The SKILL.md title and the `agents/openai.yaml` display name both end in `(NIU)`.
3. **Artifact isolation**: Generated PDFs, videos, audio, and screenshots go to `Temp/` or the skill's own temporary folder, never into version control.
4. **Secrets**: API keys and TTS keys live only in local `ENV` or `.env` files and are never committed.
5. **No personal paths**: Never write `/Users/<name>/...` into a skill; use `~`, `$HOME`, or a key in `config.local.env`.
6. **Validation**: After changing any skill, run the following. It checks every skill and also runs the development pack's validator:

```bash
python3 scripts/validate_repo.py && python3 -m unittest discover -s lightweight-developments/tests
```

Keep [README.zh-CN.md](README.zh-CN.md) in sync when this file changes.
