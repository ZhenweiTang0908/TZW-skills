# Migration and Compatibility

Read this reference when existing data, clients, APIs, events, configurations, or rolling application versions must coexist with a new model or behavior.

## Inspect

- Existing schema and data distribution, client versions, event consumers, API contracts, deployment topology, feature flags, and rollback mechanisms.
- Historical data quality and records that violate new assumptions.
- Whether producers and consumers deploy independently.

## Specify

- Starting and target states, including existing data and active workflows.
- Compatibility window and supported old/new producer-consumer combinations.
- Backfill population, transformation semantics, validation, and restart behavior.
- Dual-read, dual-write, shadow, or feature-flag behavior only when needed as a behavioral constraint.
- Cutover criteria and authoritative source during transition.
- Rollback or forward-recovery behavior after new data has been written.
- Treatment of in-flight work, stale clients, old events, and partially migrated records.
- Deprecation and cleanup conditions.

## Questions that change the Spec

- Can old and new formats be interpreted without loss?
- What happens if deployment stops halfway through?
- Can rollback software read data written by the new version?
- How are backfill errors surfaced and resumed?
- Which compatibility promises are public or contractually required?

## Avoid

- Assuming empty or clean production data.
- Requiring an atomic application-and-database cutover when deployments roll gradually.
- Treating backup as a complete rollback strategy.
- Leaving dual paths without a removal condition.
- Hiding irreversible transformation behind generic migration wording.

Migration execution belongs to an explicitly authorized shipping workflow; this reference defines the required behavior but grants no production permission.

— NiuNiu Tang
