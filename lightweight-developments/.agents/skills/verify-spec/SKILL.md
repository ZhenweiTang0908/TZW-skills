---
name: verify-spec
description: Perform final acceptance of a completed large feature by tracing every formal-spec requirement to implementation and fresh observable evidence, while identifying omissions, regressions, and out-of-scope behavior. Do not substitute code quality or plan completion for spec compliance.
metadata:
  author: NiuNiu Tang
  version: "0.2.0"
---

# Verify Spec

Independently determine whether the implemented feature satisfies the complete approved specification.

## Use when

A large feature has an approved formal spec and an implementation believed to be complete enough for acceptance.

## Do not use when

- The contract is a Mini Spec or local Fix Contract: use `verify-change`.
- The task only asks whether code quality is acceptable: use `code-review`.
- The user wants deployment or rollout: use `ship-change` after acceptance and explicit authorization.

## Expected input

The approved spec, implementation diff or target revision, repository instructions, relevant review decisions, and access to appropriate test environments.

## Inspect first

Read the approved spec before the plan and implementation notes. Inspect code, tests, migrations, configuration, documentation, and affected integrations. Build a requirement coverage matrix without trusting task-completion claims.

## Process

For every requirement:

1. Identify the implementation path and observable behavior.
2. Select fresh evidence: focused tests, integration tests, runtime checks, logs, schema inspection, or safe environment observations.
3. Execute available verification and record environment and result.
4. Assign exactly one status: `PASS`, `FAIL`, or `NOT VERIFIED`.

Then inspect for missing requirements, important regressions, behavior outside scope, conflicting implementation paths, and incomplete migrations or recovery behavior. Passing tests are evidence only for what they actually cover.

## Output

```markdown
## Requirement Results

### R1 — PASS
Evidence: ...

### R2 — FAIL
Reason: ...

### R3 — NOT VERIFIED
Reason: ...

## Regressions

## Out-of-Scope Implementation

## Overall Result
```

Do not report overall acceptance when any required item fails. State the effect of unverified critical requirements explicitly.

When saving the result, start from [the Spec verification template](assets/spec-verification-template.md). Use `scripts/check_requirement_coverage.py` to detect requirement IDs missing from a draft verification report; the script does not judge whether evidence is valid.

## Permissions and safety

Verification may inspect and run local/test checks and add narrowly necessary verification tests when authorized. It does not authorize changing requirements, silently repairing code, mutating production data, deploying, or weakening acceptance criteria.

## Stop or escalate

Use `NOT VERIFIED` when evidence requires unavailable environments, accounts, providers, data, or dangerous operations. Name the exact verification needed. Route implementation defects back for an authorized fix, then rerun affected checks.

## Routing examples

- Use: Trace `R1`-`R12` of the response subsystem to code and runtime evidence.
- Do not use: Confirm one attachment regression fix. (`verify-change`)
- Borderline: Tests pass but external-provider failure recovery cannot be exercised; mark that requirement `NOT VERIFIED`, not `PASS`.

— NiuNiu Tang
