# Failure Recovery

Read this reference when the feature can partially fail, cross a process or network boundary, run asynchronously, or require retry, compensation, resume, repair, or manual intervention.

## Inspect

- Existing error taxonomy, retry policies, dead-letter handling, repair tools, operator runbooks, and transaction boundaries.
- Which side effects are atomic, reversible, repeatable, externally owned, or impossible to confirm.
- Existing timeout and reconciliation behavior.

## Failure model

For each meaningful failure class, specify:

- Detection signal and the component that detects it.
- User-visible and operator-visible result.
- Durable state after failure.
- Whether the operation is safe to retry and under which identity.
- Retry trigger, limit, delay policy, timeout, and terminal condition.
- Compensation or cleanup behavior for completed side effects.
- Resume checkpoint and whether earlier successful work repeats.
- Manual recovery action, authority, and audit requirement.
- Reconciliation behavior when local and external truth disagree.

Distinguish validation rejection, transient infrastructure failure, permanent provider rejection, timeout with unknown outcome, corrupted or impossible state, cancellation, and operator intervention when they lead to different behavior.

## Recovery contract

Define recovery as observable product behavior, not merely "log and retry." State what users can expect, what operators can repair, and which guarantees are impossible.

Use a matrix when useful:

| Failure point | Known side effects | Automatic action | Terminal condition | Manual action |
|---|---|---|---|---|

## Questions that change the Spec

- Can the same action be performed more than once safely?
- What if the remote system succeeded but the response was lost?
- Can recovery resume from a checkpoint or must it restart?
- Which failures block the whole workflow versus one item?
- How long may uncertain state remain before escalation?

## Avoid

- Infinite or unbounded retries.
- Claiming exactly-once behavior without a mechanism and boundary.
- Assuming rollback can undo external side effects.
- Hiding unrecoverable states behind generic failure messages.
- Making a manual database edit the normal recovery contract.

— NiuNiu Tang
