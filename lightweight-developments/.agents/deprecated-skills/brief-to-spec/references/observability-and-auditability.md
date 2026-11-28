# Observability and Auditability

Read this reference when operators must monitor health, explain individual outcomes, investigate failures, satisfy audit requirements, or measure product behavior.

## Inspect

- Existing logs, metrics, traces, audit events, dashboards, alerts, correlation identifiers, retention, and access controls.
- Which business events already exist and what sensitive data they contain.
- Current operator and support workflows.

## Specify

- Observable success, degradation, and failure signals.
- Correlation keys needed to trace one business operation across components.
- Business events and state transitions that require an audit record.
- Actor, action, target, result, reason, and time fields when relevant.
- Metrics with exact counting unit, denominator, dimensions, and time semantics.
- Alert conditions tied to actionable response rather than mere noise.
- Diagnostic visibility available to users, support, operators, and administrators.
- Redaction, access, retention, and deletion behavior for telemetry and audit data.

## Questions that change the Spec

- Must the system explain why a specific item reached its state?
- Which actions require immutable or tamper-evident history?
- What evidence distinguishes delayed work from stuck work?
- Which dimensions are safe and useful for aggregation?
- How will an operator know recovery succeeded?

## Avoid

- Using "add logs" as an observability requirement.
- Logging secrets, credentials, full payloads, or unnecessary personal data.
- Metrics whose unit or population is ambiguous.
- Alerts without an owner or actionable condition.
- Treating operational telemetry as a substitute for product state.

— NiuNiu Tang
