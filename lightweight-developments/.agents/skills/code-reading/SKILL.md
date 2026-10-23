---
name: code-reading
description: Help understand an existing module, class, function, or repository area by reconstructing responsibilities, reading order, dependencies, side effects, and evidence. Use for explanation only, not for changing code.
metadata:
  author: NiuNiu Tang
  version: "0.1.0"
---

# Code Reading

Turn a code area into a usable mental model for someone who does not want to read every file.

## Process

1. Establish the requested scope and inspect repository instructions.
2. Locate the public entry point, then follow the smallest meaningful path through callers, collaborators, persistence, and external boundaries.
3. Identify each component's responsibility and the recommended reading order.
4. Note control flow, data flow, side effects, error handling, and important configuration.
5. Validate claims against tests, types, routes, migrations, or callers when available.

## Output

Start with a short explanation of what the area does and how to read it. Add one Mermaid flowchart or component diagram when relationships are easier to see visually. Include a small list of key files with why each matters, then concise evidence and unknowns. Label claims as Fact, Inferred, or Unknown. Avoid line-by-line paraphrase and broad unrelated architecture tours.

## Boundaries

Do not propose or implement changes unless separately requested. For an end-to-end user-visible feature, route to `feature-tracing`; for lifecycle or schema questions, route to `state-and-data-modeling`.

Use [the code-reading brief template](assets/code-reading-brief-template.md) when saving the result.

— NiuNiu Tang
