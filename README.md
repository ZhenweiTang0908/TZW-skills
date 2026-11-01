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
│   └── work-task-reminder/             # Turn a work request into an Apple Reminders task
├── lightweight-developments/           # Software development skill pack (21 skills)
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
| `work-task-reminder` | Turn a request from a colleague or boss (Teams message, email, or text) into one Reminders task: a short title, with the original text, Chinese translation, AI breakdown, and steps in the notes. Attachments and links are saved in the skill's `temp/` folder. |

### Software development (`lightweight-developments/`)

A pack covering requirements, design, implementation, verification, and release. See [ROUTING.md](lightweight-developments/ROUTING.md) for routing rules and [USER-GUIDE.md](lightweight-developments/docs/USER-GUIDE.md) for usage.

**Daily development and analysis**

| Skill | Purpose |
| --- | --- |
| `brief-to-mini-spec` | Turn a small request into a short Mini Spec before coding. |
| `diagnose` | Gather evidence and test hypotheses before proposing a minimal fix. |
| `production-database-analysis` | Query production databases under enforced read-only controls to answer statistics, anomaly, and operations questions. |
| `explain-system` | Entry point for explaining an existing system; routes to the three skills below. |
| `code-reading` | Explain a module, class, or function: responsibilities and reading order. |
| `feature-tracing` | Trace a feature end to end through UI, APIs, services, and data writes. |
| `state-and-data-modeling` | Map entity lifecycles, state transitions, data relationships, and invariants. |
| `logic-audit` | Find counterexamples, contradictions, and dead ends in business rules, branches, and state transitions. |
| `verify-change` | Verify a small change or fix with fresh evidence. |
| `backfill-task` | Design pausable, resumable, idempotent data backfill jobs. |

**Large features**

| Skill | Purpose |
| --- | --- |
| `brief-to-spec` | Turn a large request into a formal behavioral specification. |
| `spec-explainer` | Add workflow explanations, concrete scenarios, and Mermaid diagrams to a spec. |
| `spec-to-plan` | Break an approved spec into a verifiable implementation plan. |
| `implement-plan` | Implement an approved plan task by task. |
| `verify-spec` | Run final acceptance against every requirement in the spec. |

**Quality and delivery**

| Skill | Purpose |
| --- | --- |
| `engineering-quality` | General quality constraints to follow while writing code. |
| `doubt-review` | Independent, adversarial review of a spec, plan, or change. |
| `code-review` | Review code changes (linked to Codex only, to avoid clashing with Claude Code's built-in `/code-review`). |
| `session-handoff` | Leave a compact handoff record when switching sessions or agents. |
| `ship-change` | Require explicit authorization before merging, deploying, or migrating, with pre/post checks and a rollback plan. |
| `review-spec` | Disabled; replaced by `doubt-review` and kept for now. |

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

Each skill is installed by symlinking it into the global skill directories, one for Claude Code and one for Codex:

```bash
ln -s "$PWD/work/work-task-reminder" ~/.claude/skills/work-task-reminder
ln -s "$PWD/work/work-task-reminder" ~/.codex/skills/work-task-reminder
```

The link name must match the `name` in SKILL.md. After moving or renaming a skill, update the links in both directories.

## Conventions

1. **Naming**: The folder name matches `name`; all lowercase, words joined by hyphens, never underscores.
2. **Metadata**: Every SKILL.md frontmatter has `metadata.author` and `metadata.version`. Every skill has `agents/openai.yaml` with a display name ending in `(NIU)`.
3. **Artifact isolation**: Generated PDFs, videos, audio, and screenshots go to `Temp/` or the skill's own temporary folder, never into version control.
4. **Secrets**: API keys and TTS keys live only in local `ENV` or `.env` files and are never committed.
5. **Development pack**: After changing `lightweight-developments`, validate with:

```bash
cd lightweight-developments && python3 scripts/validate_pack.py && python3 -m unittest discover -s tests
```

Keep [README.zh-CN.md](README.zh-CN.md) in sync when this file changes.
