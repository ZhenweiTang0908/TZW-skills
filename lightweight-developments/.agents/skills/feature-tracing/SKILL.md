---
name: feature-tracing
description: Explain how an existing user-visible feature executes across UI, APIs, services, state changes, data writes, jobs, events, and failure paths. Use when the user wants the flow without reading the code themselves.
metadata:
  author: NiuNiu Tang
  version: "0.1.0"
---

# Feature Tracing

Reconstruct the current execution path of a feature from trigger to observable outcome.

## Process

1. Identify the user trigger, entry point, final observable result, and requested scope.
2. Trace the happy path across modules and service boundaries.
3. Trace meaningful validation, permission, failure, retry, and asynchronous paths.
4. Invoke the `state-and-data-modeling` method for entities whose state or persistence explains the feature. Include only models that clarify the trace.
5. Mark transaction boundaries, queues, events, external calls, and idempotency clues.
6. Support important steps with file and line evidence; do not infer a runtime fact from naming alone.

## Output

Lead with a concise narrative. Prefer one Mermaid sequence diagram for cross-component execution, optionally followed by a small state diagram or ER diagram when it materially improves understanding. Explain the important steps in the same order as the diagram. End with evidence and a short list of unknowns or behavior that requires runtime confirmation.

Always distinguish:

- **Fact:** directly shown by code, configuration, tests, or schema.
- **Inferred:** a reasoned interpretation of multiple facts.
- **Unknown:** not established by repository evidence.

## Boundaries

Describe current behavior only. Do not silently convert the trace into a design proposal or implementation plan. Use `diagnose` for an observed incident and `logic-audit` when the user wants adversarial testing of the workflow.

Use [the feature-tracing brief template](assets/feature-tracing-brief-template.md) when saving the result.

— NiuNiu Tang
