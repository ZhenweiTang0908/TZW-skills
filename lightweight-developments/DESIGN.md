# Lightweight Developments: Design Draft

## Intent

The user should be able to describe work naturally. The agent first learns enough from the repository and available evidence to distinguish requested behavior from current behavior, proposed solutions, and assumptions. It then chooses the lightest workflow that protects correctness.

The system deliberately separates four artifacts when scale requires them:

```text
Specification -> intended system behavior
Plan          -> implementation approach for this change
Implementation-> actual repository changes
Verification  -> evidence that behavior satisfies the contract
```

Small work does not need all four as saved documents. A Mini Spec or Fix Contract may be held in the conversation, followed by direct implementation and focused verification.

## Workflow tiers

### Small or bounded

```text
free-form brief
  -> brief-to-mini-spec
  -> direct implementation or native plan mode
  -> developer self-check
  -> verify-change when independent or explicit verification is useful
```

### Feature

```text
free-form brief
  -> brief-to-spec
  -> review-spec
  -> human approval
  -> spec-to-plan
  -> implement-plan + engineering-quality
  -> verify-spec
```

### Architectural or high risk

Use the feature workflow, then add `doubt-review`, `code-review`, and explicitly authorized `ship-change` where their separate judgments reduce risk.

### Investigation paths

- Unexpected behavior: `diagnose`, then create a Mini Fix Contract before any authorized fix.
- Production business data: `product-analysis`, with read-only controls and no data repair.
- Rules or decision logic: `logic-audit`; if a change is chosen, route the decision into `brief-to-mini-spec` or `brief-to-spec`.

## Composition

Prefer one primary workflow skill. Add `engineering-quality` only while changing code. Add one review skill when an independent challenge is valuable. Do not activate a chain of skills merely because all of them are available.

Work may escalate from the small path when investigation reveals new states, permissions, schema changes, integrations, irreversible operations, or broad regression risk. Do not manufacture additional process when the task becomes simpler.

## Skill layout

```text
.                           # Skill-pack project
├── docs/
│   └── USER-GUIDE.md       # Practical manual and workflow tree
├── scripts/                # Validation, routing audit, and packaging
├── tests/                  # Deterministic helper tests
├── catalog.yaml            # Machine-readable skill inventory
└── .agents/
    └── skills/
        ├── brief-to-mini-spec/
        ├── diagnose/
        ├── product-analysis/
        ├── logic-audit/
        ├── verify-change/
        ├── brief-to-spec/
        │   └── references/
        │       ├── database-data-modeling.md
        │       ├── pipeline-and-state-machine.md
        │       ├── failure-recovery.md
        │       ├── permissions-and-trust-boundaries.md
        │       ├── external-integrations.md
        │       ├── concurrency-idempotency-and-ordering.md
        │       ├── observability-and-auditability.md
        │       ├── migration-and-compatibility.md
        │       └── scale-and-performance.md
        ├── review-spec/
        ├── spec-to-plan/
        ├── implement-plan/
        ├── verify-spec/
        ├── engineering-quality/
        ├── doubt-review/
        ├── code-review/
        ├── session-handoff/
        └── ship-change/
```

Every skill includes usage boundaries, expected inputs, self-inspection, process, output, safety constraints, stop conditions, and routing examples. The descriptions are intentionally narrow because they are the discovery interface.

`brief-to-spec` uses progressive-disclosure references for model dimensions that apply only to some large features. They are guidance modules rather than independently discoverable skills, so they deepen a selected Spec without adding routing noise or forcing irrelevant sections into every document.

Every skill also includes:

- `agents/openai.yaml` for user-facing discovery metadata and a skill-specific invocation prompt;
- `assets/` with a concrete report, contract, checklist, or progress template referenced by its `SKILL.md`;
- `scripts/` only when a repeated deterministic check materially improves the workflow.

The pack root contains a catalog, structural validator, description-overlap audit, deterministic packager, and tests. Packaging infrastructure stays outside individual skills; domain-specific helpers stay with the skill that owns their safety boundary.

## Deliberate omissions

There is no router skill, oral-input skill, generic brainstorming skill, generic planner, generic executor, generic testing skill, or separate spec-compliance skill. Native agent capabilities cover those concerns; duplicating them would increase routing ambiguity and context cost.

There are no generic planning, implementation, or testing scripts. The included scripts check pack structure, packaging, SQL static safety signals, and requirement-status coverage; none replaces agent judgment, database controls, or behavioral verification.

## Maintenance rule

Tune these skills from observed routing failures or workflow failures. Prefer a narrow correction to a growing catalog of hypothetical rules. Keep project-specific schemas, credentials, names, and secrets outside this reusable pack.

— NiuNiu Tang
