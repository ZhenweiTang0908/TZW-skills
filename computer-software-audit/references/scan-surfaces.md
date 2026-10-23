# Scan Surfaces and Read-only Methods

Read the relevant platform sections. Commands are optional query examples, not a batch script. First confirm tool availability, supported flags, and absence of operational side effects. Mark absent managers not applicable; do not install them. Do not execute every query merely to inflate coverage.

## macOS: initial inventory

| Domain | Scope and evidence | Misinterpretations to avoid |
| --- | --- | --- |
| System and volumes | `sw_vers`, `uname -m`, `id -u`, `df -h`; volumes, architecture, visible free space | Do not add APFS snapshots, clones, or purgeable space as ordinary files |
| GUI applications | `/Applications`, `~/Applications`; `/System/Applications` as a system baseline; LaunchServices/Spotlight and receipts as needed | Indexes may be incomplete or stale; a receipt does not prove an installation still exists |
| Command entry points | Current PATH components, `/opt/homebrew/bin`, `/usr/local/bin`, `~/.local/bin`, user bin directories, discovered manager shims | Current shell PATH, configuration declarations, and GUI environments can differ |
| Package managers | Existing ARM/Intel Homebrew, MacPorts, Nix, npm/pnpm/yarn, pipx/uv/conda sources | An absent manager may leave directories; matching names across sources do not automatically mean duplicates |
| Language environments | Node, Python, Java, Go, Rust, Ruby, PHP/.NET runtimes, version managers, global tools | Separate project dependencies from global tools; old runtimes may serve active projects |
| Editors | VS Code variants, Cursor, Windsurf, Trae, Zed, JetBrains installations and extension metadata | Architecture-specific extensions, bundled servers, and remote servers can be legitimate |
| AI tools | Agents, model clients, proxies/routers, MCP, IDE extensions, models, download caches | Frontends, proxies, plugins, and runtimes have different roles; do not classify all as duplicates |
| Background items | LaunchAgents/Daemons, current-user services, cron, login items, accessible processes/listening ports | Configured is not loaded; loaded is not running; listening is not proof of public reachability |
| Tool data | Application Support, Caches, Logs, Containers/Group Containers, hidden tool directories | Associate opaque sandbox/App Group identifiers using bundle IDs or metadata |
| Containers/virtualization | Docker/Podman/Colima/OrbStack/Lima, VM disks, images, volumes | Do not start engines; logical disk size differs from allocated storage; volumes may hold business data |
| Installation/backup leftovers | Old versions, updater payloads, backups, partial downloads, broken links, stale service references within known tool roots | Backups may contain unique history; do not automatically inspect personal Downloads/Documents contents |

### Connect applications and CLIs

- Read bundle ID, version, and build from `Contents/Info.plist` using system `plutil` or an existing plist parser. Do not launch an application or its bundled CLI to obtain a version.
- Spotlight `kMDItemLastUsedDate` and use counts, where available, are activity signals affected by indexing, synchronization, migration, and privacy settings. Creation time, mtime, atime, and installation time are not last-use timestamps.
- Use `type -a <name>` / `command -v <name>` for candidates and follow symlink chains to real targets. Recognize aliases, functions, shims, wrappers, and loops. Output only relevant redacted definitions, not entire shell configurations.
- `test -e` cannot distinguish inaccessible from missing. Preserve parent-directory access errors and verify real paths before declaring broken links or missing files. Resolution precedence applies only to the observed environment.
- Check both Homebrew roots if present, user managers, and bundled distributions. Deduplicate by real files/installation sources; several symlinks to one target count as one physical installation.
- `pkgutil --pkgs` lists installation receipts; inspect relevant receipts for candidates. Never use `pkgutil --forget`. The absence of an uninstall receipt does not establish that an application remains installed.

### Packages and dependencies

For Homebrew queries, use explicit brew paths with `HOMEBREW_NO_AUTO_UPDATE=1` and `HOMEBREW_NO_ANALYTICS=1`. Never run update, upgrade, cleanup, autoremove, doctor repairs, or fetch. Avoid `outdated`/remote queries that may refresh API metadata; compare local versions with official upstream pages separately.

Possible sources include `list --versions`, `list --cask --versions`, `info --json=v2 --installed`, `leaves`, `uses --installed <formula>`, and local receipts, depending on installed-version support. Leaves/no reverse dependencies only means the manager knows no dependents; scripts, IDEs, projects, and callers outside PATH may still depend on the package. Distinguish keg-only, pinned, versioned formulae, and old kegs. If a query requires cache writes and fails, record the restriction and read accessible receipts; do not change permissions and retry.

| Ecosystem | Preferred evidence | Investigation cautions |
| --- | --- | --- |
| Node | `package.json` under known npm roots; `npm ls -g --depth=0 --json` and pnpm/yarn global inventories when safe and supported | Set `npm_config_update_notifier=false` and `npm_config_ignore_scripts=true`; avoid npx, dlx, install, and corepack downloads; Node versions under volta/fnm/nvm/asdf/mise may each have global packages |
| Python | Distribution metadata for discovered interpreters, `pyvenv.cfg`, pipx/uv tool metadata, conda environment registrations and `conda-meta` | Do not traverse all project sources; list project environments only within explicit scope; do not call every venv library unused; imports and unfamiliar interpreters may execute initialization, so prefer static dist-info reads |
| Rust/Go | Cargo `.crates.toml`/`.crates2.json` and bin directories; Go bin and available build metadata | Separate caches, registries, build artifacts, and installed tools; never use cargo install, go run, or go install |
| Java/Ruby/.NET/PHP | Discovered JDKs, SDK/version managers, local package registrations, gem/bundler/composer global metadata | Establish architecture/version from paths and receipts; avoid commands that restore packages, load plugins, or activate environments |
| Nix/MacPorts | Local profiles/receipts and installed-package queries | Do not run garbage collection, repairs, upgrades, or automatic downloads; lack of profile references does not establish removability |

