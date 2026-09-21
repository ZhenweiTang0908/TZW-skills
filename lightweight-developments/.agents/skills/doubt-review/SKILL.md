---
name: doubt-review
description: Perform an independent adversarial review of an important spec, plan, architecture decision, diff, migration, business rule, or technical claim against a supplied contract. Use to expose hidden assumptions and unsafe gaps; review only and avoid the author's reasoning when independence matters.
metadata:
  author: NiuNiu Tang
  version: "0.2.0"
---

# Doubt Review

Try to show that an important artifact is wrong, incomplete, unsafe, or unsupported. Independence is more valuable than agreement.

## Use when

The artifact is high-impact, hard to reverse, or deserves an adversarial second pass beyond its ordinary workflow review.

## Do not use when

- A domain-specific first review has not occurred and already covers the need.
- The user wants the artifact created or edited rather than challenged.
- The task is routine code quality review with no separate contract: use `code-review`.

## Expected input

Prefer only:

```text
ARTIFACT
CONTRACT
```

Include essential raw context, but omit the author's conclusions, defense, and detailed reasoning when possible to reduce confirmation bias.

## Inspect first

Read the contract before the artifact. Inspect referenced evidence directly when available. Identify which claims are facts, assumptions, predictions, or value judgments.

## Process

1. Attempt to construct contract violations and counterexamples.
2. Test hidden assumptions about identity, ordering, timing, permissions, failure, scale, compatibility, rollback, and observability as relevant.
3. Look for internal contradictions, missing cases, unsafe operations, hidden coupling, and claims not supported by evidence.
4. Distinguish a confirmed defect from a plausible concern and from a question requiring owner judgment.
5. Prioritize findings by consequence and likelihood. Do not manufacture objections to appear adversarial.

## Output

```markdown
## Confirmed Defects

## Material Risks

## Counterexamples

## Unsupported Claims

## Questions Requiring a Decision

## Review Verdict
```

Each finding should name the violated contract term, triggering condition, and likely impact.

When saving the review, start from [the doubt review template](assets/doubt-review-template.md).

## Permissions and safety

Review only. Do not edit the artifact, code, data, or infrastructure unless separately authorized after the findings are considered.

## Stop or escalate

State when the contract is too vague to judge the artifact. Do not resolve product, legal, security, or operational ownership questions by assumption.

## Routing examples

- Use: Challenge a high-risk migration plan against zero-data-loss and rollback contracts.
- Do not use: Create the migration plan. (`spec-to-plan` or a project-specific workflow)
- Borderline: A spec review can compose with this skill after `review-spec`; keep the adversarial input minimal and independent.

— NiuNiu Tang
