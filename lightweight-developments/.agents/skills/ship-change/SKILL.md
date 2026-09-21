---
name: ship-change
description: Merge, deploy, execute migrations, roll out, or verify a release only after explicit user authorization for the exact target and environment. Use for production-affecting delivery with prechecks, postchecks, and recovery planning; implementation or passing tests never imply shipping permission.
metadata:
  author: NiuNiu Tang
  version: "0.2.0"
---

# Ship Change

Deliver an already implemented and appropriately verified change to an explicitly authorized target while preserving a recovery path.

## Use when

The user explicitly asks to merge, release, deploy, execute a migration, perform a rollout, or verify a release in a named target environment.

## Do not use when

- The user only asked to implement, test, review, or prepare a release.
- The target version, environment, authorization, or recovery expectations are ambiguous.
- Required acceptance or pre-deploy checks have material failures.

## Expected input

Explicit shipping authorization, target revision or version, target environment, approved delivery mechanism, verification status, migration details when relevant, and available rollback or recovery procedure.

## Inspect first

Confirm repository and release instructions, current revision and worktree, CI or check status, dependency and migration order, environment identity, configuration differences, monitoring, and recovery mechanisms. Check who or what will be affected.

## Process

1. Restate the authorized action, version, and environment.
2. Run proportional pre-deploy checks and confirm unresolved risks.
3. Establish rollback or forward-recovery criteria before mutation.
4. Execute only the authorized release action using the project's supported mechanism.
5. Observe completion; do not infer success from command submission alone.
6. Run post-deploy checks against user-visible behavior, health, errors, and migration state as relevant.
7. Report evidence, residual risk, and whether rollback criteria were triggered.

For staged rollouts, define a bounded observation window and stop criteria. For irreversible migrations, require an approved recovery strategy appropriate to that irreversibility; a nominal rollback command is not enough.

## Output

```markdown
## Target Version

## Target Environment

## Pre-deploy Checks

## Deployment Action

## Post-deploy Verification

## Rollback / Recovery Strategy

## Result and Residual Risk
```

When saving the release record, start from [the shipping report template](assets/shipping-report-template.md).

## Permissions and safety

Explicit authorization is required immediately before the production-affecting action. Authorization for implementation, tests, commit creation, or a different environment does not transfer. Do not mutate production data outside the approved release or migration mechanism.

## Stop or escalate

Stop on target mismatch, stale or unknown revision, failed required checks, unavailable monitoring, missing recovery path, unexpected blast radius, or results outside defined safety thresholds. Do not improvise a production fix without new authorization.

## Routing examples

- Use: "Deploy commit abc123 to production using the standard pipeline and verify the attachment flow."
- Do not use: "The change is ready." This is not shipping authorization.
- Borderline: "Prepare it for release" permits checks and a release plan, not merge or deployment.

— NiuNiu Tang
