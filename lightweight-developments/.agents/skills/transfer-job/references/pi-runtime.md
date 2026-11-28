# Pi runtime reference

Snapshot: 2026-11-25, Pi 1.6.1, macOS.

## Defaults

`~/.pi/agent/settings.json`:

- `defaultProvider`: `opencode-go`
- `defaultModel`: `deepseek-v4.1-flash`
- `defaultThinkingLevel`: `medium`
- `skills`: `~/.codex/skills`, `~/.claude/skills`

Both `opencode-go` and `deepseek` are authenticated (`pi auth check ...` returns `ready`, `api_key`).

**Thinking-level caveat (2026-11-25).** `low` stalls indefinitely on tool-call continuations with DeepSeek Flash, on both providers; `medium` and `off` complete the same task in seconds. Defaults use `medium` for that reason.

## Models

| Provider | Model | Context | Notes |
|---|---|---|---|
| `opencode-go` | `deepseek-v4.1-flash` | 1M | Default. Cheap, reasoning on. |
| `opencode-go` | `deepseek-v4-pro` | 1M | Stronger, higher cost. |
| `deepseek` | `deepseek-flash` | 1M | Direct API fallback. |
| `deepseek` | `deepseek-v4-pro` | 1M | Direct API fallback. |

Thinking levels: `off`, `minimal`, `low`, `medium`, `high`, `xhigh`, `max`. The settings default is `medium`; do not use `low` (see caveat above).

## Commands

```bash
pi                                  # interactive
pi -p "..."                         # non-interactive, prints result
pi -p --mode json "..."             # machine-readable event stream
pi -c                               # continue the most recent session
pi -r                               # pick a session to resume
pi --session <id|path>              # resume a specific session
pi --name <slug> ...                # name the session
pi --no-mcp ...                     # skip MCP; leanest prompt
pi --skill <path> ...               # load a skill file or directory
pi --thinking low|medium|high ...   # override thinking level
pi mcp list                         # MCP server status and tool counts
pi auth check --provider opencode-go --model deepseek-v4.1-flash --json --no-refresh
```

## Skills discovery

Pi loads skills from:

- `~/.agents/skills/`
- `.agents/skills/` from the working directory up to the repo root
- paths listed under `skills` in `~/.pi/agent/settings.json`
- skills bundled in installed packages
- `--skill <path>` at invocation

It does **not** auto-read `.claude/skills` inside a project. Pass it explicitly:

```bash
pi -p --skill .claude/skills/<name> ...
```

Pi also loads `AGENTS.md`, `AGENTS.override.md`, `CLAUDE.md`, and `CLAUDE.MD` as context files without extra configuration.

Loaded at last check: 43 skills, including all Codex and Claude skills plus this one. One harmless collision: two `pdf` skills; the Codex one wins. The deterministic way to list them is Pi's own loader:

```bash
node --input-type=module -e "import { loadSkills } from '$HOME/.node_modules/lib/node_modules/@earendil-works/pi-coding-agent/dist/core/skills.js'; const r = loadSkills({ cwd: process.cwd(), agentDir: '$HOME/.pi/agent', skillPaths: ['~/.codex/skills','~/.claude/skills'], includeDefaults: true }); console.log(r.skills.map(s => s.name).sort().join('\\n'));"
```

## Installed packages

- `pi-web-access` — web search, URL/PDF/YouTube fetching.
- `cc-safety-net` — blocks destructive commands and secret-file access.
- `pi-lens` was removed: its first-run LSP setup hung handoffs for minutes. Reinstall only if you want language-server feedback and have verified startup time.

MCP servers configured: `chrome-devtools` (connected, 33 tools), `klicktipp` (needs sign-in), `computer-use` (broken path), `node_repl` (disabled). For coding handoffs, prefer `--no-mcp` unless a server is actually needed.

## Sandbox

Pi has no built-in sandbox or per-call approval. It runs with the launching user's permissions. For unattended work, run it inside a container, a micro-VM, or a disposable git worktree, and keep `cc-safety-net` enabled.

— NiuNiu Tang

## Troubleshooting

- **Pi stops without acting.** DeepSeek sometimes emits a text-format tool call that is not executed. Check the log; rerun with an explicit instruction to use the `bash` tool.
- **No output for more than ~90 seconds.** Check the thinking level first; `low` is the known trigger. Rerun at `medium` or `off`. Use `--mode json` redirected to a log so a killed run still leaves evidence.
- **Auth or quota errors.** Run `pi auth check --provider opencode-go --model deepseek-v4.1-flash --json --no-refresh`. Fall back to `--provider deepseek --model deepseek-flash`.
- **Destructive command blocked.** `cc-safety-net` blocks risky commands and secret-file access. Confirm with the user before asking Pi to work around it; never disable the guard silently.
