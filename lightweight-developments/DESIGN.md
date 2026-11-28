# Lightweight Developments: Design

## Intent

The user should be able to describe work naturally. The agent first learns enough from the repository and available evidence to distinguish requested behavior from current behavior, proposed solutions, and assumptions. It then chooses the lightest workflow that protects correctness.

Specification, plan, implementation, and verification are conceptually separate:

```text
Specification -> intended system behavior
Plan          -> implementation approach for this change
Implementation-> actual repository changes
Verification  -> evidence that behavior satisfies the contract
```

Small work does not need these as saved documents. A Mini Spec or Fix Contract may live in the conversation, followed by direct implementation and focused verification.

## Workflow tiers

### Small or bounded

```text
free-form brief
  -> brief-to-mini-spec (walkthrough and diagrams when the flow branches)
  -> direct implementation or native plan mode
  -> developer self-check and focused verification
  -> code-review (Change) when independent review is useful
```

### Larger work

The formal Spec path (`brief-to-spec`, `spec-to-plan`, `verify-spec`) is deprecated and no longer routed to. Work that exceeds a Mini Spec is stopped and discussed with the user. Approved plans are executed directly with `engineering-quality`; there is no active plan-execution skill.

### Risk review

Use `code-review` in Contract mode to challenge a plan, migration, or design against its contract before execution. Use it in Change mode after implementation. The two judgments are separate.

### Investigation paths

- Unexpected behavior: `diagnose`, then a Fix Contract before any authorized fix.
- Production business data: `production-database-analysis`, with read-only controls and no data repair.
- Rules or decision logic: `code-review` in Decision logic mode; if a change is chosen, write a Mini Spec.
- Observation of existing code: the `read-*` family, read-only.

## Composition

Prefer one primary workflow skill. Add `engineering-quality` only while changing code. Add one review skill when an independent challenge is valuable. Do not activate a chain of skills merely because all of them are available.

Work may escalate from the small path when investigation reveals new states, permissions, schema changes, integrations, irreversible operations, or broad regression risk. Do not manufacture extra process when the task becomes simpler.

## Skill layout

```text
.                           # Skill-pack project
├── docs/
│   └── USER-GUIDE.md       # Practical manual and workflow tree
├── scripts/                # Validation, packaging, link installation, SQL preflight
├── tests/                  # Deterministic helper tests
├── catalog.yaml            # Machine-readable skill inventory (incl. deprecated list)
├── ROUTING.md              # Routing table and boundaries
└── .agents/
    └── skills/
        ├── brief-to-mini-spec/     # includes walkthrough and diagram guidance
        ├── code-review/            # Change, Contract, and Decision logic modes
        ├── diagnose/
        ├── production-database-analysis/
        ├── read-module/
        ├── read-code-horizonally/
        ├── read-code-vertically/
        ├── read-state-and-model/
        ├── excellence-gap/
        ├── backfill-task/
        ├── engineering-quality/
        ├── session-handoff/
        ├── transfer-job/
        ├── ship-change/
```

Every active skill includes usage boundaries, expected inputs, self-inspection, process, output, safety constraints, stop conditions, and routing examples. Descriptions are intentionally narrow because they are the discovery interface.

Deprecated skills live in `.agents/deprecated-skills/`, outside the active skills directory, so validation and installation never see them. They keep `status: "deprecated"` in their SKILL.md frontmatter and a banner. `scripts/link_skills.sh` also skips any deprecated skill and prunes stale links to it.

The observation family is read-only and explanation-first. `read-module` is the general entry point; `read-code-horizonally` explains bounded code areas, `read-code-vertically` reconstructs end-to-end behavior, and `read-state-and-model` explains lifecycles and relationships. They favor concise prose plus Mermaid diagrams and distinguish facts, inferences, and unknowns.

Every active skill also includes:

- `agents/openai.yaml` for user-facing discovery metadata and a skill-specific invocation prompt;
- `assets/` with a concrete report, contract, checklist, or progress template referenced by its `SKILL.md`;
- `scripts/` only when a repeated deterministic check materially improves the workflow.

The pack root contains a catalog, a structural validator, a description-overlap audit, a deterministic packager, and tests. Packaging and linking infrastructure stays outside individual skills; domain-specific helpers stay with the skill that owns their safety boundary.

## Deliberate omissions

There is no router skill, oral-input skill, generic brainstorming skill, generic planner, generic executor, generic testing skill, or separate spec-compliance skill. Native agent capabilities cover those concerns; duplicating them would increase routing ambiguity and context cost.

There are no generic planning, implementation, or testing scripts. The included scripts check pack structure, packaging, symlink installation, and SQL static safety signals; none replaces agent judgment, database controls, or behavioral verification.

## Maintenance rule

Tune these skills from observed routing failures or workflow failures. Prefer a narrow correction to a growing catalog of hypothetical rules. Keep project-specific schemas, credentials, names, and secrets outside this reusable pack.

— NiuNiu Tang
