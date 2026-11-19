# Thresholds and Report Shape

Thresholds are guides for a personal Mac, not hard rules. Always state the measured value next to the judgement.

## Thresholds

| Area | Normal | Attention | Action |
|---|---|---|---|
| Load (1 min) vs cores | < perf cores | perf cores – total cores | > total cores for several minutes |
| Single process CPU | short bursts | > 50% for minutes, expected work | > 50% for hours with no expected work, or orphaned |
| Memory free % (`memory_pressure`) | > 30% | 15–30% | < 15% |
| Swap used / total | < 25% | 25–75% | > 75%, or swap total keeps growing |
| Uptime | < 7 days | 7–21 days | > 21 days with memory pressure or odd behaviour |
| Data volume free | > 20% and > 50 GB | 10–20% | < 10% or < 20 GB (updates and swap start failing) |
| Battery maximum capacity | > 85% | 80–85% | < 80%, or condition not Normal |
| Battery cycle count | far from rated limit (Apple notebooks: 1000) | > 800 | > 1000 |
| Kernel panics (30 days) | 0 | 1 | ≥ 2 |
| Same app crashing (7 days) | 0–1 | 2–5 | > 5, or a system process |
| FileVault / SIP / Gatekeeper | on | — | off (explain, do not change) |
| Firewall | on | off on trusted home network | off while on public networks |
| Third-party background jobs | known apps | unknown names | unknown and using CPU or network |
| Listening ports | localhost dev servers | `*:` listeners from apps the user does not recognise | unknown `*:` listeners |
| Threat items (see threat-triage.md) | all Normal | any Needs confirmation | any Suspicious |
| XProtect | updated within weeks | — | very old version / automatic security updates off |

Notes:
- Apple Silicon reports little through `pmset -g therm`; rely on process load and thermal log lines.
- Pages compressed and swapins are cumulative since boot; compare across two checks, not against a fixed number.
- Developer leftovers (old dev servers on 5173/8000/3000, headless browsers, test runners) are worth listing even at 0% CPU because they hold memory and ports.

## Report shape (Chinese by default)

1. **Conclusion**: one line — Healthy / Needs attention / Needs action — plus the main reason in plain words.
2. **Main findings**, ranked by impact. For each:
   - what (process name as the user knows it, PID)
   - evidence (numbers, start time, log line)
   - why it matters
   - suggested action, and whether the agent can do it after confirmation or the user must do it
3. **Heat cause** (when relevant): primary cause, contributors, what is not the cause (for example kernel_task).
4. **Running dev services**: always present, even if empty. Table — port / project directory / uptime / PID / status (normal, orphaned, suspected leftover). Then other dev processes and test runners in one short list. Flag services up for days that the user is probably not using, and orphaned ones (PPID 1).
5. **Scheduled jobs**: always present, even if empty. Table — name / owner (app or project) / trigger (every N hours, calendar time, at login, always on, file change) / current state. Include crontab and at jobs, launchd jobs, jobs loaded from outside the standard folders, and agent automations. Flag leftovers (program missing, plist empty) and anything the user may not recognise.
6. **Threat triage**: list every Suspicious and Needs-confirmation item with its evidence and how to confirm it; summarise Normal items as a count ("N more background items signed by known vendors, normal"). Close with the limitation: "This is a triage based on common indicators, not an antivirus scan."
7. **Other checks**: a compact table — area / status / value — for CPU, memory, temperature, battery, disk, background items, dev services, scheduled jobs, security, threats, crashes.
8. **Not checked**: sections that failed, need sudo, or were skipped.
9. End with what was changed: "No changes were made" unless the user approved actions, in which case list exactly what ran and the before/after numbers.

Keep it short: findings that need nothing from the user go in the table, not in prose. Sections 4 and 5 are the exception: always show them as tables so the user sees everything that is running or scheduled.
