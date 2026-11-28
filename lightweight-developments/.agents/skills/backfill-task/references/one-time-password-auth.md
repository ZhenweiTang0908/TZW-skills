# Isolated Request Authentication (reference)

Load this when a backfill job needs its own control-API credential. The default scheme below is one option. Use another isolated scheme only if the user names it; never reuse the application's credentials.

# One-time password with embedded hash verification

"Existing application credentials" means JWTs, user tokens, sessions, and the application's API or service keys (for example the project's X API or S Key). Do not use any of them for the backfill control API. Do not add a second application-level credential check either; network controls the platform already enforces in front of every endpoint, such as a private network, IP allowlist, or gateway, may stay in place.

For each backfill job, generate a one-time password locally from a cryptographically secure random source with at least 256 bits of entropy (for example 32 random bytes, hex- or base64url-encoded). Never use a human-chosen or short password. Derive its SHA-256 hash once and inject only the resulting target hash into the dedicated backfill code/configuration; because the password is random and long, a fast hash is sufficient and a slow password hash is unnecessary. The API request presents the original one-time password, never the hash. The cloud endpoint hashes the received password with SHA-256 and performs one constant-time comparison against the injected target hash.

Before creating the password file, inspect the repository's existing `.gitignore`. Use an already ignored temporary directory for the password file, such as `temp/`, `codes_temp/`, or `local_temp/`, when that directory is present and its ignore rule covers the directory contents. Do not scatter the password in the repository, home directory, source tree, or an arbitrary system temp location. Do not automatically create a new directory or edit `.gitignore` just to make the workflow pass. If none of the existing ignored directories is available, stop and ask the user to choose or authorize a repository-specific location. The original password must not be committed, logged, returned, or placed in the Skill.

The password file should have restrictive permissions, a clear job-specific name, and a short lifecycle. Record only the file path and cleanup action in the job contract; never record the password value. Keep the target hash in the intended dedicated backfill code/configuration, not the password file, when the runtime requires the hash to be embedded.

The target hash alone must not be accepted as the request credential. Protect the original password in transit with the existing deployment's TLS, avoid exposing it in URLs and logs, restrict the endpoint to the backfill control surface, and delete or invalidate the target hash when the job completes, is cancelled, expires, or is abandoned. “One-time” means one backfill job lifecycle, not a new verification scheme per request: the same password is presented on every control request of that job, so treat it as a short-lived bearer secret.

Bound that lifetime explicitly. Record an absolute expiry in the job contract, normally the maximum job duration plus a short margin and never more than one day, after which the verifier rejects the password even if the hash was not yet removed. Limit failed verification attempts per source and per job, for example with the platform's rate limiting or a small in-process counter that rejects further attempts for a cooling-off period, and log failures without the presented value.

The cloud-side verifier must receive the target hash through the explicitly chosen deployment path and must hash the request password before comparison. Do not silently fall back to existing application credentials, HMAC, nonce, timestamp, or another credential check.

— NiuNiu Tang