Use only existing managers that can be queried safely. Tools such as uv may create caches or locks. When behavior is uncertain, read existing metadata instead of redirecting to a new cache to disguise writes.

### AI agents

Discover by categories and observed paths, not a closed product list. Search leads include Codex, Claude, OpenCode, OpenCodex, Cline/Roo/Kilo, Crush, Pi, Aider, Continue, Cursor, Windsurf, Trae, Antigravity, Gemini, Copilot, and lobster-related nicknames such as OpenClaw, PetClaw, Clawdbot, and Moltbot. If a nickname is ambiguous, report candidates and the matching evidence.

For each candidate, connect:

`Application/package source -> CLI and real path -> configuration/state/cache directories -> plugin/proxy references -> service/process/port -> activity evidence`

- Distinguish similar names such as OpenCode and OpenCodex; directory names alone do not establish product identity.
- Inspect local package names, distributors, bundle IDs, service targets, and metadata. Never execute unfamiliar startup targets to verify them.
- If a main application is absent, investigate whether extensions, user data, standalone CLIs, or service references still have independent consumers.
- Proxies, MCP servers, and bridges may serve other active clients. Extract executable targets and reference relationships only; hide tokens, environment values, query strings, and private remote identifiers.
- Report downloaded models, LoRAs, embeddings, vector stores, and conversation state separately. If contents were not inspected, state that only directories/metadata were checked; do not claim backups are identical or conversations have no value.
- Desktop, standalone CLI, bundled alpha, and fork versions are not automatically comparable across channels. The host controls embedded-version upgrades.

### Background items and system integrations

Inspect accessible `~/Library/LaunchAgents`, `/Library/LaunchAgents`, and `/Library/LaunchDaemons`. Parse only relevant Label, launch targets in Program/ProgramArguments, RunAtLoad, KeepAlive, and log paths; redact before displaying. Use `launchctl print gui/<uid>/<label>` or the relevant known domain for candidate state. Treat target existence, loaded state, and running state as separate observations.

Where permitted, inventory processes with `ps -axo pid,ppid,comm` without full arguments. Read and redact arguments only for necessary candidates. Use `lsof -nP -iTCP -sTCP:LISTEN` or an equivalent existing tool for listeners, avoiding unrelated remote information. Never kill processes or probe network services. Query cron only with `crontab -l`, hiding sensitive command values.

Include visible login items, SMAppService, system/network extensions, VPN/proxy components, privileged helpers, QuickLook, Finder plugins, and old drivers. Read-only inventories such as `systemextensionsctl list` may help. Background-task data may be restricted or contain private paths; extract relevant candidates only. Do not use uninstall or registration operations to verify state.

### Storage and data classification

- Start with allocated-storage measurements such as `du -sk <path>` on identified tool roots, then inspect only the largest candidate subdirectories. Use supported flags, avoid following symlink trees or crossing network volumes, and treat errors/timeouts as partial results rather than zero sizes.
- Inspect existing `.cache`, package/build caches, editor extensions, SDKs/simulators, Xcode DerivedData/Archives/DeviceSupport, container, VM, and model directories as relevant. Never trigger cache prune, model deletion, or simulator cleanup.
- Classify each directory as rebuildable cache, installation payload, configuration, user assets, backup, or unknown. Explain whether rebuilding requires downloads, login, payment, or loss of offline availability.
- Hard links, APFS clones, sparse files, and nested roots can cause double counting. State the measurement basis and uncertainty; give individual values rather than a reclaimable total when accounting is unreliable.

## Linux: adapt to the distribution

Cover `/usr/share/applications`, `~/.local/share/applications`, `/opt`, `/usr/local`, `~/.local/bin`, PATH, XDG data/cache, and existing language managers. Query local dpkg/rpm/pacman metadata; separately associate Flatpak/Snap/AppImage installations with user data. Do not run apt update, dnf update checks, automatic cleanup, or package transactions.

Inspect definitions and states of systemd user/system units, timers, cron, autostart, and relevant listening processes; never start/stop/enable/disable them. Do not call essential/base packages or automatic dependencies useless. Explicitly bound scope for other users, container hosts, and remote environments.

## Windows: adapt to available tools

Cover HKCU/HKLM uninstall registrations (32/64-bit), local Store/Appx inventories, Program Files, identified application roots under LocalAppData, user bin directories, PATH, and local metadata from existing Scoop/Chocolatey/language managers. Avoid `Win32_Product`, which may trigger MSI self-repair, and queries that refresh sources, accept agreements, or download indexes. Prefer local inventories; do not automatically invoke winget.

Distinguish receipts, portable apps, WindowsApps aliases, junctions, and real installations. Inspect user/system startup items, services, scheduled tasks, and relevant processes without changing registry entries or tasks. For WSL, inspect visible distribution registrations and host-side file metadata only; do not start stopped distributions or enter other users' directories for the audit. Logical VHDX size is not reclaimable storage.
