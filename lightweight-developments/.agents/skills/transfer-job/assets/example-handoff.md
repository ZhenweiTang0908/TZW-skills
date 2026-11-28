# Example: transfer a bulk rename to Pi

A filled-in handoff document. Use it as a model, not a required format.

## Objective

Rename the `legacyUser` module to `account` across `src/` and update every import.

## Done criteria

- [ ] `pnpm typecheck` passes.
- [ ] `pnpm test` passes with no new failures.
- [ ] No file under `src/legacy/` remains.

## Repo and environment

- Working directory: repo root
- Branch: `refactor/account-rename`, clean tree
- Package manager: pnpm

## Context

`src/legacy/user.ts` exports user types used by 23 files. The rename was decided in ADR-014; the public API must keep the same runtime behavior.

- Entry points: `src/legacy/user.ts:1`, `src/index.ts:12`
- Spec: `docs/adr/014-account-rename.md`

## Constraints

- Change imports only; do not change function bodies.
- Do not touch `src/billing/`.
- No new dependencies.

## Plan

1. Rename files in `src/legacy/` from `user` to `account`. Check: `rg legacyUser src` returns nothing.
2. Update imports across `src/`. Check: `pnpm typecheck`.
3. Run tests. Check: `pnpm test`.

## Verification

```bash
pnpm typecheck
pnpm test
```

## Skills, tools, and MCP

- None required. Run with `--no-mcp`.

## Reporting back

Report changed files, the three command outputs, and anything skipped.

## Note

If the ADR and the code disagree, stop and report instead of guessing. The billing module is out of scope even if it still imports the old name.

— NiuNiu Tang
