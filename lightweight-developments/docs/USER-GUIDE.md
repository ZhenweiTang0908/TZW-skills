# Lightweight Developments User Guide

Use this skill pack by describing the work naturally. Codex should select the smallest workflow that can produce reliable evidence. Invoke a skill explicitly with `$skill-name` only when you want to force or correct routing.

## Workflow map

```text
Natural-language request
│
├─ 1. Change existing product behavior?
│  │
│  ├─ Small and bounded
│  │    $brief-to-mini-spec
│  │      → Mini Spec
│  │      → direct implementation or native Plan Mode
│  │      → + $engineering-quality while changing code
│  │      → $verify-change when focused verification is needed
│  │
│  └─ Large, multi-module, stateful, or high-risk
│       $brief-to-spec
│         → load only relevant modeling references
│         → Formal Spec
│       $review-spec [optionally + $doubt-review]
│         → human approval
│       $spec-to-plan
│         → Implementation Plan
│       $implement-plan + $engineering-quality
│         → implementation and developer self-check
│       $verify-spec [optionally + $code-review]
│         → requirement-by-requirement acceptance
│       $ship-change
│         → only after explicit merge/deploy/migration authorization
│
├─ 2. Something is broken or unexpected?
│    $diagnose
│      → facts → localization → hypotheses → root cause
│      → Mini Fix Contract
│      → authorized fix + $engineering-quality
│      → $verify-change
│
├─ 3. Question about production business data?
│    $product-analysis
│      → verify production profile and read-only controls
│      → bounded queries and cross-checks
│      → findings, anomalies, explanations, limitations
│      ✕ never repair or mutate production data
│
├─ 4. Are rules or decisions too strict or complex?
│    $logic-audit
│      → assumptions → counterexamples → contradictions
│      → simplification opportunities
│      ├─ no change needed → stop
│      └─ change chosen → $brief-to-mini-spec or $brief-to-spec
│
└─ 5. Supporting actions
     $session-handoff  → preserve minimal continuation context at any stage
     $doubt-review     → independently challenge an important artifact
     $code-review      → review completed implementation quality
     $ship-change      → perform an explicitly authorized delivery action
```

## Choose a branch

| Starting intent | Start with | Primary result |
|---|---|---|
| Change one bounded behavior | `$brief-to-mini-spec` | Mini Spec |
| Design a substantial feature or subsystem | `$brief-to-spec` | Formal Spec |
| Explain an observed bug or failure | `$diagnose` | Root cause or ranked hypotheses |
| Analyze production records or operations | `$product-analysis` | Read-only analysis report |
| Challenge business or decision logic | `$logic-audit` | Counterexamples and simplification assessment |
| Verify a local fix or small feature | `$verify-change` | Passed, Failed, and Not Verified results |
| Verify an entire formal feature | `$verify-spec` | Requirement-to-evidence acceptance matrix |
| Continue work in another session | `$session-handoff` | Minimal handoff record |
| Merge, deploy, migrate, or roll out | `$ship-change` | Controlled delivery and post-check report |

## Branch 1A: small or bounded change

Purpose: modify an existing flow without manufacturing a large design process.

```text
$brief-to-mini-spec
  1. Inspect relevant code, tests, and documentation.
  2. Separate requested behavior, current behavior, proposals, and assumptions.
  3. Ask only behavior-changing questions that the repository cannot answer.
  4. Produce Goal, Expected Behavior, Constraints, Open Questions,
     and Verification Target.

Implementation
  5. Implement directly or use native Plan Mode when useful.
  6. Apply $engineering-quality during code changes.
  7. Perform the developer self-check.

$verify-change
  8. Verify the Mini Spec with fresh evidence and focused regression checks.
```

Example: "Keep candidate attachments downloadable after the source email is deleted. Do not change filtering."

Escalate to the large-feature branch if implementation reveals new states, permissions, schema changes, external systems, difficult migration, or broad rollback risk.

## Branch 1B: substantial feature

Purpose: preserve a clear separation between intended behavior, implementation approach, code, and acceptance evidence.

