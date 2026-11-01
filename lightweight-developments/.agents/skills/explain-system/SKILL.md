---
name: explain-system
description: Explain an existing system, code area, feature flow, state lifecycle, or data relationship with concise prose and useful diagrams. Use for understanding current behavior without changing code; route to code-reading, feature-tracing, or state-and-data-modeling as appropriate.
metadata:
  author: NiuNiu Tang
  version: "0.1.0"
---

# Explain System

Build an evidence-based explanation of the current system. This is a read-only understanding workflow: do not implement fixes, redesign the system, or treat inferred behavior as confirmed fact.

## Route

- Use `code-reading` when the user wants to understand a module, class, function, or repository area.
- Use `feature-tracing` when the user asks how a feature executes from trigger to outcome.
- Use `state-and-data-modeling` when the main question concerns lifecycle states, entities, tables, relationships, or invariants.
- For a feature trace, also perform the relevant state and data modeling rather than stopping at a call graph.

## Shared method

1. Read repository instructions and identify the smallest relevant scope.
2. Find entry points, important boundaries, persistence, events/jobs, and failure paths.
3. Separate `Fact` (directly supported), `Inferred` (reasoned from evidence), and `Unknown` (not established).
4. Prefer one useful diagram over several decorative diagrams. Use Mermaid unless the user requests another notation.
5. Cite concrete files and line ranges for important claims. Do not dump large code excerpts.

## Output

Lead with a short plain-language explanation. Then show the primary diagram, followed by only the details needed to understand it: key evidence, important failure/state/data notes, and unknowns. Keep the report compact; do not force a formal specification template.

Use [the observation brief template](assets/observation-brief-template.md) when saving the result.

## Boundaries

Explain System describes current behavior. Use `diagnose` for an observed failure, `logic-audit` to challenge rules or transitions, `production-database-analysis` for production business data, and specification/planning skills when the user wants to define or change behavior.

— NiuNiu Tang
