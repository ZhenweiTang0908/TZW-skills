# Routing and Overlap Audit

| User intent | Primary skill | Key exclusion |
|---|---|---|
| Clarify a small behavior change before coding (adds a walkthrough and diagrams when the flow branches) | `brief-to-mini-spec` | Not debugging or architecture |
| Investigate unexpected behavior or a failure | `diagnose` | No speculative fix before evidence |
| Analyze production business data | `production-database-analysis` | No production mutation |
| Understand an existing system or feature | `read-module` | Read-only explanation; route to a focused observation skill |
| Understand a module or repository area | `read-code-horizontally` | Not an end-to-end feature trace |
| Trace a feature from trigger to outcome | `read-code-vertically` | Describes current behavior; no implementation plan |
| Explain entity states or data relationships | `read-state-and-model` | Not production data analysis or future design |
| Find how existing code would look if excellent, not merely acceptable | `excellence-gap` | Not correctness review; no edits |
| Design or implement a short-lived API-driven backfill | `backfill-task` | Not ordinary synchronous APIs or long-running migrations |
| Review a completed code change | `code-review` (Change mode) | Not requirements acceptance |
| Challenge a spec, plan, migration, or claim against its contract | `code-review` (Contract mode) | Review only; not drafting |
| Audit business rules, routing, state transitions, or prompts for counterexamples | `code-review` (Decision logic mode) | Not an incident explanation; no automatic edits |
| Apply implementation quality constraints | `engineering-quality` | Cross-cutting; not a primary workflow |
| Preserve minimal continuation context | `session-handoff` | Not a transcript or project summary |
| Hand off token-heavy, planned execution work to Pi | `transfer-job` | Only on explicit request; Claude plans, Pi executes |
| Merge, deploy, migrate, or roll out | `ship-change` | Requires explicit authorization |

Deprecated and not routed to: `brief-to-spec`, `spec-explainer` (folded into `brief-to-mini-spec`), `spec-to-plan`, `verify-change`, `verify-spec`, `review-spec`, `implement-plan`, `doubt-review` (folded into `code-review`), `logic-audit` (folded into `code-review`).

## Important boundaries

- `brief-to-mini-spec` versus a larger scope: if new states, meaningful schema changes, permissions, external systems, or difficult rollback appear, stop and report that the scope exceeds a Mini Spec. Do not choose a replacement skill; the user decides.
- `diagnose` versus `code-review` (Decision logic): diagnose explains an observed failure; decision-logic review tries to falsify a rule system even when no incident has occurred.
- `read-module` versus `diagnose`: read-module explains current behavior; diagnose investigates an unexpected failure.
- `read-code-horizontally` versus `read-code-vertically`: read-code-horizontally explains a bounded code area; read-code-vertically follows a user-visible behavior across boundaries.
- `read-code-vertically` composes state and data modeling when lifecycle or persistence is needed to explain the flow.
- `code-review` (Change) versus `excellence-gap`: Change mode asks whether a change is correct and sound enough to accept; excellence-gap observes existing code and describes the excellent design it falls short of, citing the source of each standard.
- Implementation authority never implies merge, deployment, migration, or production rollout authority (`ship-change` requires explicit authorization).
- `backfill-task` versus `ship-change`: a backfill design may expose a control API, but it never authorizes starting a production job, deploying it, or mutating production data.

## Composition examples

```text
diagnose
implement authorized fix + engineering-quality
code-review (Change)
```

```text
brief-to-mini-spec   (includes walkthrough and diagrams)
code-review (Contract) on the Mini Spec, with the brief as contract
explicit user approval
engineering-quality + direct implementation
code-review (Change)
```

```text
backfill-task
code-review (Contract) on the design
authorized implementation
focused verification
explicit run authorization
```

— NiuNiu Tang
