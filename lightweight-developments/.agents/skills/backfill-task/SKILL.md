---
name: backfill-task
description: Design and implement short-lived, externally controlled backfill jobs with pause/resume recovery, durable idempotency, structured observability, and isolated request authentication. Use when a user asks to backfill, reprocess, repair, or populate existing data through a bounded API-driven job; do not use for ordinary synchronous endpoints, irreversible bulk migrations, or long-running workflow orchestration.
metadata:
  author: NiuNiu Tang
  version: "0.1.1"
---

# Backfill Task

Treat the request as a bounded backfill job, not as an ordinary API call and not as an interactive AI loop. Keep the implementation small, asynchronous, restartable, observable, and isolated from the application's normal API authentication and business paths.

## Use when

- Existing records need to be recalculated, enriched, repaired, or populated.
- The operator should start, pause, resume, inspect, or stop the work through API requests.
- The expected run is short-lived, normally minutes or hours and no longer than one day without an explicit discussion.
- A restart must skip records that were already completed successfully.

## Do not use when

- The request is a normal user-facing synchronous endpoint.
- The operation is an irreversible schema/data migration requiring a formal migration or release workflow.
- The work is expected to run longer than one day, requires a durable workflow engine, or has complex cross-service orchestration; stop and discuss escalation.
- The user has not authorized the target scope, environment, or data mutation.

## Mandatory discussion before implementation

First restate the backfill contract and challenge it with `doubt-review` behavior. Ask or infer only the minimum missing decisions, and explicitly discuss:

- target records and selection snapshot;
- what counts as successfully completed;
- the stable idempotency key for each item;
- whether an item may be retried after a partial external side effect;
- pause, cancel, timeout, and retry semantics;
- maximum duration, batch size, concurrency, and rate limits;
- sensitive fields and log redaction;
- the exact environment and authorization to mutate it.

Do not implement while a material ambiguity remains. A short backfill still needs a Mini Fix Contract or equivalent job contract.

## Required design

### 1. API-driven asynchronous control

Expose a dedicated backfill control API. Do not reuse the application's normal X API, JWT, user token, middleware, routes, or scopes. Keep the control surface minimal, for example:

- create/start a job;
- get job status and counters;
- request graceful pause;
- resume a paused or recoverable job;
- request cancellation when supported.

Starting the job must return quickly with a job identifier. The request handler must not perform the whole backfill or wait for completion. Status must include state, progress, timestamps, last checkpoint, retry counts, and an actionable failure summary.

### 2. One-time password with embedded hash verification

Do not use the application's X API, S Key, JWT, user token, or any other existing authentication mechanism. Do not add a second authentication layer for this backfill control API.

For each backfill job, generate a high-entropy one-time password locally, derive its hash once, and inject only the resulting target hash into the dedicated backfill code/configuration. The API request presents the original one-time password, never the hash. The cloud endpoint hashes the received password with the agreed algorithm and performs one constant-time comparison against the injected target hash. The original password must not be committed, logged, returned, or placed in the Skill. Keep the target hash in a Git-ignored local/temp file or ignored deployment configuration when the repository's runtime cannot safely hold it directly in source.

The target hash alone must not be accepted as the request credential. Protect the original password in transit with the existing deployment's TLS, avoid exposing it in URLs and logs, restrict the endpoint to the backfill control surface, and delete or invalidate the target hash when the job completes, is cancelled, expires, or is abandoned. “One-time” means one backfill job lifecycle, not a new verification scheme per request.

The cloud-side verifier must receive the target hash through the explicitly chosen deployment path and must hash the request password before comparison. Do not silently fall back to JWT, X API, S Key, HMAC, nonce, timestamp, or another credential check.

### 3. Graceful pause and recovery

Pause is cooperative: stop taking new work, finish or safely abandon the current item, persist a checkpoint, release the lease, and expose the paused state. Never kill the process as the normal pause mechanism.

Recovery must load durable job state and continue from the checkpoint or item ledger. It must not rely only on in-memory counters, process memory, logs, or the caller remembering the last item.

### 4. Durable idempotency

Choose a stable per-item idempotency key from immutable source identity plus the backfill version or operation name. Persist item state and the result atomically with the business write where possible. A successful item must be skipped on resume and retry. In-progress items need an explicit lease/timeout state so a crashed worker can reclaim them safely.

If the operation calls an external system, classify side effects as retry-safe, conditionally safe, or unsafe. For unsafe effects, require an idempotency key accepted by that system or stop for discussion; do not claim that a local duplicate check alone makes the operation safe.

### 5. Logging and monitoring

Emit structured logs with job ID, item key or a redacted surrogate, state transition, batch, attempt, duration, error class, and checkpoint. Redact secrets, signatures, tokens, and sensitive payloads.

Expose externally consumable status and health information without exposing credentials or full customer data. Include totals, completed, skipped, failed, retryable, current rate, last progress time, pause/cancel state, and the last safe checkpoint. Add a stale-worker or no-progress signal.

### 6. Bounded execution

Use bounded batches, bounded concurrency, explicit per-item and whole-job timeouts, retry limits, backoff, and a stop condition. Do not make the AI poll the job in a loop or keep consuming tokens while waiting. Return control after dispatch and tell the operator how to query status.

The worker must not block unrelated application traffic. Prefer a separate worker/process/queue or an explicitly isolated execution path with resource limits, leases, and rate limits.

## Process

1. Identify the task as a backfill and state that the backfill workflow is being used.
2. Inspect repository instructions, existing job/worker patterns, data model, relevant writes, API routing, configuration, and tests.
3. Write a compact job contract: scope, item key, states, checkpoint, success criteria, retry policy, limits, API surface, authentication, and verification.
4. Conduct an adversarial doubt/discussion pass. Look for duplicate writes, partial failures, replayed requests, stale leases, concurrent runs, empty scope, changing source data, sensitive logs, and pause races.
5. Implement the smallest isolated design that satisfies the contract. Do not reuse X API or JWT infrastructure.
6. Verify with focused tests for password-to-hash acceptance/rejection, rejection of a raw target-hash request, password/hash non-disclosure, idempotent resume, pause at a checkpoint, crash/lease recovery, retry classification, status visibility, redaction, hash invalidation, and bounded failure.
7. Report the job ID/control API, operational commands, evidence, remaining risks, and whether the task is ready to run. Do not start a production backfill, deploy, migrate, or modify production data without separate explicit authorization.

## Stop conditions

Stop and ask for a decision if the target environment, data scope, source of truth, item idempotency key, password/hash injection or invalidation path, external side-effect safety, or maximum runtime is unclear. Stop if the job cannot persist progress, cannot distinguish completed from in-progress work, or would require the normal JWT, X API, S Key, or another authentication system.

## Output

```markdown
## Backfill Contract

## Doubt / Discussion

## Design

## API and Authentication

## Recovery and Idempotency

## Observability

## Verification

## Run Instructions and Authorization Boundary
```

— NiuNiu Tang
