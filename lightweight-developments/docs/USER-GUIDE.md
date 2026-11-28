# Lightweight Developments User Guide

Describe the work naturally. The agent picks the smallest workflow that can produce reliable evidence. Invoke a skill with `$skill-name` only to force or correct routing.

Active skills (14): `brief-to-mini-spec`, `diagnose`, `production-database-analysis`, `read-module`, `read-code-horizontally`, `read-code-vertically`, `read-state-and-model`, `excellence-gap`, `backfill-task`, `engineering-quality`, `code-review`, `session-handoff`, `transfer-job`, `ship-change`.

Deprecated (moved to `.agents/deprecated-skills/`, not linked, not routed to): `brief-to-spec`, `spec-to-plan`, `verify-change`, `verify-spec`, `review-spec`, `spec-explainer` (folded into `brief-to-mini-spec`), `doubt-review` and `logic-audit` (folded into `code-review`).

## Workflow map

```text
Natural-language request
│
├─ 1. Change existing product behavior?
│    $brief-to-mini-spec
│      → Mini Spec (+ walkthrough and diagrams when the flow branches)
│      → direct implementation, with $engineering-quality while editing code
│      → $code-review (Change) on the completed diff when independent review helps
│      → if scope grows past a Mini Spec: stop and discuss with the user
│
├─ 2. Something is broken or unexpected?
│    $diagnose
│      → facts → localization → hypotheses → root cause
│      → Fix Contract
│      → authorized fix + $engineering-quality
│      → focused regression check
│
├─ 3. Question about production business data?
│    $production-database-analysis
│      → verify production profile and read-only controls
│      → bounded queries and cross-checks
│      → findings, anomalies, explanations, limitations
│      ✕ never repair or mutate production data
│
├─ 4. Are rules or decisions too strict or complex?
│    $code-review (Decision logic mode)
│      → assumptions → counterexamples → contradictions
│      → simplification opportunities
│      ├─ no change needed → stop
│      └─ change chosen → $brief-to-mini-spec
│
├─ 5. Short-lived data backfill or reprocessing job?
│    $backfill-task
│      → compact job contract (challenge it with $code-review, Contract mode)
│      → isolated API-driven worker
│      → pause/resume + durable idempotency
│      → focused verification
│      ✕ no automatic production run
│
├─ 6. Approved small change ready to build?
│    direct implementation + $engineering-quality
│      → implement only the Mini Spec scope
│      → developer self-check and focused verification
│
└─ 7. Supporting actions
     $session-handoff  → preserve minimal continuation context at any stage
     $code-review      → review a diff, challenge an artifact, or audit rules
     $ship-change      → perform an explicitly authorized delivery action
     $transfer-job     → hand planned, token-heavy execution to Pi (explicit request only)
```

## Choose a branch

| Starting intent | Start with | Primary result |
|---|---|---|
| Change one bounded behavior | `$brief-to-mini-spec` | Mini Spec with walkthrough |
| Explain an observed bug or failure | `$diagnose` | Root cause or ranked hypotheses |
| Analyze production records or operations | `$production-database-analysis` | Read-only analysis report |
| Design or implement a bounded backfill job | `$backfill-task` | Restartable job contract and guidance |
| Review a completed change | `$code-review` (Change) | Findings by severity |
| Challenge a spec, plan, or migration | `$code-review` (Contract) | Defects, counterexamples, verdict |
| Challenge business or decision logic | `$code-review` (Decision logic) | Counterexamples and simplification |
| Continue work in another session | `$session-handoff` | Minimal handoff record |
| Merge, deploy, migrate, or roll out | `$ship-change` | Controlled delivery and post-check report |

## Branch 1: small or bounded change