```text
$brief-to-spec
  1. Inspect the current system and original brief.
  2. Select only relevant modeling references.
  3. Define requirements, boundaries, examples, exclusions, and open questions.

$review-spec
  4. Find concrete ambiguity, omissions, contradictions, and unverifiable rules.
  5. Resolve blocking issues and obtain human approval.

$spec-to-plan
  6. Map requirements to meaningful implementation tasks and verification.

$implement-plan + $engineering-quality
  7. Execute approved tasks without changing the Spec for convenience.
  8. Run task-level self-checks and report deviations.

$verify-spec
  9. Assign PASS, FAIL, or NOT VERIFIED to every requirement using fresh evidence.
```

`$brief-to-spec` can load these dimensions only when relevant: database data modeling, Pipeline and State Machine, failure recovery, permissions, external integrations, concurrency and idempotency, observability, migration and compatibility, and scale and performance.

Add `$doubt-review` for high-risk design or migration decisions. Add `$code-review` after implementation when an independent quality review is valuable. Neither substitutes for `$verify-spec`.

## Branch 2: diagnosis and fix

Purpose: explain an observed failure before changing business behavior.

```text
$diagnose
  1. Define expected versus observed behavior and reproduction scope.
  2. Gather logs, traces, requests, tests, database state, and history as available.
  3. Localize the earliest supported divergence.
  4. Test explicit hypotheses one cause at a time.
  5. Report the root cause or ranked remaining hypotheses.
  6. Write a Mini Fix Contract.

If the user authorized a fix
  7. Implement the smallest causal fix with $engineering-quality.
  8. Use $verify-change to reproduce and close the regression.
```

"Investigate" or "find out why" authorizes diagnosis, not an automatic fix.

## Branch 3: production data analysis

Purpose: answer business and operational questions without making production mutation available.

```text
$product-analysis
  1. Confirm the named production profile and database identity.
  2. Confirm a server-enforced read-only account and read-only session.
  3. Set timeouts and bounded result limits.
  4. Define time range, timezone, counting unit, deduplication, null handling,
     and soft-delete treatment.
  5. Run safe aggregates, bounded samples, and independent cross-checks.
  6. Report queries, findings, anomalies, explanations, and limitations.
```

The bundled SQL checker is only a conservative static preflight. Passing it does not replace database-enforced controls.

## Branch 4: logic audit

Purpose: attempt to prove that a rule system, classifier, prompt, state transition, or decision pipeline is wrong or unnecessarily complex.

```text
$logic-audit
  1. Identify inputs, outputs, invariants, assumptions, and precedence.
  2. Construct boundary, overlap, null, timing, and ordering counterexamples.
  3. Find contradictions, unreachable states, duplication, and hidden coupling.
  4. Propose the smallest behavior-preserving simplification.
  5. Identify no-change areas.
```

The valid result may be "no change is needed." If a change is selected, create a Mini Spec or Formal Spec before implementation.

## Cross-cutting and auxiliary skills

- `$engineering-quality` applies only while modifying code. It keeps changes minimal, explicit, typed, testable, and free from unrelated refactoring.
- `$doubt-review` independently attacks an artifact against a supplied contract. It reviews but does not edit.
- `$code-review` finds implementation defects and maintenance risks. It does not decide full Spec compliance.
- `$session-handoff` can be used at any pause or context boundary. It records only verified continuation context.
- `$ship-change` requires explicit authorization for the exact version, action, and environment. Implementation completion never grants deployment permission.

## Natural-language use

Explicit skill names are optional. These requests should route naturally:

```text
"Turn this small request into a short contract before coding."
"Find out why the same contact was created twice; investigate only."
"Using the production profile, group waiting contacts by campaign."
"Is this classification logic too strict? Find counterexamples."
"Draft a formal Spec for this new multi-state response subsystem."
"Verify every requirement in this approved Spec against the implementation."
```

To force a route:

```text
Use $diagnose to investigate this issue without modifying business code.
Use $brief-to-spec to turn this brief into a formal feature Spec.
Use $session-handoff to save the minimum context needed to continue tomorrow.
```

## Artifact templates

Each skill links to an `assets/` template for its normal output. Use the template when a persistent artifact is useful; do not create a document for trivial work merely to satisfy the pack. Modeling guidance for formal Specs lives under `brief-to-spec/references/` and is loaded progressively.

## Safety summary

- Investigation is read-only until a fix is explicitly authorized.
- Production analysis never authorizes data repair or mutation.
- Plans cannot redefine approved requirements.
- Tests and implementation completion do not authorize shipping.
- Verification reports failed and unavailable evidence honestly.
- `$ship-change` is the only delivery workflow, and it still requires explicit authorization.

— NiuNiu Tang
