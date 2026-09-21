---
name: brief-to-mini-spec
description: Convert a small, bounded, free-form feature request or behavior change in an existing codebase into a concise Mini Spec before implementation. Do not use for debugging, production-data analysis, or architectural features.
metadata:
  author: NiuNiu Tang
  version: "0.2.0"
---

# Brief to Mini Spec

Turn informal input into the smallest useful behavioral contract. Stop after the Mini Spec; do not implement the change under this skill.

## Use when

- The request changes a local UI, behavior, workflow step, or small feature in an existing system.
- Scope and rollback cost appear bounded, with no major schema, permission, migration, or subsystem design.

## Do not use when

- An observed bug or failure needs root-cause investigation: use `diagnose`.
- The request primarily asks questions of production data: use `product-analysis`.
- The change introduces multiple states, modules, permissions, external integrations, or meaningful data-model changes: use `brief-to-spec`.

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
4. If hidden complexity appears, recommend escalation to `brief-to-spec` and explain the concrete trigger.
5. Produce a short Mini Spec.

## Output

```markdown
## Goal

## Expected Behavior

## Constraints / Out of Scope

## Open Questions

## Verification Target
```

Omit empty prose, but retain `Open Questions` with `None` when the contract is implementable as written. Verification targets must be observable, not implementation instructions.

When saving the artifact, start from [the Mini Spec template](assets/mini-spec-template.md).

## Safety and stopping conditions

- Do not modify code, data, infrastructure, or external systems.
- Do not convert words such as "maybe", "could", or "for example" into mandatory behavior.
- Stop and request a decision when two plausible interpretations create materially different behavior.

## Routing examples

- Use: "Keep candidate attachments downloadable after the source email is deleted; do not change filtering."
- Do not use: "Why were two contacts created? Investigate first." (`diagnose`)
- Borderline: A local setting becomes a new role-based state shared across services; escalate to `brief-to-spec`.

— NiuNiu Tang
