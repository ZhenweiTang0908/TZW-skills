# TZW Skills

A personal repository of Codex and agent skills for automated workflows, tutorial generation, and development assistance.

## Directory Structure

```text
TZW-skills/
├── function-description/               # Tutorial generation and product demo skills
│   ├── pdf-tutorial-generation/        # Step-by-step PDF tutorial generation skill
│   └── tutorial-video-generator/       # Automated narrated video tutorial skill
├── lightweight-developments/           # Lightweight developer skill pack
├── german-communication/               # German workplace and technical communication skill
├── Temp/                               # Workspace for generated outputs and temporary assets (git-ignored)
└── .gitignore
```

## Featured Skills

### 1. Function Description (Walkthroughs & Tutorials)

- **PDF Tutorial Generation (`pdf-tutorial-generation`)**
  - **Overview**: Turns interface screenshots (user-supplied or captured) into clean, step-by-step PDF guides with clear visual callouts.
  - **Key Features**:
    - Applies red target boxes and numbered badges across multi-step flows without duplicating existing UI labels.
    - Defaults to German, while supporting user-specified target languages such as English or Chinese.
    - Uses ReportLab and Pillow for deterministic layouts, clear typography, and tight page breaks.
    - Automatically places build artifacts, previews, and final PDFs in `Temp/` to keep the repository clean.

- **Tutorial Video Generator (`tutorial-video-generator`)**
  - **Overview**: Builds reproducible, narrated video walkthroughs of web applications directly from JSON storyboards.
  - **Key Features**:
    - Captures stable UI states and interaction targets using Playwright.
    - Renders smooth, deterministic video output with Remotion.
    - Integrates scene-level TTS speech generation with synchronized subtitle tracks.

### 2. Lightweight Developments

A modular skill pack for everyday software engineering tasks, including code reading, specification refinement, logic audits, and system diagnosis.

### 3. German Communication

A dedicated assistant skill tailored for professional dialogue and collaborative communication in German.

## Conventions & Guidelines

1. **Output Isolation**: All generated PDFs, MP4s, audio tracks, and cropped screenshots belong in the root `Temp/` directory and must remain untracked.
2. **Credential Safety**: Keep sensitive environment variables and API keys inside local `ENV` or `.env` files, which are ignored by `.gitignore`.
3. **Global Linkage**: Skills can be symlinked into `~/.codex/skills/` for system-wide availability across Codex sessions.
