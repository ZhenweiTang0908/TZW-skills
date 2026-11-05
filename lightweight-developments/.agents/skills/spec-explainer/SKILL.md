---
name: spec-explainer
description: Enrich a Mini Spec or formal Spec with detailed Pipeline and Workflow explanations, concrete scenarios, and Mermaid diagrams for stages, branches, state transitions, retries, and failure paths. Use alongside Spec-writing when the process is difficult to understand from prose alone.
metadata:
  author: NiuNiu Tang
  version: "0.1.0"
---

# Spec Explainer (NIU)

Make a Spec easy to review by explaining not only what the system must do, but also how a Pipeline or Workflow unfolds from a user's, service's, or operator's perspective. This skill supplements `brief-to-mini-spec` or `brief-to-spec`; it does not turn requirements into an implementation plan.

## Use when

- The request contains multiple actors, services, stages, statuses, queues, or branching rules.
- The request defines a Pipeline, Workflow, approval chain, asynchronous process, or long-running orchestration.
- A reviewer could misunderstand the behavior without seeing a sequence, state transition, or decision tree.
- The Spec needs explicit examples for success, rejection, retry, timeout, cancellation, or recovery.
- The user asks for a more detailed, visual, or explainable Spec.

## Do not use when

- The task is only a bounded, obvious behavior change and prose is sufficient.
- The user wants an implementation plan; use `spec-to-plan` after the Spec is approved.
- The task is explaining current behavior only; use `explain-system`, `feature-tracing`, or `state-and-data-modeling`.

## Process

1. Read the existing brief or Spec and preserve its requirements, scope, and unresolved questions.
2. If the Spec explains existing code or uses repository evidence, follow the presentation discipline of `code-reading`: start with a short mental model, show one useful relationship diagram, and label claims as Fact, Inferred, or Unknown. For future behavior, distinguish requirements from repository facts.
3. When stages, queues, statuses, approvals, or long-running work are present, read [Pipeline and State Machine](../brief-to-spec/references/pipeline-and-state-machine.md) and model both the processing flow and the durable state contract where both matter.
4. Identify the smallest set of concepts that need explanation: actors, triggers, stages, inputs/outputs, states, decisions, checkpoints, ownership changes, external boundaries, and failure paths.
5. Add a short plain-language walkthrough before or alongside each complex section. Define unfamiliar terms once.
6. Add diagrams only where they reduce ambiguity. Prefer Mermaid:
   - `flowchart` for branching decisions and business rules;
   - `sequenceDiagram` for cross-actor or cross-service interactions;
   - `stateDiagram-v2` for lifecycle and status transitions;
   - `erDiagram` for entity relationships when ownership or cardinality matters.
7. For a Pipeline or Workflow, explain stages in order using a stage table, then show the path visually. Include entry/exit conditions, stage inputs/outputs, sync/async boundaries, checkpoints, retries, joins, cancellation, expiration, and ownership transfer when relevant.
8. Keep the three questions separate: a flowchart explains processing order and branching; a state diagram explains legal durable states and transitions; a sequence diagram explains who calls whom and when. Never use a sequence diagram as the state contract.
9. Ensure every diagram has a prose interpretation and does not introduce behavior absent from the requirements.
10. Add concrete Given/When/Then examples for the normal path and the highest-risk alternate paths.
11. Make assumptions, unknowns, and diagram simplifications explicit. Do not invent implementation details merely to complete a picture.
12. Keep diagrams readable: split unrelated flows, use meaningful node names, and avoid diagrams so large that they are harder to review than prose.

## Required output additions

Use [the detailed Spec template](assets/detailed-spec-template.md) when creating a new artifact, or add the equivalent sections to an existing Spec:

- `How to Read This Spec`: a brief overview of the actors and main journey.
- `Behavior Walkthrough`: numbered normal and alternate paths in plain language.
- `Pipeline / Workflow Model`: ordered stages, entry/exit conditions, inputs/outputs, sync/async boundaries, checkpoints, retry and recovery behavior, and ownership changes.
- `Transition Table`: from/trigger/guard/to/observable result for durable states when a state machine is involved.
- `Visual Models`: only the diagrams needed to explain the behavior, each with a caption and interpretation.
- `Decision Rules`: explicit conditions, precedence, defaults, and terminal outcomes.
- `Examples and Edge Cases`: observable examples tied to requirement IDs.
- `Assumptions and Unknowns`: facts, inferences, and unresolved decisions kept separate.

Stable requirement IDs must remain intact. Diagrams and examples should reference those IDs where practical, for example `R3` or `AC2`, so reviewers can trace explanation back to the contract.

## Diagram quality rules

- A diagram explains a relationship; it is not decorative.
- Use one diagram for one question. Split lifecycle, sequence, and decision logic when they answer different questions.
- For Pipeline work, lead with the stage-by-stage walkthrough and a flowchart; add a state diagram and sequence diagram only when they answer separate review questions.
- Make checkpoints and restart behavior visible. A reader should be able to answer “where does this resume?” and “what is safe to repeat?” from the Spec.
- Show failure, retry, timeout, cancellation, and manual-intervention paths when they affect correctness or user expectations.
- Mark external systems and trust boundaries clearly.
- Do not use a diagram to hide ambiguity. If two interpretations are possible, show the ambiguity as an open question instead.
- If Mermaid rendering is unavailable, keep the Mermaid source and provide a concise text fallback.

## Boundaries

Do not modify code, data, infrastructure, or external systems. Do not silently resolve product choices. Stop and ask for clarification when a missing decision changes the requirements, actor permissions, state transitions, or acceptance criteria.

## Routing examples

- Use with `brief-to-spec`: design a multi-stage approval flow and explain it with a stage model, flowchart, state diagram, sequence diagram, and rejection/retry examples.
- Use with `brief-to-mini-spec`: document a small but branching UI behavior where a decision tree prevents misunderstanding.
- Do not use for a codebase walkthrough with no future behavior change; use `feature-tracing` or `explain-system`.

— NiuNiu Tang
