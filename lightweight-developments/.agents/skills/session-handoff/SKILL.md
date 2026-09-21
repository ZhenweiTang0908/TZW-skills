---
name: session-handoff
description: Create a compact continuation record when pausing work, changing Codex sessions, switching agents, or approaching context limits. Preserve only decisions, evidence, files, status, blockers, and the next action; do not copy the conversation or create a general project summary.
metadata:
  author: NiuNiu Tang
  version: "0.2.0"
---

# Session Handoff

Leave the next agent enough verified context to continue without replaying the full conversation.

## Use when

Work is being paused, transferred, resumed later, or moved because the active context is becoming unreliable or too large.

## Do not use when

- The task is complete and a normal concise completion report is sufficient.
- The user wants permanent project documentation or a retrospective.
- The goal, decisions, and next step are still too ambiguous to summarize honestly.

## Expected input

The active goal, relevant repository state, confirmed decisions, work performed, verification evidence, unresolved issues, and intended next step.

## Inspect first

Check the current diff or worktree status, relevant artifacts, recent command results, and any authoritative spec or plan. Prefer repository evidence over conversational memory. Do not expose secrets or paste sensitive logs.

## Process

1. State the current goal and active contract.
2. Name only files and components needed to continue.
3. Record confirmed decisions and distinguish assumptions.
4. Summarize completed work and exact verification status.
5. List open issues, blockers, and risky partial state.
6. Give one concrete next step, including the relevant skill when useful.

## Output

```markdown
## Current Goal

## Relevant Files

## Confirmed Decisions

## Completed Work

## Verification Status

## Open Issues

## Next Step
```

Include commands only when their exact form matters for continuation. Link saved specs, plans, or reports rather than reproducing them.

When saving the handoff, start from [the session handoff template](assets/session-handoff-template.md).

## Permissions and safety

Do not modify code merely to make the handoff cleaner. Do not claim unrun checks passed. Redact credentials, personal data, tokens, and production row contents.

## Stop or escalate

If repository state and conversation claims disagree, record the discrepancy rather than choosing one silently. If safe continuation requires a missing user decision, make that the explicit next step.

## Routing examples

- Use: Save context before moving an unfinished multi-day feature to a new session.
- Do not use: Summarize the entire repository for onboarding.
- Borderline: A completed implementation still lacks external verification; hand off the exact unverified requirement and required environment.

— NiuNiu Tang
