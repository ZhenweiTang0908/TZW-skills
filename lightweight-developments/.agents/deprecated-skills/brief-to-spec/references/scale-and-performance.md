# Scale and Performance

Read this reference when expected load, latency, throughput, payload size, fan-out, quotas, retention, or infrastructure cost can materially affect user-visible behavior or feasibility.

## Inspect

- Current and expected population, request rates, burst patterns, payload distributions, queue depth, retention, latency, and provider limits.
- Existing service-level objectives, query plans, caches, pagination, batching, and cost constraints.
- Whether the brief describes a sample, average, upper bound, or worst case.

## Specify

- Capacity assumptions with unit, time window, distribution, and growth horizon.
- User-visible latency or completion-time targets and percentile where relevant.
- Throughput, concurrency, batch, payload, pagination, and result limits.
- Backpressure, overload, quota, and graceful-degradation behavior.
- Fairness or tenant-isolation expectations under contention.
- Retention and archival behavior that affects storage or query cost.
- Cost constraints only when they influence product behavior or architecture choices.
- Measurement environment and acceptance method for important targets.

## Questions that change the Spec

- Is the target steady-state, burst, peak, or backlog-drain capacity?
- Which operations may become asynchronous above a threshold?
- What should users see when a limit is reached?
- Can one tenant or job starve others?
- Is approximate or eventually complete output acceptable at scale?

## Avoid

- Words such as "fast", "scalable", or "large" without units.
- Requiring implementation techniques such as caching without a behavioral reason.
- Designing solely for averages while ignoring bounded bursts.
- Omitting provider quotas and downstream bottlenecks.
- Setting targets that cannot be observed in an available environment.

— NiuNiu Tang
