---
name: review-spec
description: Independently review a draft formal feature specification against the original brief and existing-system context for omissions, contradictions, ambiguity, hidden assumptions, unverifiable requirements, conflicts, and unnecessary scope. Do not implement or rewrite the feature by default.
metadata:
  author: NiuNiu Tang
  version: "0.2.0"
---

# Review Spec

Find concrete defects that would cause two reasonable implementers to build different systems or make the result impossible to verify.

## Use when

A formal feature specification exists and should be checked before human approval or implementation planning.

## Do not use when

- The brief has not yet been converted into a spec: use `brief-to-spec`.
- The artifact is an implementation plan, diff, or production incident.
- The request is a general adversarial review without spec-specific context: use `doubt-review`.

## Expected input

The original brief and relevant user statements, the draft specification, and the minimum repository context needed to understand existing behavior and constraints.

## Inspect first

Read the brief before the draft. Then inspect relevant code, models, tests, documentation, permission boundaries, and integrations. Do not assume the current implementation defines correct product intent.

## Process

Review each requirement for:

1. fidelity to the original intent;
2. missing behavior or acceptance boundaries;
3. internal contradiction or precedence conflicts;
4. terms that admit materially different interpretations;
5. hidden assumptions about state, identity, timing, permissions, or failures;
6. observable verification;
7. unexplained conflict with the existing system;
8. unnecessary scope or implementation detail.

Rank findings by implementation impact. Cite requirement identifiers and explain the divergent outcomes, not generic quality advice. Suggest precise wording only where it resolves a specific issue.

## Output

```markdown
## Blocking Issues

## Important Issues

## Minor Clarifications

## Unnecessary Scope

## Verification Gaps

## Review Result
```

Use a concrete form such as: "R4 uses `delete` without naming the deleted object. Deleting the source message and deleting the stored attachment require opposite persistence behavior, so the requirement cannot be implemented uniquely."

When saving the review, start from [the Spec review template](assets/spec-review-template.md).

## Permissions and safety

Review only. Do not alter the spec unless the user requests edits. Do not invent requirements to make the document feel complete.

## Stop or escalate

The result is not approved while blocking issues remain. Send unresolved product decisions to the user; send implementation discoveries back to spec drafting rather than burying them in a plan.

## Routing examples

- Use: Review a drafted response-tool spec against the original product brief.
- Do not use: Review whether the response-tool code uses clear error handling. (`code-review`)
- Borderline: For high-risk specs, compose with `doubt-review`, giving that reviewer only the artifact and contract where possible.

— NiuNiu Tang
