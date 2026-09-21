---
name: brief-to-spec
description: Convert an informal, large-feature brief into a formal behavioral specification through repository research and focused requirement clarification. Use for new subsystems, multiple states or modules, permissions, data-model changes, or external integrations; do not use for bounded local changes.
metadata:
  author: NiuNiu Tang
  version: "0.2.0"
---

# Brief to Spec

Turn natural-language product intent into a formal description of what the system should do, without prematurely deciding how to implement it.

## Use when

The feature spans several modules or workflows, introduces meaningful entities or states, changes permissions or persistence, integrates external systems, or carries significant operational risk.

## Do not use when

- A short Mini Spec can uniquely define a bounded change: use `brief-to-mini-spec`.
- The task is investigating a failure: use `diagnose`.
- A formal spec already exists and needs critique: use `review-spec`.

## Expected input

An informal brief, user statements, examples, business context, and access to the existing repository and relevant documentation.

## Inspect first

Read repository instructions, existing workflows and models, related tests and documentation, permission boundaries, integrations, and operational conventions. Distinguish:

- explicit user intent;
- current implementation behavior;
- examples versus universal rules;
- proposed solutions;
- agent assumptions and unknowns.

## Reference selection

Load only the references whose trigger is present in the feature. Do not load every reference or force every dimension into the Spec.

- Read [database data modeling](references/database-data-modeling.md) when the feature creates or materially changes persisted entities, relationships, ownership, lifecycle, or retention.
- Read [Pipeline and State Machine](references/pipeline-and-state-machine.md) when work moves through stages, statuses, queues, transitions, approvals, or long-running orchestration.
- Read [failure recovery](references/failure-recovery.md) when partial failure, retry, compensation, resume, repair, or manual intervention can affect correctness.
- Read [permissions and trust boundaries](references/permissions-and-trust-boundaries.md) when actors have different capabilities or data crosses a security boundary.
- Read [external integrations](references/external-integrations.md) for third-party services, webhooks, public or internal APIs, and provider contracts.
- Read [concurrency, idempotency, and ordering](references/concurrency-idempotency-and-ordering.md) when duplicate, concurrent, delayed, or out-of-order work is possible.
- Read [observability and auditability](references/observability-and-auditability.md) when operators must explain, monitor, or audit behavior.
- Read [migration and compatibility](references/migration-and-compatibility.md) when existing data, clients, events, schemas, or rolling versions must coexist.
- Read [scale and performance](references/scale-and-performance.md) when load, latency, throughput, quotas, or cost can change the design contract.

## Process

1. Define the problem, target users, outcomes, and scope boundary.
2. Select and read only the relevant references above.
3. Map behavior and only the model dimensions required by those references.
4. Use examples and acceptance criteria to make ambiguous behavior concrete.
5. Ask focused questions only when repository evidence cannot resolve a choice that materially changes behavior or scope.
6. Mark unknowns explicitly. Do not promote current behavior or a tentative idea into a requirement without support.
7. Avoid implementation details unless they are themselves externally required constraints.
8. Produce a reviewable draft and stop for specification review and human approval.

## Output

```markdown
# Feature

## Goal and Scope

## Behavior / Requirements

## Model and Boundaries
<!-- Include only relevant model sections selected from the reference guides. -->

## Acceptance Criteria / Examples

## Out of Scope

## Open Questions
```

Give requirements stable identifiers such as `R1`, `R2`, and `R3` when they will be planned and verified independently.

When saving the Spec, start from [the feature Spec template](assets/feature-spec-template.md) and add only sections selected by the relevant references.

## Permissions and safety

Do not change code, data, infrastructure, or external systems. Do not write an implementation plan. Do not hide unresolved choices behind vague words such as "appropriate", "normal", or "as needed".

## Stop or escalate

Stop for user input when competing product interpretations remain. Require human approval before `spec-to-plan`; a polished draft is not implicit approval.

## Routing examples

- Use: Define a new response subsystem with multiple states, permissions, and external delivery providers.
- Do not use: Add one checkbox to an existing form with clear behavior. (`brief-to-mini-spec`)
- Borderline: A visually small control changes authorization and persistence across services; use this formal path.

— NiuNiu Tang
