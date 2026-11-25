---
name: transfer-coding-to-pi
description: Hand off a well-specified, execution-heavy coding task to the Pi coding agent (OpenCode Go DeepSeek Flash, medium thinking by default). Covers the plan-sufficiency gate, context transfer, the handoff document, Pi invocation, self-install of skills/tools/MCP, and post-run verification. Use ONLY when the user explicitly asks to hand work to Pi; never auto-invoke for a task that merely looks repetitive.
metadata:
  author: NiuNiu Tang
  version: "0.1.0"
---

# Transfer Coding to Pi (NIU)

## Invocation rule

Use this skill **only when the user explicitly asks** to hand a task to Pi — for example "交给 Pi", "让 Pi 做", "hand off to Pi", "run this with Pi", or by naming this skill. A task being repetitive, mechanical, or large is not by itself permission to use this skill.

If the user has not asked for Pi, do the task yourself.

## What belongs here

Good candidates:

- Execution-heavy coding: repetitive edits across many files, mechanical refactors, test backfills, bulk migrations, boilerplate, data-shape changes.
- Tasks whose plan is already settled and whose value is in volume, not judgment.
- Long, well-bounded runs the user wants offloaded while you keep planning.

Do not hand off:

- Design, architecture, ambiguous requirements, or debugging that still needs discovery.
- Production deploys, credential or permission changes, destructive data migrations, anything irreversible.
- Work whose plan you cannot state precisely. Write the plan first.

## Gate 1 — is the plan sufficient?

Do not write a handoff document until every line below is true. If any is missing, stop and produce the missing piece yourself first (use `brief-to-mini-spec`, `spec-to-plan`, `implement-plan`, or plain analysis as appropriate).

- [ ] Objective is one unambiguous sentence.
- [ ] Definition of done is observable and testable.
- [ ] Working directory, repo, branch, and base commit are named.
- [ ] Key files and entry points are listed with paths (and line numbers where useful).
- [ ] Current behavior and desired behavior are both described.
- [ ] The plan is ordered, and each step is independently verifiable.
- [ ] Exact verification commands are given, with expected results.
- [ ] Constraints are explicit: style, dependencies allowed or forbidden, files not to touch, performance/security requirements.
- [ ] Required context exists as artifacts: spec, ADR, issue, logs, failing test output, screenshots, data samples.
- [ ] Open questions are listed. Pi must not have to invent product or design decisions.

A plan that says "implement the feature described in the issue" is not sufficient. A plan that says "edit `src/auth/session.ts:42-88` to replace the cookie parser with `parseSessionCookie`, keep the existing error types, then run `pnpm test auth` and expect 12 passing" is.

## Gate 2 — resource check (before and after planning)

Before writing the plan, and again after the plan is drafted, check what the task needs:

1. **Skills.** Pi discovers `~/.agents/skills`, `.agents/skills` from the working directory up to the repo root, the paths listed under `skills` in `~/.pi/agent/settings.json` (currently `~/.codex/skills` and `~/.claude/skills`), skills bundled in installed Pi packages, and anything passed with `--skill`.
   - Project-local Claude skills in `.claude/skills/<name>` are **not** auto-discovered. Pass `--skill .claude/skills/<name>` or instruct Pi to add the directory to its settings.
2. **MCP servers and tools.** Run `pi mcp list`. Use them only if the task needs them; otherwise run with `--no-mcp` to keep the prompt lean.
3. **Missing capabilities.** Either transfer them (copy a skill directory into the repo and pass `--skill`), or tell Pi to install them globally:
   - `pi install npm:<package>`
   - `pi mcp add <name> -- <command>`
   - adding a skill directory to `~/.pi/agent/settings.json`

Record the exact install commands in the handoff document. Pi is allowed to install globally; it must report what it installed.

## Write the handoff document

Put it in the repo so Pi can resolve relative paths:

```
.pi-handoff/<YYYY-MM-DD>-<slug>.md
```

Add `.pi-handoff/` to `.gitignore` unless the user wants the handoff committed. If the repo must stay clean, use a temp directory and pass absolute paths.

