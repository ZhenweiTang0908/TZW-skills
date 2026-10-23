---
name: computer-software-audit
description: Perform a deep, read-only audit of locally installed software, CLI tools, AI coding agents, package libraries, runtimes, background services, duplicate installations, and leftover data. Use when the user wants to inspect computer clutter, unused-tool candidates, or potential disk savings; never uninstall, clean, disable, or repair anything.
---

# Computer Software Audit (Read Only)

Explain what is installed, its installation sources, which copy is selected, available usage evidence, dependencies, leftovers, and candidates worth reviewing. **Write user-facing audit results in Chinese by default, unless the user explicitly requests another language.** These English instructions do not change that output default. Focus on macOS; adapt other systems using the references.

## Read-only boundaries

- Investigate, analyze, and recommend only. Never delete, uninstall, clear caches, update, repair, disable services, terminate processes, or modify PATH, permissions, configuration, or package-manager state. Permission to scan is not permission to clean. If the user later requests changes, leave this read-only workflow and handle those separately under the new explicit authorization.
- Do not install scanning tools or dependencies, or launch audited applications, agents, model services, container engines, or unknown executables. Prefer package metadata for versions; do not execute suspicious programs just to obtain their versions.
- Do not use `sudo`, request Full Disk Access, or change privacy settings. Record access restrictions and continue with accessible surfaces; do not bypass a denial through another route.
- Read only configuration fields needed to establish findings. Never dump credentials, environment variables, authentication files, browser profiles, or chat/agent session contents. Process arguments, service definitions, container mounts, and connection addresses can contain secrets; redact before displaying them.
- Do not read shell history, browsing history, chats, email, Keychain, or project source code to infer usage unless the user explicitly adds that scope. Depth means coverage and cross-checking, not unrestricted reading of personal files.
- Deliver results in the conversation by default. Write a report file only when requested, in the task workspace or a user-designated location, never inside audited software directories. Even safe reads may enter operating-system access logs; do not promise byte-for-byte unchanged machine state.

## Workflow

1. **Establish scope.** Identify the OS, architecture, user directory, current time, and storage volumes using minimal existing tools. Then read the relevant platform section of [references/scan-surfaces.md](references/scan-surfaces.md). A broad audit includes visible system installations and the current user's environment. Exclude other users' private directories, remote mounts, and external drives unless specified.
2. **Inventory broadly before investigating deeply.** Maintain a coverage matrix with domain, inspected locations/sources, counts or summaries, status (complete/partial/restricted/not applicable), and limitations. Do not stop after finding several AI tools. Default coverage includes applications, CLI/PATH, package managers, language environments, AI tools, editor extensions, background items, and large tool-data directories.
3. **Correlate candidate evidence.** For duplicates, orphans, unusual storage, old installations, and background items, connect installation receipts, real paths, symlinks, dependencies, activity signals, and directory sizes. Apply [references/evidence-and-report.md](references/evidence-and-report.md), preserving uncertainty. Treat pasted historical reports as leads, not current scan facts.
4. **Deepen only around candidates.** Expand storage measurements within identified software roots and investigate relevant dependencies and background references. Do not recursively traverse the entire filesystem or home directory without bounds. Batch reads, set timeouts/output limits for slow commands, and retain errors and truncation status. Parallelize independent reads without running several heavy disk traversals simultaneously.
5. **Verify version claims.** Separate local facts from upstream facts. Before claiming outdated, unmaintained, or latest, consult official release pages or package registries and record the date, platform, channel, and source links. Different version numbers or old release dates alone do not establish obsolescence. When offline, report local versions with upstream verification unavailable. Never upload local configuration or the full software inventory.
6. **Deliver a reviewable report.** Cover valuable candidates, duplicate sources, background items, dependencies, and coverage gaps using the reporting reference. Stop after reporting; do not execute recommendations. State that no cleanup or changes were performed.

## Execution decisions

- Reuse system tools and existing package managers. Avoid queries that automatically update, migrate, or refresh caches; consult the scanning reference for safeguards. Prefer an existing task `.venv` for Python helpers; do not create an environment for the audit.
- Inspect both system and user installations. One tool may exist in `/Applications`, user Applications, Homebrew, npm, pipx/uv, standalone binaries, and application bundles. Embedded runtimes often provide legitimate isolation; do not recommend removing their internal files.
- Explain every potentially-unused assessment with confirmed installation/leftover facts and available activity or dependency evidence. Without usage records, report usage unknown and user confirmation needed, not invented frequencies or last-use dates.
- Assign confidence to specific claims: a broken symlink may be confirmed while abandonment remains unknown. Do not turn one high-confidence fact into a high-confidence cleanup conclusion.
- Keep depended-on, active, or user-asset-containing items as review candidates. Assets include sessions, databases, vector indexes, models, browser workspaces, container volumes, and backups. Large does not mean disposable.
