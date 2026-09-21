# Permissions and Trust Boundaries

Read this reference when actors have different capabilities, data visibility differs by role or tenant, privileged operations exist, or data crosses a trust boundary.

## Inspect

- Existing authentication, authorization, tenancy, ownership, service identity, impersonation, and audit patterns.
- Enforcement points across UI, API, workers, database access, and external callbacks.
- Current administrator and support capabilities.

## Specify

- Actors and identities, including users, services, providers, and operators.
- Resources and operations each actor may perform.
- Scope rules such as tenant, team, owner, region, or delegated access.
- Preconditions and context that affect authorization.
- Where permission is enforced and behavior when it is denied.
- Visibility of existence, metadata, content, and history as separate concerns where relevant.
- Privilege changes, revocation timing, session effects, and stale authorization caches.
- Audit requirements for privileged or impersonated actions.
- Trust boundaries and validation required for data crossing each boundary.

A permission matrix is useful when more than two actors or operations interact:

| Actor | Resource scope | Operation | Allowed when | Denied behavior |
|---|---|---|---|---|

## Questions that change the Spec

- Is access role-based, ownership-based, relationship-based, or a combination?
- Can an actor infer that a forbidden resource exists?
- What happens to active work when access is revoked?
- Are support or administrative overrides allowed, and how are they audited?
- Does a trusted internal event still require tenant and object validation?

## Avoid

- Defining only UI visibility while omitting server-side enforcement.
- Using "admin" without specifying scope and capability.
- Treating authentication as authorization.
- Assuming tenant identifiers supplied by clients are trustworthy.
- Adding broad permissions for implementation convenience.

— NiuNiu Tang
