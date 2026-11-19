---
name: excellence-gap
description: Observe an existing module, feature, data model, or repository area and describe how it would look if it were excellent rather than merely acceptable, in structure, abstractions, design patterns, code expression, API and data-model design, citing the source of each standard. Use when the user wants the gap to excellent design; do not use to find bugs, review diffs, or check basic correctness.
metadata:
  author: NiuNiu Tang
  version: "0.1.0"
---

# Excellence Gap (NIU)

Working code is the starting point, not the goal. Describe what an excellent version of this code would be, how far the current code is from it, and whether closing the gap is worth it. Assume basic correctness is handled elsewhere.

## Use when

The user names a code area and asks whether it is well designed, what an excellent engineer would have done differently, which patterns fit, or what is worth copying.

## Do not use when

- The question is whether code is correct, safe, or acceptable: use `code-review` for a change, `logic-audit` for rules, `diagnose` for failures.
- The user only wants to understand current behavior: use `read-module` or its focused skills.
- The user wants the improvement implemented: route an approved direction through `brief-to-mini-spec` or `brief-to-spec`.

## Inspect first

1. Repository instructions, decision records, recorded traps, and the code the project itself treats as its best reference.
2. The target, its callers, collaborators, tests, and persistence, deeply enough to understand the forces acting on it: change frequency, scale, team conventions, external constraints.
3. Comparable code elsewhere in the same repository. The best local example is often the most persuasive standard.

Reuse an existing explanation from `read-module` or a related skill when available rather than re-deriving it.

## Standards and their sources

Every judgment names its standard and source, in this order of authority:

1. **Project**: the repository's own best reference code, decisions, or recorded lessons. Cite file and line.
2. **Official**: guidance from the language, framework, database, or library authors. Cite the page.
3. **Tool**: a rule encoded in a widely used analyzer or contract tool. Name the tool and rule.
4. **Judgment**: engineering reasoning with no citable source. Label it `Judgment` and argue it; never present it as industry consensus.

A deliberate project decision outranks a generic ideal. Excellence is relative to the forces on this code: a pattern that would be excellent in a large, frequently changing module can be over-engineering in a stable script.

## Dimensions

Examine only the dimensions that matter for the target:

- **Structure**: responsibility boundaries, cohesion, dependency direction, where side effects and policy live, how easily the next likely change lands in one place.
- **Abstractions and patterns**: whether the code has the right concepts, named after the domain; missing abstractions that would remove repeated branching; abstractions that add indirection without earning it; design patterns that fit the actual forces (strategy, state machine, repository, unit of work, pipeline, command, value object, and so on) and patterns used where they do not fit.
- **Code expression**: how directly the code states its intent: naming, shape of functions, explicit data types instead of loose dictionaries, making illegal states unrepresentable, removing incidental complexity.
- **Interfaces**: API and function signatures, what callers must know, consistency across siblings, error contracts.
- **Data model**: how well tables, entities, and states mirror the domain; identity design; state represented once and derived rather than duplicated; constraints that document invariants; naming. Use read-only inspection only.
- **Testability and evolvability**: whether the design makes the important behavior easy to test and the expected changes cheap.

## Process

1. Name the forces: what changes often, what must stay stable, what scale and team conventions apply.
2. For each relevant dimension, describe the current design neutrally.
3. Describe the excellent design concretely for this code, not in the abstract: sketch the structure, names, or signatures it would have.
4. State the gap, why the excellent version is better under these forces, and its cost: migration effort, added concepts, risk.
5. Give a verdict per gap: **Worth closing**, **Adopt for new code only**, or **Leave as is**. Leaving it is a valid conclusion.
6. Record what is already excellent and worth copying elsewhere.

If a correctness defect is noticed in passing, mention it in one line and route it to the appropriate skill; do not let it take over the report.

## Output

Lead with a short verdict: how close the area is to excellent and the single most valuable gap. Then, per gap:

- **Current**: what the code does now, with evidence.
- **Excellent**: the concrete better design for this code.
- **Why better here**: the forces that make it better.
- **Standard**: the rule or exemplar, with source level and citation.
- **Cost**: what closing the gap would take.
- **Verdict**: Worth closing / Adopt for new code only / Leave as is.

Then **Already excellent**: patterns worth copying, with evidence. Then **Unknowns** that would change a verdict.

Use [the excellence-gap template](assets/excellence-gap-template.md) when saving the result.

## Boundaries

Observation only. Do not modify code, schema, or data, and do not turn the report into an implementation plan unless asked.

— NiuNiu Tang
