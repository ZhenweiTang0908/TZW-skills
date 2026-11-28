---
name: code-review
description: Review code changes for concrete defects; challenge a spec, plan, or migration against its contract; audit business rules and state transitions for counterexamples. Review only, reports evidenced findings by severity. [NIU]
metadata:
  author: NiuNiu Tang
  version: "0.3.0"
---

# Code Review (NIU)

Find concrete defects and meaningful risks. Prefer a few evidenced findings to a catalog of generic best practices. Review only: do not edit code, data, or infrastructure unless the user explicitly asks for fixes.

## Pick a mode

| Mode | Use when | Target | Output template |
|---|---|---|---|
| **Change** (default) | A diff, branch, commit range, or completed implementation needs review | The code change | [code review template](assets/code-review-template.md) |
| **Contract** | An important artifact (spec, plan, architecture decision, migration, business claim) needs an independent challenge against a contract | ARTIFACT + CONTRACT | [code review template](assets/code-review-template.md) |
| **Decision logic** | Rules, routing, classification, state transitions, prompts, or conditional code need falsification, even without an incident | The rule system, plus anything that feeds it or consumes it | [code review template](assets/code-review-template.md) |

Choose the mode from the target. If the user's request does not make it clear, pick the mode that fits the artifact and say which one you used.

## Do not use when

- The user asks whether the feature satisfies every formal requirement. Say acceptance against a spec is outside this skill.
- The user asks why a failure occurs: use `diagnose`.
- The user wants an artifact drafted or changed rather than challenged.
- The user wants to understand existing behavior without judging it: use `read-module`, `read-code-vertically`, or `read-state-and-model`.

## Mode: Change

Inspect the complete relevant diff plus enough surrounding code, tests, callers, types, data flows, and error paths to judge impact. Account for unrelated pre-existing worktree changes and do not attribute them to the target.

Review for:

- incorrect behavior and broken invariants;
- security, permission, privacy, and data-integrity risks;
- missing or misleading error handling;
- race conditions, retries, idempotency, ordering, and resource lifecycle where relevant;
- maintainability, readability, complexity, duplication, and hidden coupling;
- inconsistent architecture or project conventions;
- tests that miss material behavior or assert implementation trivia.

Validate suspected findings against the actual execution path. Rank by user or operational impact. Do not request unrelated modernization merely because nearby code is imperfect.

## Mode: Contract

Read the contract before the artifact. Inspect referenced evidence directly when available. Omit the author's defense and conclusions when possible.

1. Construct contract violations and counterexamples.
2. Test hidden assumptions about identity, ordering, timing, permissions, failure, scale, compatibility, rollback, and observability, as relevant.
3. Look for internal contradictions, missing cases, unsafe operations, hidden coupling, and claims without evidence.
4. Separate confirmed defects from plausible concerns and from questions needing an owner's decision.
5. Prioritize by consequence and likelihood. Do not manufacture objections to look adversarial.

Each finding names the violated contract term, the triggering condition, and the likely impact. State when the contract is too vague to judge. Do not resolve product, legal, security, or operational ownership by assumption.

## Mode: Decision logic

1. State the decision's inputs, outputs, invariants, and precedence rules.
2. List assumptions: nullability, ordering, timing, identity, exclusivity.
3. Construct counterexamples at boundaries, overlaps, missing values, reordered events, and conflicting rules.
4. Check for contradictory outcomes, unreachable or uncovered states, duplicated decisions, and hidden coupling. For a prompt plus deterministic post-processing, audit both and their interaction.
5. Compare complexity to the behavioral distinctions actually required.
6. Propose the smallest simplification that preserves confirmed behavior, and say what would change if behavior is not identical. Allow the conclusion that no change is warranted.

Use small truth tables or state-transition tables only when they clarify real relationships. Label value judgments or uncertain product intent as potential issues. Request a product decision when correctness depends on an unstated policy.

## Output

List findings first, ordered by severity. Each finding includes location or rule path, triggering condition, impact, evidence, and a focused remediation direction. Then include the sections of the mode's template, always ending with a residual-risk or no-change note. If nothing actionable remains, say so and name the important areas not verified.

Do not claim feature acceptance solely from code inspection or from a review pass.

## Stop or escalate

- Report when generated files, missing dependencies, unavailable history, or environment constraints prevent reliable review.
- Escalate critical security or data-loss risk immediately, and do not execute a proof that could cause harm.
- Route deeper root-cause work to `diagnose`.

## Routing examples

- Change: "Review the completed attachment-persistence diff for correctness and maintainability."
- Contract: "Challenge this migration plan against the zero-data-loss and rollback requirements in the brief."
- Decision logic: "Is this classification logic too strict? Find counterexamples and a simpler equivalent."
- Do not use: "Classification started failing after yesterday's deploy." (`diagnose`)
- Borderline: A change-mode review reveals an apparent bug whose cause spans runtime state; report it and route deeper investigation to `diagnose`.

— NiuNiu Tang
