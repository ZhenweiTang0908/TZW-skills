# Pipeline and State Machine

Read this reference when work moves through stages, queues, statuses, approvals, long-running orchestration, or asynchronous handlers. A pipeline describes processing flow; a state machine defines legal durable states and transitions. Use one or both as the feature requires.

## Inspect

- Existing status fields, queues, workers, schedulers, workflow engines, transition helpers, and event consumers.
- Which component owns each state and which states are observable to users or operators.
- Existing retries, timeouts, terminal states, and manual actions.

## State model

Specify:

- State names and business meanings.
- Initial, active, suspended, successful terminal, failed terminal, and cancelled states as relevant.
- Allowed transitions, triggering actor or event, guards, and resulting side effects.
- Forbidden transitions and behavior for duplicate or stale transition attempts.
- State ownership and the authoritative record.
- Whether history, reason, actor, and transition time must be retained.
- User-visible versus internal processing states.

Use a transition table when there are more than a few transitions:

| From | Trigger | Guard | To | Observable result |
|---|---|---|---|---|

## Pipeline model

Specify:

- Ordered or parallel stages and their inputs and outputs.
- Entry and exit conditions for each stage.
- Synchronous versus asynchronous boundaries.
- Durable checkpoints and resume points.
- Branching, joining, cancellation, expiration, and backpressure behavior.
- Ownership transfer between components.

## Questions that change the Spec

- Is the state a business fact or only a processing detail?
- Can stages be skipped, repeated, or run concurrently?
- What happens when an older event arrives after a newer transition?
- Who may pause, cancel, retry, or override the workflow?
- Does completion mean accepted, persisted, delivered, or externally acknowledged?

## Avoid

- Using one vague `status` value to represent unrelated dimensions.
- Defining happy-path transitions without illegal or stale-transition behavior.
- Treating a sequence diagram as the durable state contract.
- Encoding implementation queues or worker names as product requirements without necessity.

Coordinate retry and repair semantics with [failure recovery](failure-recovery.md), and duplicate or ordering behavior with [concurrency, idempotency, and ordering](concurrency-idempotency-and-ordering.md).

— NiuNiu Tang