```text
$brief-to-mini-spec
  1. Inspect relevant code, tests, and documentation.
  2. Separate requested behavior, current behavior, proposals, and assumptions.
  3. Ask only behavior-changing questions the repository cannot answer.
  4. Produce Goal, Expected Behavior, Walkthrough, Constraints,
     Open Questions, and Verification Target.

Implementation
  5. Implement directly or use native Plan Mode when useful.
  6. Apply $engineering-quality while changing code.
  7. Perform the developer self-check and a focused verification.

Optional
  8. $code-review (Change mode) on the diff.
```

Example: "Keep candidate attachments downloadable after the source email is deleted. Do not change filtering."

Stop and discuss with the user if implementation reveals new states, permissions, schema changes, external systems, difficult migration, or broad rollback risk. No replacement skill for large formal specs is active; the decision on how to scope that work is the user's.

## Branch 2: diagnosis and fix

```text
$diagnose
  1. Define expected versus observed behavior and reproduction scope.
  2. Gather logs, traces, requests, tests, database state, and history as available.
  3. Localize the earliest supported divergence.
  4. Test explicit hypotheses one cause at a time.
  5. Report the root cause or ranked remaining hypotheses.
  6. Write a Fix Contract.

If the user authorized a fix
  7. Implement the smallest causal fix with $engineering-quality.
  8. Reproduce the failure, then confirm the regression is closed.
```

"Investigate" or "find out why" authorizes diagnosis, not an automatic fix.

## Branch 3: production data analysis

```text
$production-database-analysis
  1. Confirm the named production profile and database identity.
  2. If needed, inspect repository-local .local_only_data for the minimum
     credential fields without executing, echoing, modifying, or committing it.
  3. Confirm a server-enforced read-only account and read-only session.
  4. Set timeouts and bounded result limits.
  5. Define time range, timezone, counting unit, deduplication, null handling,
     and soft-delete treatment.
  6. Run safe aggregates, bounded samples, and independent cross-checks.
  7. Report queries, findings, anomalies, explanations, and limitations.
```

The bundled SQL checker is only a conservative static preflight. Database-enforced controls are what make the analysis read-only.

## Branch 4: rules and decision logic

```text
$code-review (Decision logic mode)
  1. Identify inputs, outputs, invariants, assumptions, and precedence.
  2. Construct boundary, overlap, null, timing, and ordering counterexamples.
  3. Find contradictions, unreachable states, duplication, and hidden coupling.
  4. Propose the smallest behavior-preserving simplification.
  5. Identify no-change areas.
```

"No change is needed" is a valid result. If a change is chosen, write a Mini Spec before implementing it.

## Cross-cutting and auxiliary skills

- `$engineering-quality` applies only while modifying code. It keeps changes minimal, explicit, typed, testable, and free from unrelated refactoring.
- `$code-review` has three modes: Change (diff review), Contract (challenge an artifact against a supplied contract), and Decision logic (counterexamples for rules and state transitions). It reviews only and does not edit.
- `$session-handoff` can be used at any pause or context boundary. It records only verified continuation context.
- `$ship-change` requires explicit authorization for the exact version, action, and environment. Implementation completion never grants deployment permission.

## Natural-language use

Explicit skill names are optional:

```text
"Turn this small request into a short contract before coding."
"Find out why the same contact was created twice; investigate only."
"Using the production profile, group waiting contacts by campaign."
"Is this classification logic too strict? Find counterexamples."
"Challenge this migration plan against the zero-data-loss requirement."
```

To force a route:

```text
Use $diagnose to investigate this issue without modifying business code.
Use $session-handoff to save the minimum context needed to continue tomorrow.
```

## Artifact templates

Each skill links to an `assets/` template for its normal output. Use the template when a persistent artifact is useful; do not create a document for trivial work merely to satisfy the pack.

## Safety summary

- Investigation is read-only until a fix is explicitly authorized.
- Production analysis never authorizes data repair or mutation.
- Plans cannot redefine approved requirements.
- Tests and implementation completion do not authorize shipping.
- Review findings and unavailable evidence are reported honestly.
- `$ship-change` is the only delivery workflow, and it still requires explicit authorization.

— NiuNiu Tang
