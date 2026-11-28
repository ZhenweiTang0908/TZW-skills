# Concurrency, Idempotency, and Ordering

Read this reference when requests, events, workers, users, or retries can act on the same logical object concurrently, more than once, late, or out of order.

## Inspect

- Existing idempotency keys, uniqueness constraints, locks, versions, compare-and-set behavior, queue delivery guarantees, and event sequencing.
- Transaction boundaries and every point at which duplicate work can enter.
- Current conflict behavior exposed to users or operators.

## Specify

- The logical operation identity and deduplication scope.
- Which operations must be idempotent and what repeated execution returns.
- Concurrency invariant for each shared object.
- Conflict detection and resolution: reject, retry, merge, last-write-wins, or domain-specific rule.
- Ordering requirement and the source of sequence truth.
- Behavior for stale, delayed, duplicate, missing, and replayed events.
- Lock or lease expiry semantics when ownership can be abandoned.
- Atomicity boundary across database and external side effects.

## Questions that change the Spec

- Is duplication prevented per request, user, tenant, provider object, or business operation?
- Can two valid actors update different fields safely at the same time?
- Does arrival order represent business order?
- What happens when a retry begins before the first attempt's outcome is known?
- Must users see a conflict or can the system resolve it invisibly?

## Avoid

- Saying "exactly once" without defining the boundary and mechanism.
- Assuming queues preserve global order.
- Using timestamps alone as reliable sequence or identity.
- Treating a database transaction as atomic with an external API.
- Adding coarse locking without specifying user-visible contention behavior.

— NiuNiu Tang
