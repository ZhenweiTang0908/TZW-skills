---
name: engineering-quality
description: "Apply lightweight, consistent code-quality constraints while implementing or modifying code: clarity, minimal scope, explicit errors, type safety, existing conventions, and no speculative abstraction. Use alongside an implementation skill, not as a standalone planning or review workflow."
metadata:
  author: NiuNiu Tang
  version: "0.2.0"
---

# Engineering Quality

Use this cross-cutting skill during code changes. Correctness and clarity outrank performative sophistication.

## Use when

Implementing a feature, fix, refactor explicitly within scope, migration code, or a necessary verification test. Compose it with `implement-plan`, an authorized post-`diagnose` fix, or direct implementation of a Mini Spec.

## Do not use when

The task is only specification, planning, investigation, data analysis, handoff, or review. Those workflows may judge quality without loading this implementation constraint.

## Expected input

An approved behavioral contract and the code scope being changed. For planned work, include the relevant plan task.

## Inspect first

Read repository instructions and nearby code, tests, types, error patterns, naming, module boundaries, and formatter or linter configuration. Existing conventions are evidence, not automatic justification for reproducing a known defect.

## Implementation constraints

- Make the smallest coherent change that satisfies the contract.
- Prefer simple, explicit control flow and clear names.
- Preserve type safety; avoid escape hatches unless the boundary genuinely requires one and the reason is documented.
- Handle errors deliberately. Do not swallow exceptions or turn failures into misleading success.
- Keep side effects visible and responsibilities local.
- Avoid speculative architecture, premature generalization, unnecessary dependencies, and abstractions used only once without a concrete clarity benefit.
- Avoid unrelated refactors and formatting churn.
- Remove dead code made obsolete by the change when ownership and scope are clear.
- Comments explain why a non-obvious choice or constraint exists, not what the syntax does.
- Tests should observe behavior and important failure modes, not implementation trivia.

## Self-check

Before reporting implementation complete:

1. Review the diff for scope drift, accidental files, debug output, dead branches, unsafe typing, and hidden behavior changes.
2. Run relevant formatting, static checks, and tests available in the repository.
3. Compare the result to the behavioral contract; do not use the plan as a substitute.
4. Report remaining risks or unverified checks explicitly.

## Output

This skill does not require a separate document. Include concise implementation and self-check evidence in the primary workflow's output.

Use [the developer self-check](assets/developer-self-check.md) when a persistent checklist is useful; do not create a file for trivial work solely to satisfy the template.

## Permissions and safety

This skill does not grant authority to change requirements, broaden scope, mutate production data, merge, deploy, or migrate. Do not "clean up" unrelated code while nearby.

## Stop or escalate

Stop when the minimal correct change conflicts with the approved contract or plan, requires a new dependency or architecture decision, or exposes hidden scope. Explain the conflict and seek direction.

## Routing examples

- Use: Alongside implementing an approved attachment-storage Mini Spec.
- Do not use: To decide whether the attachment requirement is correct. (`brief-to-mini-spec` or `logic-audit`)
- Borderline: A tiny implementation reveals duplicated code; deduplicate only when required for the change's clarity and low risk, otherwise report it separately.

— NiuNiu Tang
