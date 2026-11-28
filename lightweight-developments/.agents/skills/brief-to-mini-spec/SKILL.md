---
name: brief-to-mini-spec
description: Turn a small, bounded behavior change in an existing codebase into a concise Mini Spec before implementation, with a walkthrough and diagrams when the flow branches. Not for debugging, production data, or large features. [NIU]
metadata:
  author: NiuNiu Tang
  version: "0.3.0"
---

# Brief to Mini Spec (NIU)

Turn informal input into the smallest useful behavioral contract, then explain it so a reviewer can follow it. Stop after the Mini Spec; do not implement the change under this skill.

## Use when

- The request changes a local UI, behavior, workflow step, or small feature in an existing system.
- Scope and rollback cost appear bounded, with no major schema, permission, migration, or subsystem design.

## Do not use when

- An observed bug or failure needs root-cause investigation: use `diagnose`.
- The request primarily asks questions of production data: use `production-database-analysis`.
- The change introduces multiple states, modules, permissions, external integrations, or meaningful data-model changes. Stop, report that the scope exceeds a Mini Spec, and let the user decide how to proceed. (`brief-to-spec` is deprecated.)

## Expected input

A free-form request plus access to the relevant repository. User feedback, voice transcription, and tentative solution ideas are valid input; they are not automatically requirements.

## Inspect first

Read the nearest repository instructions, relevant implementation, tests, documentation, schemas, and established patterns. Determine:

- explicitly requested behavior;
- current behavior supported by evidence;
- user-proposed approaches;
- your own assumptions.

Do not ask for information that the repository can answer. Ask only when an unresolved choice materially changes visible behavior, scope, data handling, or compatibility.

## Process

1. Restate the behavioral outcome in one or two sentences.
2. Identify the smallest user-visible success path and preservation constraints.
3. Separate exclusions from unknowns. Do not invent broad edge-case catalogs.
4. If hidden complexity appears (multiple states, permissions, async stages, external systems), stop and escalate as described under "Do not use when".
5. Produce the Mini Spec.
6. Explain it. If the behavior has branches, multiple actors, stages, statuses, retries, or failure paths, add the walkthrough and diagrams described below. A purely linear change needs only a short walkthrough.

## Output

```markdown
## Goal

## Expected Behavior

## Walkthrough

## Constraints / Out of Scope

## Open Questions

## Verification Target
```

Omit empty prose, but retain `Open Questions` with `None` when the contract is implementable as written. Verification targets must be observable, not implementation instructions.

When saving the artifact, start from [the Mini Spec template](assets/mini-spec-template.md).

## Walkthrough and diagrams

Write the `Walkthrough` section as numbered normal and alternate paths in plain language. Define unfamiliar terms once. Add a diagram only where it removes ambiguity:

- `flowchart` for branching decisions and business rules;
- `sequenceDiagram` for cross-actor or cross-service calls;
- `stateDiagram-v2` for lifecycle and status transitions.

Rules:

- One diagram answers one question. Keep processing order (flowchart), legal durable states (state diagram), and who calls whom (sequence diagram) separate. Never use a sequence diagram as the state contract.
- Each diagram gets a short prose interpretation and must not introduce behavior absent from the requirements.
- Show failure, retry, timeout, or cancellation paths only when they affect correctness or user expectations.
- Do not use a diagram to hide ambiguity. Show two plausible readings as an open question instead.
- Tie examples to requirement IDs where practical (for example `R1`), and add Given/When/Then examples for the normal path and the riskiest alternate path.
- Keep diagrams readable: use meaningful node names, and split unrelated flows.
- If Mermaid cannot be rendered, keep the Mermaid source and add a concise text fallback.

## Safety and stopping conditions

- Do not modify code, data, infrastructure, or external systems.
- Do not convert words such as "maybe", "could", or "for example" into mandatory behavior.
- Stop and request a decision when two plausible interpretations create materially different behavior.
- Do not silently resolve product choices.

## Routing examples

- Use: "Keep candidate attachments downloadable after the source email is deleted; do not change filtering."
- Use: "Send rejected candidates to a review queue; explain the branch with a flowchart and a rejection example."
- Do not use: "Why were two contacts created? Investigate first." (`diagnose`)
- Borderline: A local setting becomes a new role-based state shared across services; stop and report that it exceeds a Mini Spec.

— NiuNiu Tang
