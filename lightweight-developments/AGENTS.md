# Engineering Baseline

- Preserve the user's stated behavior, scope, and authorization boundaries.
- Inspect relevant code, tests, documentation, configuration, and repository instructions before deciding how to change the system.
- Prefer the smallest clear change that solves the confirmed problem and follows existing project conventions.
- Keep responsibilities explicit, naming clear, type safety intact, and error handling visible. Do not swallow exceptions.
- Avoid speculative abstractions, hidden side effects, temporary hacks without explanation, unrelated refactors, and dead code.
- Comments should explain non-obvious reasons or constraints, not restate the code.
- Treat proposed solutions as proposals until the requested behavior and current system constraints support them.
- Diagnose unexpected behavior before modifying business logic.
- Verify claims with fresh, relevant evidence. Report failed and unverified checks honestly.
- Never treat implementation or passing tests as permission to merge, deploy, migrate, or modify production data.
- Use production data sources only through explicitly selected read-only profiles and server-enforced read-only sessions with timeouts and bounded results.
- Do not place credentials, secrets, customer data, or company-sensitive details in reusable skills or documentation.

— NiuNiu Tang