Use `references/handoff-template.md`. **The template is flexible**: rename, merge, drop or add sections to fit the task. The only required parts are **Objective**, **Done criteria**, and a final **Note**.

Rules for content:

- Be literal: exact paths, exact commands, exact expected output. No "as discussed".
- Paste short excerpts inline; for long documents, copy them to `.pi-handoff/<slug>/` and reference the path, or reference the original absolute path if Pi can read it.
- Include failing test names and full output; include reproduction commands and environment versions.
- Never include secrets. Give environment variable names and where they are set.
- State what Pi must **not** do: files, branches, dependencies, network calls, destructive commands.
- Put anything that does not fit elsewhere in `## Note`. Note is a free space, not just "remarks": uncertainties, preferences, warnings, links, names, edge cases, half-formed thoughts. Say so in the document.

## Invoke Pi

Default command:

```bash
pi -p \
  --provider opencode-go \
  --model deepseek-v4.1-flash \
  --thinking medium \
  --name <slug> \
  "Read .pi-handoff/<file>.md and execute it exactly. You may install skills, packages or MCP servers if the handoff says so. Do not change scope. When done, report changed files, commands run, test output, and anything blocked."
```

Adjust only with a reason you can state:

- Harder reasoning: `--thinking high`. Faster, still reliable: `--thinking off`.
- **Do not use `--thinking low` by default.** As of 2026-11-25, DeepSeek Flash via both `opencode-go` and direct `deepseek` stalls indefinitely on tool-call continuations at `low` (observed repeatedly: 2–5 minutes with no response and no file change). `medium` and `off` complete the same handoff in seconds. Use `low` only if the user explicitly asks, and rerun at `medium` if it stalls.
- Heavier task or Go quota issue: `--provider deepseek --model deepseek-flash` (direct API, already authenticated).
- Pure repo work: add `--no-mcp`.
- Project-local skills: add `--skill .claude/skills/<name>` (repeatable).
- Long run: launch in the background and tee to a log; keep the session name so `pi -c` can resume.

The prompt should always tell Pi to read the handoff file first, follow it, install only what the handoff allows, and report evidence rather than claims.

Long runs: launch Pi in the background and tee to `.pi-handoff/<slug>.log`, or the host's two-minute command timeout will kill it mid-edit. Use `--mode json` when you need machine-readable progress.

## While Pi runs

- Do not edit the same files.
- Prepare verification: the test commands, the diff scope, and the acceptance checklist.
- If the run is long, monitor the log for the first failure instead of waiting for the end.

## After Pi returns

Pi's report is not evidence. Verify independently:

1. `git diff` — only expected files, no unrelated edits, no secrets.
2. Run the verification commands yourself.
3. Check the acceptance criteria one by one.
4. Check for scope drift, skipped steps, and silent stubs (TODOs, hardcoded values, disabled tests).
5. If blocked or incomplete, either continue the same session (`pi -c`) with a short follow-up, or take the task back and fix it yourself.

Report to the user: what changed, what you verified, what remains, and any install Pi performed.

## Failure modes

- **Pi stops without acting.** DeepSeek occasionally emits a text-format tool call that is not executed. Check the log; rerun with an explicit instruction to use the `bash` tool. If it recurs, install the community parser extension or report it.
- **No output for more than ~90 seconds.** Check the thinking level first. `--thinking low` is the known trigger; rerun with `medium` or `off`. Run with `--mode json` redirected to a log so a killed run still leaves evidence.
- **Auth or quota errors.** Run `pi auth check --provider opencode-go --model deepseek-v4.1-flash --json --no-refresh`. Fall back to `--provider deepseek --model deepseek-flash`.
- **Destructive command blocked.** `cc-safety-net` blocks risky commands and secret-file access by default. Confirm with the user before asking Pi to work around it; never disable the guard silently.
- **Scope drift or invented requirements.** Stop the run, tighten the handoff document, restart with a new session.

## Reference files

- `references/handoff-template.md` — flexible handoff template.
- `references/pi-runtime.md` — Pi commands, model IDs, skill paths, installed packages.

— NiuNiu Tang
