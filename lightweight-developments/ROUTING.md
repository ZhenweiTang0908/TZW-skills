# Routing and Overlap Audit

| User intent | Primary skill | Key exclusion |
|---|---|---|
| Clarify a small behavior change before coding | `brief-to-mini-spec` | Not debugging or architecture |
| Investigate unexpected behavior or a failure | `diagnose` | No speculative fix before evidence |
| Analyze production business data | `production-database-analysis` | No production mutation |
| Understand an existing system or feature | `explain-system` | Read-only explanation; route to a focused observation skill |
| Understand a module or repository area | `code-reading` | Not an end-to-end feature trace |
| Trace a feature from trigger to outcome | `feature-tracing` | Describes current behavior; no implementation plan |
| Explain entity states or data relationships | `state-and-data-modeling` | Not production data analysis or future design |
| Design or implement a short-lived API-driven backfill | `backfill-task` | Not ordinary synchronous APIs or long-running migrations |
| Challenge rules, states, or decisions | `logic-audit` | Not implementation quality review |
| Verify a local fix or bounded change | `verify-change` | Not whole-feature acceptance |
| Define a large feature or subsystem | `brief-to-spec` | Not implementation planning |
| Explain a Spec's Pipeline or Workflow in detail | `spec-explainer` | Supplements Spec writing; does not create an implementation plan |
| Review a draft formal specification | `doubt-review` (Spec as artifact, brief as contract) | Not drafting or code review; `review-spec` is temporarily disabled |
| Turn an approved spec into implementation tasks | `spec-to-plan` | Must not redefine requirements |
| Execute an approved implementation plan | `implement-plan` | Not for discovery or unapproved scope |
| Accept a completed feature against its spec | `verify-spec` | Not code-style review alone |
| Apply implementation quality constraints | `engineering-quality` | Cross-cutting; not a primary workflow |
| Adversarially challenge an artifact or claim | `doubt-review` | No automatic edits |
| Review completed code changes | `code-review` | Not requirements acceptance |
| Preserve minimal continuation context | `session-handoff` | Not a transcript or project summary |
| Merge, deploy, migrate, or roll out | `ship-change` | Requires explicit authorization |

## Important boundaries

- `brief-to-mini-spec` versus `brief-to-spec`: choose based on behavioral and operational complexity, not word count. New states, meaningful schema changes, permissions, external systems, or difficult rollback favor the formal spec.
- `diagnose` versus `logic-audit`: diagnose explains an observed failure; logic-audit tries to falsify a rule system even when no incident has occurred.
- `explain-system` versus `diagnose`: explain-system explains current behavior; diagnose investigates an unexpected failure.
- `code-reading` versus `feature-tracing`: code-reading explains a bounded code area; feature-tracing follows a user-visible behavior across boundaries.
- `feature-tracing` composes state and data modeling when lifecycle or persistence is needed to explain the flow.
- `verify-change` versus `verify-spec`: the former tests a Mini Spec or Fix Contract; the latter traces every formal requirement to implementation and evidence.
- `review-spec` is temporarily disabled and not installed. Route draft-Spec review to `doubt-review`, passing the original brief as the contract.
- `verify-spec` versus `code-review`: verify-spec asks whether the promised feature exists; code-review asks whether the implementation is sound and maintainable.
- `implement-plan` versus `ship-change`: implementation authority never implies merge, deployment, migration, or production rollout authority.
- `backfill-task` versus `ship-change`: a backfill design may expose a control API, but it never authorizes starting a production job, deploying it, or mutating production data.

## Composition examples

```text
diagnose
implement authorized fix + engineering-quality
verify-change
```

```text
backfill-task
discussion + doubt pass
authorized implementation
focused verification
explicit run authorization
```

```text
brief-to-spec
spec-explainer
doubt-review
human approval
spec-to-plan
implement-plan + engineering-quality
verify-spec + code-review
```

— NiuNiu Tang
