# TZW Skills

A unified collection of personal Codex and agent skills designed for workflow automation, visual documentation, software engineering, and internal communication.

## Directory Structure

```text
TZW-skills/
├── function-description/               # Product walkthroughs and tutorial generation
│   ├── pdf-tutorial-generation/        # Step-by-step annotated PDF tutorial generation
│   └── tutorial-video-generator/       # Automated scripted video tutorials with Remotion and TTS
├── lightweight-developments/           # Modular engineering skills for the full development lifecycle
│   └── .agents/skills/                 # Core development, review, planning, and delivery skills
├── german-communication/               # Informal German workplace communication assistant
├── web-troubleshoot/                    # Broad and deep web research for difficult problems
├── computer-health-check/              # Read-only macOS checkup: CPU, memory, heat, battery, disk, threats
├── Temp/                               # Disposable artifacts and build cache (git-ignored)
└── .gitignore
```

## Skill Packages & Modules

### 1. Function Description (`function-description/`)

Tools for generating production-ready educational materials and product demonstrations from real user interfaces.

- **PDF Tutorial Generation (`pdf-tutorial-generation`)**
  - **Role**: Transforms UI screenshots (user-provided or captured) into structured, sequential PDF manuals.
  - **Core Highlights**:
    - Precision UI callouts: draws red highlight frames and numbered badges matched to written step cards.
    - Redundant guidance prevention: recognizes existing on-screen markers and inputs to avoid double-annotation.
    - Multilingual flexibility: defaults to German while respecting custom target languages (e.g., English, Chinese).
    - Layout and formatting: built on ReportLab and Pillow for balanced margins, readable typography, and clean step separations without excessive whitespace.
    - Workspace safety: strictly outputs temporary assets, manifests, and compiled PDFs to `Temp/`.

- **Tutorial Video Generator (`tutorial-video-generator`)**
  - **Role**: Produces deterministic, narrated video walkthroughs of web applications driven by a declarative JSON storyboard.
  - **Core Highlights**:
    - Stable browser capture: uses Playwright to navigate, settle asynchronous UI states, and record interactions with mock fixtures.
    - Programmatic rendering: leverages Remotion and React for precise timing, animations, and transitions.
    - Audio and subtitles: integrates external TTS narration (AIHubMix / InferEra) with per-scene timing and word-level subtitle alignment.
    - Self-contained runtime: includes isolated dependencies and pre-render validation checks.

### 2. Lightweight Developments (`lightweight-developments/`)

A comprehensive pack of 22 specialized engineering skills covering day-to-day coding, deep architecture, feature delivery, and verification.

- **Daily Engineering & Analysis**:
  - `brief-to-mini-spec`: Translates ad-hoc feature requests into concise, bounded Mini Specs before writing code.
  - `diagnose`: Formulates hypotheses, examines logs, and identifies root causes before applying targeted bug fixes.
  - `product-analysis`: Conducts safe, read-only investigations on live business data and operational patterns.
  - `code-reading` & `feature-tracing`: Explains code logic, execution order, API flows, and side-effects across components.
  - `state-and-data-modeling`: Reconstructs entity lifecycles, schemas, persistence models, and invariant rules.
  - `logic-audit`: Examines branching logic, boundary conditions, and state transitions to uncover subtle bugs.
  - `verify-change`: Validates small patches and fixes against fresh runtime evidence and regression baselines.
  - `backfill-task`: Implements idempotent, observable, and recoverable data backfill pipelines.

- **Large Feature Planning & Implementation**:
  - `brief-to-spec`: Structures complex feature requirements into formal behavioral specifications.
  - `spec-explainer`: Enriches specifications with detailed workflow pipelines and Mermaid process diagrams.
  - `review-spec` & `doubt-review`: Conducts independent, adversarial reviews to expose unstated assumptions and edge-case risks.
  - `spec-to-plan` & `implement-plan`: Breaks approved specifications into discrete tasks and executes them systematically.
  - `verify-spec`: Verifies full end-to-end spec conformance against production-ready acceptance criteria.

- **Quality, Review & Delivery Operations**:
  - `engineering-quality`: Enforces clear code structure, minimal scope, strong type safety, and maintainability across changes.
  - `code-review`: Reviews diffs for correctness, security, architectural consistency, and error handling.
  - `session-handoff`: Summarizes critical context, decisions, and blockers when switching agent sessions.
  - `ship-change`: Safeguards production release actions with explicit user authorization, pre-flight checks, and rollback plans.

### 3. German Communication (`german-communication/`)

An internal communication skill designed for drafting and polishing German messages within agile, close-knit startup teams.

- **Role**: Assists in writing status reports, team updates, blockers, and inquiries in natural, spoken German.
- **Core Highlights**:
  - Tone and style: adopts an authentic, collegial tone (`du`) that is direct, friendly, and free of bureaucratic fluff.
  - Precision and clarity: leads with the main outcome or question, preserving exact numbers, timelines, and technical facts without unneeded small talk.
  - Anti-patterns: actively eliminates artificial closing formulas, passive phrasing, and excessive filler words.

### 4. Web Troubleshoot (`web-troubleshoot/`)

Investigates difficult production, cloud, integration, and other problems through broad web discovery, deep primary-source tracing, and comparison with local evidence.

- Searches competing explanations, firsthand cases, failed remedies, and version-specific behavior.
- Separates reported experience from verified mechanisms and checks whether solutions apply to our actual environment.
- Produces an evidence-backed comparison, ranked hypotheses, discriminating checks, and an ordered action path.
- Includes on-demand search and cloud-comparison guides plus a report template; responds in Chinese by default.

Invoke with `$web-troubleshoot`, for example: “Research similar cases broadly and deeply, compare them with our environment, and identify missing prerequisites and the next checks.”

### 5. Computer Health Check (`computer-health-check`)

A read-only checkup of the Mac's live state, complementing `computer-software-audit` (which inventories installed software).

- Snapshot script (`scripts/snapshot.sh`, ~10 s, no sudo): CPU and runaway processes, memory pressure and swap, thermal signals, battery and sleep blockers, disk space and I/O, third-party background jobs, running dev services (port, project folder, uptime, orphaned or not) and other developer processes, scheduled tasks (crontab, at, launchd timers and login jobs, jobs loaded from elsewhere, Codex/Claude automations), FileVault/SIP/Gatekeeper/firewall, recent panics and crashes.
- Heat diagnosis guide that names one primary cause with evidence and separates causes from symptoms such as `kernel_task`.
- Threat triage for suspected malware: launchd persistence with signature and payload checks, unsigned binaries in odd locations, kernel/system extensions, authorization plugins, configuration profiles, proxy/DNS/hosts redirection, shell-startup hooks, browser extensions and XProtect version, rated 可疑 / 需确认 / 正常 without running, uploading or removing anything.
- Threshold table and a fixed Chinese report shape; any fix (for example killing an orphaned test runner) happens only after per-item confirmation, followed by a re-check.

Invoke with `$computer-health-check`, for example: “我的电脑很烫，帮我体检一下。”

## Conventions & Guidelines

1. **Artifact Isolation**: Generated files, rendered PDFs, video outputs, audio files, and test screenshots must strictly reside within `Temp/` and remain excluded from version control.
2. **Credential Protection**: API tokens, TTS keys, and secret configurations must be stored in local `ENV` files within the respective skill directories or in the repository root `.env`.
3. **Global Skill Linkage**: Individual skills can be linked to `~/.codex/skills/<skill-name>` via symbolic links for global activation across all Codex environments.
