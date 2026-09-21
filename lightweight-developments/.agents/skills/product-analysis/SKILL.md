---
name: product-analysis
description: Perform read-only investigation of production business data for statistics, anomalies, operational questions, and troubleshooting support. Use only with an explicitly selected production profile and enforced read-only database controls; never use it to repair or mutate data.
metadata:
  author: NiuNiu Tang
  version: "0.2.0"
---

# Product Analysis

Answer a business or operational question from production data while making production mutation structurally unavailable.

## Use when

The main task is to inspect, count, group, sample, or explain production records and anomalies, usually through a database.

## Do not use when

- The user asks to repair, clean, backfill, or mutate production data.
- The task is a code-level failure investigation without a data-analysis question; use `diagnose`.
- No explicit production connection profile or demonstrably read-only account is available.

## Expected input

A concrete question, the named production profile, relevant time or population boundaries when known, and repository access for schema and business-semantics discovery.

## Inspect first

Read repository instructions, connection tooling, schema and migrations, model definitions, soft-delete conventions, enums, timezone handling, and existing trusted queries. Never copy credentials or sensitive record contents into the report.

## Read-only gate

Before any business query:

1. Confirm the exact profile and database identity; do not silently fall back to another environment.
2. Confirm the account is server-enforced read-only, not merely intended for reads.
3. Start an engine-appropriate read-only transaction or session.
4. Set a query or statement timeout and bounded result strategy.
5. Reject multi-statement input and any construct that can mutate state or invoke uncertain side effects.

Do not classify safety from the first keyword. Data-modifying CTEs, `SELECT INTO`, writable functions, unsafe stored procedures, export commands, locks, and `EXPLAIN ANALYZE` around a mutating statement can violate read-only intent. Use plain `EXPLAIN` by default; use execution-based explain only for a confirmed pure read with acceptable cost.

If any gate cannot be proved, stop before querying and report the missing control.

## Process

1. Define scope: time range, timezone, counting unit, population, deduplication key, null policy, and treatment of soft-deleted records.
2. Start with safe metadata inspection and low-cost aggregates.
3. Refine with bounded grouped queries and small samples. Avoid unbounded scans or row dumps.
4. Cross-check surprising results with an independent aggregation or sample.
5. Distinguish observed data facts from possible business or code explanations.
6. Preserve reproducible SQL with parameters or redactions, query timing, and limitations.

## Output

```markdown
## Question

## Analysis Scope

## Queries

## Findings

## Anomalies

## Possible Explanations

## Limitations / Confidence
```

Report sample versus population clearly. Prefer aggregated evidence; include raw rows only when necessary and appropriately redacted.

When saving the analysis, start from [the product analysis report template](assets/product-analysis-report-template.md). Use `scripts/check_sql_read_only.py` as a conservative static preflight when SQL is available; passing it never replaces the read-only gate or database-enforced controls.

## Permissions and safety

Allowed by default: metadata inspection, bounded `SELECT`, safe aggregation, and safe plain `EXPLAIN` inside the read-only controls.

Forbidden: `INSERT`, `UPDATE`, `DELETE`, `MERGE`, DDL, truncation, creation, maintenance commands, data repair, cleanup, side-effecting functions, disabling safeguards, or changing production configuration.

## Stop or escalate

Stop on ambiguous environment identity, absent read-only enforcement, query plans that imply unacceptable production load, sensitive-data exposure, or a question that can only be answered by mutation. Request a safer replica, narrower scope, or authorized owner action.

## Routing examples

- Use: "Using the production profile, group waiting contacts by campaign and explain the unusually large queue."
- Do not use: "Delete stale waiting contacts." This skill must refuse the mutation.
- Borderline: A query reveals duplicate records; report the evidence, then use `diagnose` to localize the creating mechanism if requested.

— NiuNiu Tang
