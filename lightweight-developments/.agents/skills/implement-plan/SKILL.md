---
name: implement-plan
description: Execute a human-approved implementation plan against its approved formal specification, completing meaningful tasks with developer self-checks and reporting plan-to-repository conflicts. Use for planned large features; do not use for unapproved plans, discovery, or deployment.
metadata:
  author: NiuNiu Tang
  version: "0.2.0"
---

# Implement Plan

Implement the approved plan while preserving the approved spec and repository reality. Compose with `engineering-quality`.

## Use when

Both a formal specification and its implementation plan are approved, and the user has authorized code changes.

## Do not use when

- Requirements or plan tasks remain unapproved or materially ambiguous.
- The work is a small direct implementation that does not need a saved plan.
- The requested action is merge, deployment, migration execution, or rollout: use `ship-change` only with explicit authorization.

## Expected input

The approved spec, approved plan, repository instructions, current worktree state, and stated implementation scope.

## Inspect first

Read the spec, then the current plan task, then relevant code and tests. Check worktree status and preserve unrelated user changes. Reconfirm assumptions against the actual repository before editing.

## Process

For each task:

1. State the task outcome and linked requirements.
2. Implement only the coherent scope needed for that outcome, following repository conventions and `engineering-quality`.
3. Add or update behavior-focused tests proportional to risk.
4. Run focused checks and inspect the diff for the task.
5. Record completed work, evidence, deviations, and remaining risks before proceeding.

Continuously compare implementation to the spec. The plan may guide method but cannot override behavior. If a plan step is impossible, obsolete, or unsafe in the real system, pause that path and report a concrete adjustment for approval instead of forcing it.

## Output

```markdown
## Completed Tasks

## Implementation Summary

## Developer Self-Check

## Approved Deviations

## Remaining Work / Risks
```

Do not claim the full feature satisfies the spec; that judgment belongs to `verify-spec`.

For multi-session execution, maintain [the implementation progress template](assets/implementation-progress-template.md).

## Permissions and safety

Implementation authority covers scoped repository changes and ordinary local/test checks. It does not authorize requirement changes, unrelated refactors, production data mutation, merge, deploy, migration execution, or external rollout.

## Stop or escalate

Stop on spec-plan conflict, hidden product decisions, destructive operations, missing authority, unsafe migrations, or scope growth that changes the feature's risk tier. Preserve a usable partial state and explain the next decision.

## Routing examples

- Use: Execute Tasks 1-5 of the approved response-subsystem plan.
- Do not use: "Build something like a response tool" with no spec. (`brief-to-spec`)
- Borderline: A task is obsolete because the repository already provides the behavior; verify that evidence and propose a plan update rather than adding duplicate code.

— NiuNiu Tang
