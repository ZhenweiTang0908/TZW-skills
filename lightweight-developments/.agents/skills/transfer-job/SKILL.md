---
name: transfer-job
description: Hand token-heavy, repetitive execution work to the Pi agent (DeepSeek Flash) when the user explicitly asks to hand it to Pi ("交给 Pi", "让 Pi 做", "hand to Pi"). Claude owns the thinking and the plan; Pi only executes a settled plan. Do not use unless the user asks for Pi by name.
disable-model-invocation: true
metadata:
  author: NiuNiu Tang
  version: "0.2.0"
---

# Transfer Job (NIU)

Pi is the cheap, high-volume hands. Claude is the brain. Use this skill to move long, repetitive, token-heavy execution off Claude's budget once the plan already exists.

## When to use

Use only when the user explicitly asks to hand work to Pi, and the work is:

- Token-heavy and mechanical: bulk edits across many files, mass renames, test backfills, boilerplate, data reshaping, long repetitive runs.
- Already planned: the steps, files and verification are known. Pi does not design, decide, or debug.

Do not use for: design or judgment calls, debugging with unknown cause, anything needing discovery, production deploys, credential or permission changes, or irreversible operations. Do these yourself.

## Before handing off (Claude's job)

1. Make sure the plan is concrete: one-sentence objective, observable done criteria, exact files and steps, exact verification commands with expected results. If any is missing, finish planning first.
2. Write the handoff to `.pi-handoff/<YYYY-MM-DD>-<slug>.md` inside the repo, using `references/handoff-template.md`. Keep the required parts: Objective, Done criteria, Plan, Verification, Constraints, Note.
3. Make sure `.pi-handoff/` is git-ignored unless the user wants it committed.

## Run Pi

Current defaults and commands live in `references/pi-runtime.md`. Default invocation:

```bash
pi -p \
  --provider opencode-go \
  --model deepseek-v4.1-flash \
  --thinking medium \
  --name <slug> \
  "Read .pi-handoff/<file>.md and execute it exactly. Do not change scope. When done, report changed files, commands run, test output, and anything blocked."
```

- Always use `--thinking medium` or `off`. Never `low` (it stalls, see runtime reference).
- Long runs: launch in the background and tee to `.pi-handoff/<slug>.log`. Host command timeouts kill long foreground runs mid-edit.
- Do not edit the same files while Pi runs.

## After Pi returns

Pi's report is not evidence. Verify yourself:

1. `git diff` contains only the expected files, no unrelated edits, no secrets.
2. Run the verification commands from the handoff.
3. Check each done criterion.
4. Look for scope drift, skipped steps, TODO stubs, hardcoded values, disabled tests.
5. If incomplete: send a short follow-up with `pi -c`, or take the task back and finish it yourself.

Report to the user: what changed, what you verified, what remains, and any installs Pi made.

## Stop and tighten

Stop the run and rewrite the handoff if Pi drifts from scope or invents requirements. Troubleshooting details are in `references/pi-runtime.md`.

— NiuNiu Tang
