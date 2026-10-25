---
name: computer-health-check
description: Run a read-only macOS health check of live system state: CPU and runaway processes, memory pressure and swap, heat and throttling causes, battery and power, disk space and I/O, background and login items, running dev services and leftover developer processes and ports, scheduled tasks (cron, launchd timers, agent automations), basic security settings, suspected malware or unwanted persistence (launch agents, unsigned binaries, profiles, proxies, browser extensions), and recent crashes. Use when the user says the computer is hot, slow, loud, draining battery, acting strangely, may have a virus/trojan, or asks for a 电脑体检 / health check; do not use for auditing installed software clutter (use computer-software-audit) and never terminate, clean or change anything without explicit per-item confirmation.
---

# Computer Health Check (NIU)

Diagnose how the machine is doing **right now** and why, then hand the user a short, ranked list of findings with evidence and safe next steps. **Write user-facing results in Chinese by default**, unless the user asks for another language. Focus on macOS (Apple Silicon and Intel).

This skill looks at live state (processes, pressure, heat, power, disk). Installed-software inventory, duplicate installs and disk-cleanup candidates belong to `computer-software-audit`; point there when the user's question is about clutter rather than health.

## Boundaries

- **Read only by default.** Do not kill processes, quit apps, clear caches, delete files, unload launchd jobs, change power/energy settings, toggle security settings, or install tools. Permission to check is not permission to fix.
- **Fixes need explicit, per-item confirmation.** After reporting, you may offer specific actions (for example `kill <pid>` for an orphaned test runner). Act only on the items the user approves in chat, list exactly what will run first, then verify the result. Never touch kernel_task, WindowServer, launchd, other `/System` processes, or a process you cannot identify; never `kill -9` before a plain `kill` has had a few seconds.
- **No sudo, no privacy prompts.** Skip `powermetrics`, `fs_usage`, `sfltool dumpbtm` and anything else needing root or Full Disk Access; record the gap instead. Do not open System Settings panes.
- **Protect secrets.** Process arguments, launchd plists and listening services can contain tokens or paths to private data. Truncate command lines (the script does) and redact anything that looks like a key, token, password or email before showing it.
- **No network.** Do not upload snapshots or process lists anywhere. Upstream lookups (for example "is this process known to be heavy?") are fine only with generic terms, never the user's data.

## Workflow

1. **Frame the complaint.** Note the symptom (hot, slow, fan, battery, beachballs, "just a checkup") and when it started. A symptom focuses the check but does not skip the baseline.
2. **Take the snapshot.** Run `scripts/snapshot.sh` from this skill's directory (about 10 seconds, read only). For a focused question pass sections, for example `snapshot.sh cpu thermal power`. Sections: `basics cpu memory thermal power disk background dev schedules security threats crashes`.
3. **Interpret against thresholds.** Read [references/thresholds-and-report.md](references/thresholds-and-report.md) for what counts as normal, worth attention, or needing action. Correlate across sections instead of judging each number alone: a runaway process explains high load, heat and fast battery drain at the same time.
4. **When the complaint is heat, noise or throttling,** follow [references/heat-diagnosis.md](references/heat-diagnosis.md) to rank causes. Always give one primary cause with evidence, not a list of possibilities.
5. **Always list running dev services and scheduled tasks.** Every full check reports them even when they look harmless, because the user often forgets what is still running. From `dev`: each listening dev service with port, project folder (cwd), uptime and whether it is orphaned (PPID 1), plus other dev processes and test runners; runtimes bundled inside apps (Codex, Electron helpers) are only counted. From `schedules`: crontab, at jobs, every launchd job with its trigger (interval, calendar, at login, keep alive, file watch) and state, jobs loaded from outside the standard folders, and agent automations (Codex, Claude). Map each item to the project or app it belongs to.
6. **Always triage threats.** Every full check includes the `threats` section; rate each item 可疑 / 需确认 / 正常 using [references/threat-triage.md](references/threat-triage.md), which also sets stricter limits (never run suspicious files, never upload hashes or paths without consent, never remove persistence yourself). This is triage, not an antivirus scan: never call the machine "clean".
7. **Dig only where the snapshot points.** For each suspect, identify it before judging it: `ps -o pid,ppid,lstart,etime,args -p <pid>`, its parent, its working directory (`lsof -a -p <pid> -d cwd`), and its log file if the arguments name one. A long-running process is only "stuck" with evidence (no progress in its log, error before exit, parent gone, far past its expected runtime).
8. **Report.** Use the report shape in the thresholds reference: overall verdict, ranked findings with evidence → meaning → suggested action, and coverage gaps. Mark which actions the agent can run after confirmation and which the user must do themselves.
9. **Act only on approval, then re-check.** After approved fixes, rerun the relevant sections and report the before/after numbers. Load averages lag; mention that the 1-minute value needs a minute or two to settle.

## Execution notes

- Prefer the script over ad-hoc commands so results stay comparable between checks. If a section fails or is restricted, say so in coverage gaps and continue.
- `top` needs two samples for real CPU percentages; the script already discards the first.
- Name processes the way the user knows them (app name, project name, test file), not only by PID.
- For recurring problems (the same orphaned runner type keeps appearing), suggest a prevention, such as a wrapper with a hard timeout, rather than only killing it again.
