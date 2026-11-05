---
name: state-and-data-modeling
description: Explain current entity lifecycles, state transitions, data relationships, persistence, and invariants from an existing codebase. Use for state, schema, and data-flow understanding without changing code.
metadata:
  author: NiuNiu Tang
  version: "0.1.0"
---

# State and Data Modeling (NIU)

Build the smallest model that explains how an entity changes and how its data is represented.

## Process

1. Find model/type definitions, enums, migrations, repositories, handlers, and events.
2. Identify the entity, its states, transition triggers, guards, and side effects.
3. Identify source-of-truth fields, relationships, keys, constraints, derived values, and persistence boundaries.
4. Check callers and tests for allowed or forbidden transitions and business invariants.
5. Call out unreachable, terminal, ambiguous, or unverified states without inventing rules.

## Output

Explain the model in plain language first. Use a Mermaid `stateDiagram-v2` for lifecycle questions and `erDiagram` for relationship questions; include both only when both are necessary. Keep tables and field lists short. Include evidence for non-obvious transitions and clearly label Fact, Inferred, and Unknown.

## Boundaries

This skill describes the current model. Use `logic-audit` to challenge it, `production-database-analysis` to inspect production records, and specification skills to define a desired future model.

Use [the state-and-data brief template](assets/state-and-data-brief-template.md) when saving the result.

— NiuNiu Tang
