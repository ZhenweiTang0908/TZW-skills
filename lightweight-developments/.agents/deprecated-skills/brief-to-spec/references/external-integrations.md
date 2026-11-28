# External Integrations

Read this reference when the feature calls or is called by a third-party service, public API, internal service contract, webhook, file exchange, or provider-specific workflow.

## Inspect

- Existing clients, adapters, API contracts, webhook handlers, credentials model, rate limits, sandbox behavior, and provider-specific semantics.
- Ownership of identifiers, timestamps, status, and source of truth.
- Current versioning, deprecation, timeout, retry, and verification mechanisms.

## Specify

- Purpose and boundary of each integration.
- Request, response, event, or file semantics that affect product behavior.
- Identity mapping and correlation between local and remote objects.
- Authentication and authorization expectations without embedding secrets.
- Timeout, quota, rate-limit, and availability assumptions.
- Versioning and backward-compatibility contract.
- Webhook authenticity, replay, duplication, delay, and ordering behavior.
- Ownership when local and remote state conflict.
- User-visible behavior during provider degradation or unsupported capability.
- Provider substitution or feature degradation only when actually required.

## Questions that change the Spec

- Does local success require remote acceptance, completion, or acknowledgment?
- Can the provider return success before durable completion?
- How are duplicate callbacks and unknown remote outcomes reconciled?
- Which provider errors are user-correctable versus operational?
- Is provider-specific behavior exposed or normalized?

## Avoid

- Copying an entire vendor API into the feature Spec.
- Assuming test and production providers behave identically.
- Treating HTTP success as proof of business completion.
- Omitting webhook verification or replay handling.
- Hard-coding credentials, endpoints, customer identifiers, or secret values.

Coordinate uncertain outcomes with [failure recovery](failure-recovery.md) and contract evolution with [migration and compatibility](migration-and-compatibility.md).

— NiuNiu Tang
