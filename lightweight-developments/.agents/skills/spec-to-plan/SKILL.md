---
name: spec-to-plan
description: Convert a human-approved formal specification into an implementation plan of independently meaningful, verifiable tasks tied to requirement identifiers. Use after spec review and approval; do not redefine requirements or use for a small change that needs only native planning.
metadata:
  author: NiuNiu Tang
  version: "0.2.0"
---

# Spec to Plan

Describe how this repository should implement an approved specification. The spec remains the authority on behavior.

## Use when

A reviewed formal spec has explicit human approval and the feature needs coordinated work across meaningful components or stages.

## Do not use when

- The spec is draft, disputed, or has unresolved blocking questions.
- The task is a bounded Mini Spec that Codex can implement directly or with native plan mode.
- The user asks to execute an existing plan: use `implement-plan`.

## Expected input

The approved spec with requirement identifiers, review resolution, repository instructions, and access to the current codebase.

## Inspect first

Read the approved spec before exploring implementation. Inspect architecture, related code and tests, dependency direction, data migrations, rollout conventions, integration boundaries, and existing patterns. Check whether the spec's assumptions match the real repository.

## Process

1. Map every requirement to affected components and observable verification.
2. Identify dependencies, migration or compatibility sequencing, and shared foundations.
3. Divide work into tasks that each produce an independently meaningful, reviewable outcome. Fold incidental setup into the task that needs it.
4. State expected files or components without pretending paths are certain when discovery is incomplete.
5. Include task-level verification and a final spec-level verification stage.
6. Avoid full implementation code, mechanical microsteps, mandatory commits, and unrelated cleanup.
7. If repository reality conflicts with the spec, report the conflict; do not silently reinterpret the requirement.

## Output

For each task:

```markdown
## Task N: <Outcome>

### Task Goal

### Relevant Spec Requirements

### Expected Files / Components

### Dependencies

### Implementation Scope

### Verification
```

Add a requirement-to-task coverage table when there are enough requirements that omissions would be hard to see.

When saving the plan, start from [the implementation plan template](assets/implementation-plan-template.md).

## Permissions and safety

Do not modify code or external state. Do not change approved behavior for implementation convenience. Call out irreversible, production, security, permission, and migration steps explicitly; planning them does not authorize them.

## Stop or escalate

Stop if the spec is not approved, a requirement cannot be uniquely implemented, or repository evidence reveals a material architecture or product decision absent from the spec.

## Routing examples

- Use: Plan an approved multi-service response feature with `R1` through `R12`.
- Do not use: Decide what `R4` should mean. Return to `review-spec` or the user.
- Borderline: A plan has one meaningful task; recommend direct implementation instead of manufacturing subtasks.

— NiuNiu Tang
