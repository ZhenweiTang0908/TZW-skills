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
| Threat items (see threat-triage.md) | all 正常 | any 需确认 | any 可疑 |
| XProtect | updated within weeks | — | very old version / automatic security updates off |

Notes:
- Apple Silicon reports little through `pmset -g therm`; rely on process load and thermal log lines.
- Pages compressed and swapins are cumulative since boot; compare across two checks, not against a fixed number.
- Developer leftovers (old dev servers on 5173/8000/3000, headless browsers, test runners) are worth listing even at 0% CPU because they hold memory and ports.

## Report shape (Chinese by default)

1. **结论**: one line — 健康 / 有需要注意的地方 / 有需要处理的问题 — plus the main reason in plain words.
2. **主要发现**, ranked by impact. For each:
   - what (process name as the user knows it, PID)
   - evidence (numbers, start time, log line)
   - why it matters
   - suggested action, and whether the agent can do it after confirmation or the user must do it
3. **发烫原因** (when relevant): primary cause, contributors, what is not the cause (for example kernel_task).
4. **正在运行的开发服务**: always present, even if empty. Table — 端口 / 项目目录 / 已运行时长 / PID / 状态（正常、孤儿进程、疑似遗留）. Then other dev processes and test runners in one short list. Flag services up for days that the user is probably not using, and orphaned ones (PPID 1).
5. **定时任务**: always present, even if empty. Table — 名称 / 归属（app 或项目）/ 触发方式（每 N 小时、日历时间、登录时、常驻、文件变化）/ 当前状态. Include crontab and at jobs, launchd jobs, jobs loaded from outside the standard folders, and agent automations. Flag leftovers (program missing, plist empty) and anything the user may not recognise.
6. **威胁排查**: list every 可疑 and 需确认 item with its evidence and how to confirm it; summarise 正常 items as a count ("另有 N 项已知厂商签名的后台项，正常"). Close with the limitation: "这是基于常见迹象的排查，不等同于杀毒软件扫描。"
7. **其他体检项**: a compact table — 区域 / 状态 / 数值 — for CPU, 内存, 温度, 电池, 磁盘, 后台项, 开发服务, 定时任务, 安全, 威胁, 崩溃.
8. **未检查到的部分**: sections that failed, need sudo, or were skipped.
9. End with what was changed: "未做任何修改" unless the user approved actions, in which case list exactly what ran and the before/after numbers.

Keep it short: findings that need nothing from the user go in the table, not in prose. Sections 4 and 5 are the exception: always show them as tables so the user sees everything that is running or scheduled.
