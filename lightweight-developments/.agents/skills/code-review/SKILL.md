---
name: code-review
description: Review completed code changes for concrete correctness, maintainability, readability, security, complexity, duplication, error handling, hidden coupling, and architectural consistency. Report actionable findings by severity; do not expand into unrelated refactoring or formal-spec acceptance.
metadata:
  author: NiuNiu Tang
  version: "0.2.0"
---

# Code Review

Find implementation defects and meaningful maintenance risks in a completed change. Prefer a few evidenced findings to a catalog of generic best practices.

## Use when

There is a diff, branch, commit range, or completed implementation to review after or during development.

## Do not use when

- The user asks whether the feature satisfies every formal requirement: use `verify-spec`.
- The user asks why a failure occurs: use `diagnose`.
- The artifact is a spec or plan rather than code.

## Expected input

The review target, behavioral contract or task context, repository instructions, and relevant base revision. Clarify the diff boundary when it cannot be inferred safely.

## Inspect first

Read the contract and repository guidance, then inspect the complete relevant diff plus enough surrounding code, tests, callers, types, data flows, and error paths to judge impact. Account for unrelated pre-existing worktree changes and do not attribute them to the target.

## Process

Review for:

- incorrect behavior and broken invariants;
- security, permission, privacy, and data-integrity risks;
- missing or misleading error handling;
- race conditions, retries, idempotency, ordering, and resource lifecycle where relevant;
- maintainability, readability, complexity, duplication, and hidden coupling;
- inconsistent architecture or project conventions;
- tests that miss material behavior or assert implementation trivia.

Validate suspected findings against the actual execution path. Rank by user or operational impact. Do not request unrelated modernization merely because nearby code is imperfect.

## Output

List findings first, ordered by severity. Each finding includes location, triggering condition, impact, evidence, and a focused remediation direction. Then include:

```markdown
## Questions / Assumptions

## Residual Risk

## Review Summary
```

If no actionable findings remain, say so and name the important areas not verified.

When saving the review, start from [the code review template](assets/code-review-template.md).

## Permissions and safety

Review is read-only by default. Do not edit code or broaden scope unless the user explicitly requests fixes. Do not claim feature acceptance solely from code inspection.

## Stop or escalate

Report when generated files, missing dependencies, unavailable history, or environment constraints prevent reliable review. Escalate critical security or data-loss risk immediately and avoid executing a proof that could cause harm.

## Routing examples

- Use: Review the completed attachment-persistence diff for correctness and maintainability.
- Do not use: Determine whether all product requirements were implemented. (`verify-change` or `verify-spec`)
- Borderline: A review reveals an apparent bug but the cause spans runtime state; report it and route deeper investigation to `diagnose`.

— NiuNiu Tang
