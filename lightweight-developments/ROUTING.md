# Routing and Overlap Audit

| User intent | Primary skill | Key exclusion |
|---|---|---|
| Clarify a small behavior change before coding | `brief-to-mini-spec` | Not debugging or architecture |
| Investigate unexpected behavior or a failure | `diagnose` | No speculative fix before evidence |
| Analyze production business data | `product-analysis` | No production mutation |
| Challenge rules, states, or decisions | `logic-audit` | Not implementation quality review |
| Verify a local fix or bounded change | `verify-change` | Not whole-feature acceptance |
| Define a large feature or subsystem | `brief-to-spec` | Not implementation planning |
| Review a draft formal specification | `review-spec` | Not drafting or code review |
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
- `verify-change` versus `verify-spec`: the former tests a Mini Spec or Fix Contract; the latter traces every formal requirement to implementation and evidence.
- `review-spec` versus `doubt-review`: review-spec has a domain-specific checklist and compares the draft to the original brief; doubt-review challenges any artifact using only its contract when independence matters.
- `verify-spec` versus `code-review`: verify-spec asks whether the promised feature exists; code-review asks whether the implementation is sound and maintainable.
- `implement-plan` versus `ship-change`: implementation authority never implies merge, deployment, migration, or production rollout authority.

## Composition examples

```text
diagnose
implement authorized fix + engineering-quality
verify-change
```

```text
brief-to-spec
review-spec + doubt-review
human approval
spec-to-plan
implement-plan + engineering-quality
verify-spec + code-review
```

— NiuNiu Tang
