# Lightweight Developments

Lightweight Developments is a personal Codex skill set for maintaining existing SaaS products and internal tools. It turns informal requests into the smallest engineering workflow that is still reliable: a short contract for bounded changes, evidence-first diagnosis for failures, guarded read-only analysis for production data, and a fuller specification path only for genuinely large features.

The skills are written in English and use the open Agent Skills layout. Each skill includes UI metadata in `agents/openai.yaml` and a reusable output asset. Scripts are included only where deterministic checks improve reliability.

## Install or use

The project-local skills live under `.agents/skills/`. Copy that directory into a target repository, or copy selected skill folders into that repository's own `.agents/skills/` directory. Review and merge the accompanying `AGENTS.md` rules instead of blindly replacing an existing project file.

Start with natural language. Codex should select one primary skill, optionally `engineering-quality`, and at most one review skill when the risk justifies it. Explicit skill invocation remains available when routing needs correction.

## Quick workflow map

```text
Natural request
├─ small behavior change ─→ brief-to-mini-spec ─→ implement + engineering-quality ─→ verify-change
├─ substantial feature   ─→ brief-to-spec ─→ review-spec ─→ approval ─→ spec-to-plan
│                          └→ implement-plan + engineering-quality ─→ verify-spec ─→ optional ship-change
├─ bug or incident       ─→ diagnose ─→ Fix Contract ─→ authorized fix ─→ verify-change
├─ production data      ─→ product-analysis ─→ read-only findings
├─ rules or decisions   ─→ logic-audit ─→ no change, Mini Spec, or Formal Spec
└─ pause or transfer    ─→ session-handoff
```

See the [complete user guide](docs/USER-GUIDE.md) for branch purposes, steps, examples, composition, and safety boundaries.

## Documents

- `docs/USER-GUIDE.md` is the practical manual and visual workflow map.
- `DESIGN.md` explains the workflow, boundaries, and directory layout.
- `ROUTING.md` is the compact selection guide and overlap audit.
- `AGENTS.md` supplies a minimal engineering baseline for repositories using the pack.

The `brief-to-spec` skill also contains on-demand reference modules for data modeling, Pipeline and State Machine design, failure recovery, permissions, integrations, concurrency, observability, compatibility, and scale. They are loaded only when the feature needs that dimension.

## Project tooling

The root `catalog.yaml` is the machine-readable pack inventory. The project tools use only the Python standard library:

```bash
uv run python scripts/validate_pack.py
uv run python scripts/audit_descriptions.py --threshold 0.35
uv run python -m unittest discover -s tests -v
uv run python scripts/package_skills.py
```

`validate_pack.py` checks skill metadata, UI metadata, signatures, assets, catalog coverage, and relative links. `audit_descriptions.py` surfaces likely routing overlap for human review. `package_skills.py` creates deterministic full-pack and per-skill ZIP files plus SHA-256 checksums under `dist/`.

Two skills include focused helpers:

- `product-analysis/scripts/check_sql_read_only.py` conservatively rejects obviously unsafe SQL before database execution. It cannot replace server-enforced read-only credentials, transactions, timeouts, or human review.
- `verify-spec/scripts/check_requirement_coverage.py` checks that each requirement identifier has one reported status. It cannot judge whether the evidence is correct.

## References used for design

This pack was independently written. Its structure was informed by the open Agent Skills specification and by the composable, evidence-oriented ideas in Superpowers. No text was copied from either project.

- Agent Skills specification: https://agentskills.io/specification
- Superpowers: https://github.com/obra/superpowers

— NiuNiu Tang
