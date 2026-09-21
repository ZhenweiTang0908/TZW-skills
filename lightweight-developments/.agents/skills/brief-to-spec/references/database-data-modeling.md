# Database Data Modeling

Read this reference when a feature creates or materially changes persisted entities, relationships, ownership, lifecycle, retention, or query behavior. Specify the business model and required invariants; do not design tables merely because a Spec mentions data.

## Inspect

- Existing schema, migrations, models, constraints, indexes, soft-delete conventions, tenancy, and ownership patterns.
- The source of truth for each concept and any duplicate or derived representations.
- Current identifiers, time semantics, retention rules, and sensitive-data classifications.
- Read and write paths that rely on the affected data.

## Model requirements

Describe only relevant items:

- Entities and their business meaning.
- Stable identity, uniqueness, and whether identity is global, tenant-scoped, provider-scoped, or versioned.
- Relationships, cardinality, ownership, optionality, and deletion behavior.
- Required invariants and where they must hold across concurrent operations.
- Lifecycle: creation, activation, archival, expiry, soft deletion, hard deletion, and restoration.
- Authoritative versus derived fields, provenance, and synchronization expectations.
- Time semantics: event time, processing time, effective intervals, timezone, and clock assumptions.
- Sensitive fields, access boundaries, minimization, retention, export, and deletion obligations.
- Query behavior that is part of the product contract, including counting unit and deduplication semantics.

## Questions that change the Spec

- What makes two records the same business object?
- Can a relationship change over time, and must history be preserved?
- What happens to dependents when an owner is archived or deleted?
- Are null, unknown, not-applicable, and empty distinct states?
- Which values are user-authored, imported, computed, or provider-owned?
- Must existing records be backfilled, and can old and new representations coexist?

## Spec output

Use a compact entity list, relationship table, or invariant list. Include physical storage choices only when they are externally required constraints. Mark unresolved migration or compatibility questions for the relevant reference.

## Avoid

- Treating current tables as the product model without validating intent.
- Inventing fields for hypothetical future use.
- Using database-specific implementation detail as a substitute for behavior.
- Omitting deletion, retention, ownership, or identity semantics.

— NiuNiu Tang
