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

## Conventions & Guidelines

1. **Artifact Isolation**: Generated files, rendered PDFs, video outputs, audio files, and test screenshots must strictly reside within `Temp/` and remain excluded from version control.
2. **Credential Protection**: API tokens, TTS keys, and secret configurations must be stored in local `ENV` files within the respective skill directories or in the repository root `.env`.
3. **Global Skill Linkage**: Individual skills can be linked to `~/.codex/skills/<skill-name>` via symbolic links for global activation across all Codex environments.
