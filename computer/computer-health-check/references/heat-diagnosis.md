# Heat, Fan and Throttling Diagnosis

Goal: name the **primary** cause of heat with evidence, plus any contributors. Heat almost always comes from sustained work, so start from who is doing the work.

## Evidence to gather

| Signal | Where | Meaning |
|---|---|---|
| Load average vs core count | `basics` uptime, `hw.ncpu` | Load above the number of performance cores for minutes means sustained full load. |
| Top CPU processes (second `top` sample) | `cpu` | The direct heat sources. Sum the %CPU of the top few. |
| CPU time vs process age | `cpu` long-running list, `ps -o lstart,etime,time` | Hours of CPU time on a process that should finish quickly = runaway. |
| Thermal pressure log lines | `thermal` | "under thermal pressure" / "elevated: true" confirms the OS saw heat; "dropped to nominal" shows recovery time. |
| `kernel_task` high CPU | `thermal`, `cpu` | macOS deliberately occupies CPU to cool down. It is a symptom, never the cause; look for what else is busy. |
| `pmset -g therm` | `thermal` | On Apple Silicon this usually says "no warning recorded" even when hot; do not treat it as an all-clear. |
| Charging state and wattage | `power` | Charging a low battery under load adds heat; a weak charger can drain during load. |
| Swap and compressor | `memory` | Heavy swapping adds SSD and CPU work and makes everything slower and warmer. |
| Model | `basics` `hw.model` | MacBook Air models have no fan: they get hot and throttle quietly. Pro/Studio/mini have fans: noise is the early signal. |

## Common causes, in rough order of how often they explain heat

1. **Runaway or orphaned process.** Test runners, headless engines (Godot, Chrome headless, Playwright), dev servers, build watchers, scripts whose error path never exits. Evidence: started hours ago, constant 50–100% CPU, parent is launchd (PPID 1) or a dead terminal, log stopped or ended in an error. Fix: confirm, then `kill <pid>`; suggest a timeout wrapper so it cannot recur.
2. **Heavy app doing real work.** Browser tabs with video/WebGL, Electron apps (Codex, Slack, Teams, QQ renderers), games, video export, Docker/OrbStack VMs, local LLMs. Evidence: identifiable app, user knows it is open. Fix: user closes tabs/apps or pauses work.
3. **System background jobs.** Spotlight (`mds_stores`, `mdworker`) after big file changes, Photos/media analysis (`photoanalysisd`, `mediaanalysisd`), Time Machine (`backupd`), software updates, iCloud sync (`bird`, `cloudd`). Evidence: Apple process names, often after updates or large copies. Fix: usually wait; they back off under thermal pressure. Mention if it has lasted days.
4. **WindowServer / GPU load.** External or high-refresh displays, many windows, transparency/animations, screen recording. Evidence: WindowServer above ~30% steadily, display count. Fix: close windows, reduce displays, or accept it.
5. **Memory pressure.** Little free memory, swap used is a large share of swap total, high swapins/swapouts growth. Fix: quit big memory users; a reboot after many days of uptime clears leaked memory.
6. **Environment.** Soft surfaces blocking vents, direct sun, warm room, closed lid with external display. Ask only when process evidence is weak.

## Reasoning rules

- Add up the evidence: one runaway process at 55% is noticeable; six of them on an 8-core machine fully explain the heat.
- Separate cause from symptom: kernel_task, high load and thermal-pressure log lines are effects.
- Check the timeline: when thermal pressure started vs when suspect processes started.
- If nothing heavy is running now but the user felt heat earlier, read the thermal log window and crash list, and say the cause is no longer present.
- After a fix, recheck CPU and load, and say that temperature drops over a few minutes.
