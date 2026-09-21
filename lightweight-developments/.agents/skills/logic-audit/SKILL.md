---
name: logic-audit
description: Adversarially examine business rules, routing, classification, state transitions, prompts, conditional code, or decision pipelines for counterexamples, contradictions, unreachable states, hidden coupling, and avoidable complexity. Review only; do not automatically change code.
metadata:
  author: NiuNiu Tang
  version: "0.2.0"
---

# Logic Audit

Try to falsify a decision system before recommending that it change.

## Use when

The user asks whether rules are too strict, inconsistent, unnecessarily complex, incomplete, or vulnerable to counterexamples—even when no concrete production failure is known.

## Do not use when

- The primary task is to explain an observed incident: use `diagnose`.
- The primary artifact is a formal feature specification: use `review-spec`.
- The user wants implementation-quality review of a completed diff: use `code-review`.

## Expected input

The rules, code, prompt, state model, examples, or decision contract to audit, plus repository context where behavior depends on surrounding systems.

## Inspect first

Read upstream inputs, downstream consumers, tests, product documentation, data assumptions, state definitions, fallback behavior, and duplicated implementations. Separate intended behavior from accidental current behavior.

## Process

1. State the decision's inputs, outputs, invariants, and precedence rules.
2. List assumptions, including nullability, ordering, timing, identity, and exclusivity.
3. Construct counterexamples around boundaries, overlaps, missing values, reordered events, and conflicting rules.
4. Check for contradictory outcomes, unreachable states, uncovered states, duplicated decisions, and hidden coupling.
5. Compare complexity to the actual behavioral distinctions required.
6. Propose the smallest simplification that preserves confirmed behavior; identify areas that should remain unchanged.
7. Allow the conclusion that no change is warranted.

Use small truth tables or state-transition tables when they clarify real relationships; do not create diagrams for their own sake.

## Output

```markdown
## Confirmed Issues

## Potential Issues

## Counterexamples

## Unnecessary Complexity

## Suggested Simplification

## No-change Areas
```

Tie each confirmed issue to a reproducible input and undesired outcome. Label value judgments or uncertain product intent as potential issues.

When saving the review, start from [the logic audit template](assets/logic-audit-template.md).

## Permissions and safety

This is read-only review. Do not modify rules, prompts, code, or data. Do not assume simpler means behaviorally equivalent; state what would change.

## Stop or escalate

Request a product decision when correctness depends on an unstated policy. If a modification is chosen, route it through `brief-to-mini-spec` or `brief-to-spec` according to scope.

## Routing examples

- Use: "Is this classification logic too strict? Find counterexamples and a simpler equivalent."
- Do not use: "Classification started failing after yesterday's deploy." (`diagnose`)
- Borderline: A prompt plus deterministic post-processing forms one decision pipeline; audit both and their interaction, not only the prompt.

— NiuNiu Tang
