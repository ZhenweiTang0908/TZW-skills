---
name: verify-change
description: Verify a completed small feature, local behavior change, or bug fix against its Mini Spec or Fix Contract using fresh observable evidence and focused regression checks. Do not use for full formal-spec acceptance or as permission to rewrite confirmed requirements.
metadata:
  author: NiuNiu Tang
  version: "0.2.0"
---

# Verify Change

Determine whether a bounded change works against its behavioral contract. The contract—not the implementation plan—is authoritative.

## Use when

A small implementation or bug fix is complete enough to test and has a Mini Spec, Fix Contract, or equally clear acceptance target.

## Do not use when

- A large feature must be traced requirement by requirement to a formal spec: use `verify-spec`.
- The cause of the issue is still unknown: use `diagnose`.
- The task is only code-quality review: use `code-review`.

## Expected input

The Mini Spec or Fix Contract, the implementation diff, repository instructions, and access to an appropriate local or test environment.

## Inspect first

Read the contract before the plan or implementation notes. Inspect the diff, affected tests, adjacent behavior, available test commands, environment limitations, and existing evidence. Treat old or reported results as context, not fresh proof.

## Process

1. Convert each target behavior and preservation constraint into an observable check.
2. Inspect implementation only to identify test surfaces and regression risk, not to redefine success.
3. Run the narrowest meaningful checks, then broader existing checks proportional to risk.
4. Add a focused verification test when authorized and necessary to observe the contract. Do not alter business logic silently.
5. Reproduce the original failure for a fix when practical, then verify it is absent under the same conditions.
6. Record command, environment, result, and relevant output. Distinguish not run from failed.

## Output

```markdown
## Passed

## Failed

## Not Verified

## Evidence
```

Every success claim needs fresh evidence from this verification pass. A passing linter does not prove runtime behavior; a narrow test does not prove unrelated areas.

When saving the result, start from [the change verification template](assets/change-verification-template.md).

## Permissions and safety

Allowed by default: inspect changes, run existing tests and local/test environments, inspect logs and test databases, and add a necessary verification test within the requested code scope.

Do not lower acceptance criteria, weaken tests, edit confirmed requirements, or silently change business code to obtain a pass. Report a discovered implementation defect and stop unless the user has also authorized repair.

## Stop or escalate

Mark `Not Verified` when required infrastructure, credentials, external systems, fixtures, or observability are unavailable. Explain exactly what remains and what evidence would close the gap.

## Routing examples

- Use: Verify that stored attachments remain downloadable after the source email is deleted and that filtering is unchanged.
- Do not use: Accept a new multi-service response subsystem against twenty formal requirements. (`verify-spec`)
- Borderline: A supposedly local fix changes a shared state model; report the scope mismatch and recommend formal feature verification.

— NiuNiu Tang
