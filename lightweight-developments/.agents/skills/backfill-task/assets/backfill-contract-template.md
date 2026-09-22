# Backfill Contract: <Job Name>

## Scope

- Target environment: <local / staging / production>
- Selection rule or snapshot: <query or source>
- Expected maximum duration: <duration>
- Explicit exclusions: <records or side effects not included>

## Item Contract

- Stable idempotency key: <immutable identity + operation version>
- Success condition: <observable condition>
- Retryable failures: <classes>
- Non-retryable failures: <classes>
- External side effects: <none / idempotency behavior>

## Job States and Recovery

- States: `created`, `running`, `pause_requested`, `paused`, `completed`, `failed`, `cancelled`
- Checkpoint or item ledger: <durable location>
- Lease and reclaim timeout: <duration>
- Pause behavior: <finish current item, persist state, release lease>
- Resume behavior: <skip completed items and reclaim expired work>

## Control API

- Start: <method and path>
- Status: <method and path>
- Pause: <method and path>
- Resume: <method and path>
- Cancel: <method and path, if supported>
- Authentication: one-time raw backfill password; cloud hashes it and compares against the embedded target hash; never normal JWT, X API, or S Key
- Target hash lifecycle: <injected location, invalidation trigger, and deletion procedure>

## Limits and Observability

- Batch size: <number>
- Concurrency: <number>
- Per-item timeout: <duration>
- Job timeout: <duration>
- Retry limit/backoff: <policy>
- Logs and metrics: <fields, counters, redactions>
- Stale/no-progress alert: <threshold>

## Doubt / Discussion

- <Counterexample or unresolved decision>

## Verification

- [ ] Raw password is hashed server-side and compared without JWT, X API, S Key, or another auth layer
- [ ] A request containing the target hash itself is rejected
- [ ] Password and target hash are not exposed in URLs, logs, responses, or Git
- [ ] Target hash is invalidated after completion, cancellation, expiry, or abandonment
- [ ] Start returns a job ID without waiting for completion
- [ ] Pause persists a safe checkpoint
- [ ] Resume skips completed items
- [ ] Crash recovery reclaims only expired work
- [ ] Retry and failure classification behave as specified
- [ ] Status endpoint exposes progress without sensitive data
- [ ] Worker is bounded and does not block unrelated traffic

## Authorization Boundary

<Explicit approval required before deployment, production execution, migration, or production data mutation.>

— NiuNiu Tang
