# Cloud and production comparison guide

Use this selectively to explain differences between successful online examples and the actual deployment. These are investigation dimensions, not a universal checklist or asserted causes. Read only relevant configuration fields; do not dump secrets or entire environment files. Any live production access must use the project's authorized access path; research is not permission to query a database or change infrastructure.

| Layer | High-value comparisons | Useful discriminating evidence |
|---|---|---|
| Timeline and rollout | Incident window and timezone, deployment, region, feature rollout, status event | Last good / first bad request, release identifier, event timestamps |
| Runtime and build | OS/architecture, runtime/SDK versions, resolved dependencies, build flags, image digest | Actual deployed artifact versus local lockfile and claimed version |
| Configuration | Effective values, environment precedence, changed defaults, reload/restart needs, units | Narrow redacted runtime values and their source; declared config alone may be insufficient |
| Identity and access | Workload identity, assumed role, resource policy, credential lifetime, cross-account access | Which identity and policy evaluated the failing operation, without exposing credentials |
| Network and TLS | DNS, route, private endpoint, egress, IPv4/IPv6, proxy, certificate trust, SNI | Where a request stops, name resolution from the affected runtime, handshake or connection evidence |
| Intermediaries | CDN, gateway, load balancer, service mesh, upstream protocols, connection reuse | Which hop generated the error; request IDs; connection and timeout settings at both ends |
| Time budgets | Connect, read, idle, processing, queue, and end-to-end timeouts; retries and backoff | Timestamp alignment with thresholds, retry owner, cancellation propagation |
| Capacity and quotas | Burst/sustained load, account/region quotas, CPU/memory/storage, concurrency, connection pools | Effective limit versus observed pressure during the incident, not just current averages |
| Lifecycle | Autoscaling, cold starts, readiness, draining, shutdown grace, ephemeral storage | Failure correlation with instance start/stop and routing transitions |
| State and delivery | Consistency, transactions, caches, partitions, visibility, ordering, duplication, idempotency | Actual state transitions and delivery evidence; apparent loss may differ from persistence loss |
| Integration contract | API version, payload, encoding, pagination, webhook timing, retry/error semantics | Sanitized request/response pair, documented contract for the exact version |
| Operations | Missing bootstrap/migration step, dependency order, monitoring, recovery procedure | Evidence that each prerequisite ran against the intended environment |

## Questions that expose hidden mismatches

- Does the public example run directly while our traffic crosses several managed hops?
- Does it use an administrator identity while production uses a scoped workload identity?
- Does it test one request while our failures require concurrent traffic, idle reuse, or scale events?
- Does its “fixed in version X” apply to the server, client, operator, or managed control plane? Is the patch in our actual artifact?
- Is a documented limit per request, instance, tenant, account, or region, and over which time window?
- Is the example relying on a default, optional feature, or rollout that is absent in our environment?
- Did a restart or cache warm-up coincide with a purported fix and confound the result?
- Does mitigation move the failure to another hop, create retry amplification, duplicate side effects, or increase cost?

## Evidence and action discipline

Match historical claims to the incident window. Healthy metrics now do not refute a transient failure then. A provider status event is a lead unless its service, region, time, and failure mode fit; an empty status page does not rule out a provider issue.

Record the authoritative source and version for defaults, limits, and retry behavior before using them in recommendations. Managed and self-hosted versions can differ. Avoid copying concrete values from a case without comparing traffic, latency budget, topology, and failure consequences.

Before proposing a production experiment, specify why existing read-only evidence or staging cannot resolve the question, the bounded scope, expected observation, abort condition, and recovery path. Execute only within explicit authorization. Distinguish temporary restoration of service from evidence that the underlying fault is corrected.
