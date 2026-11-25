# Handoff: <task name>

> This template is **flexible**. Rename, merge, reorder or drop sections to fit the task. Add sections the task needs. Only **Objective**, **Done criteria**, and the final **Note** are required. Precision matters more than format: exact paths, exact commands, exact expected results.

## Objective

One sentence. What must be true when this is finished.

## Done criteria

- [ ] Observable, testable condition.
- [ ] Observable, testable condition.
- [ ] Verification command and expected result.

## Repo and environment

- Working directory:
- Branch / base commit:
- Runtime and versions:
- Package manager and install command:
- Environment variables (names only, never values):

## Context

What exists today, why it exists, and what must not change.

- Key files and entry points (path:line):
- Related spec, ADR, issue, or design doc (path or link):
- Current behavior:
- Desired behavior:
- Known constraints, traps, and prior attempts:

## Constraints

- Style and conventions to follow:
- Dependencies allowed or forbidden:
- Files and directories not to touch:
- Performance, security, and compatibility requirements:
- Network access allowed? Which hosts?
- Destructive commands: forbidden unless listed here.

## Plan

Ordered steps. Each step should be independently verifiable; state the check after each step.

1. Step — files — check:
2. Step — files — check:
3. Step — files — check:

## Verification

Exact commands, run from the repo root, with expected output:

```bash
# install
# test
# lint / typecheck / build
```

Acceptance checks:

1.
2.

## Skills, tools, and MCP

- Skills to use (name and path):
- Project-local skills Pi cannot auto-discover (pass with `--skill`):
- MCP servers needed (from `pi mcp list`):
- Allowed installs:
  - `pi install npm:<package>`
  - `pi mcp add <name> -- <command>`
- Installs performed: report them back.

## Reporting back

When done, report:

- Files changed and why.
- Commands run and their output.
- Acceptance checks passed or failed.
- What was installed, if anything.
- Anything blocked, skipped, or left as a TODO.

## Note

Free space. Anything that does not fit above goes here: uncertainties, preferences, warnings, links, names, edge cases, partial thoughts, things you suspect but cannot prove. This is not only for remarks or help notes — you may write anything here.

— NiuNiu Tang
