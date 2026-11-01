# Evidence, Assessment, and Reporting

## Candidate records

For meaningful findings, record product/package identity, source and version, architecture/channel, real paths and aliases, directory classification and size measurement basis, PATH precedence, reverse dependencies/service/configuration references, activity signals, specific conclusions and confidence, remaining unknowns, and questions for the user. Do not produce an exhaustive row for every system library; separate coverage summaries from detailed candidate records.

Label evidence types:

- **Direct facts:** Local receipts, package metadata, accessible files/broken links, and current process or service state. Record observation time; a snapshot is not historical usage.
- **Signals:** mtime, Spotlight usage dates, cache updates, and old directory names. These justify investigation, not a conclusion of disuse.
- **Inferences:** Explanations supported by independent facts, with scope and counterevidence stated.
- **Unknown/restricted:** Permissions, missing indexes, stopped services, uninspected projects, or failed queries. Do not translate these into not installed, never used, or nonexistent.

## Assessment rules

| Candidate | Supported conclusion | Limits and counterevidence |
| --- | --- | --- |
| Broken CLI symlink | The target is missing, after establishing access to its location | Does not prove other installations are absent or related user data is worthless |
| Data without a visible app | No corresponding host was found in inspected application locations; data remains | Portable installations, remote extensions, standalone CLIs, or planned reinstalls may explain it; label suspected leftovers |
| Multiple copies of one tool | Matching product identities and distinct real paths/receipts establish multiple sources | Several entry points to one target are not multiple copies; architecture, channel, and host isolation may justify copies |
| Functional overlap | Several tools serve similar purposes | Not a duplicate installation; retention depends on the user's needs |
| No reverse dependencies | The package manager records no dependents | External scripts or projects may still call it; do not call removal safe |
| Old version/unmaintained | Official upstream, platform, channel, and release dates have been verified | Evaluate forks, prereleases, pinned enterprise versions, and embedded distributions separately; old does not mean unused |
| Large directory/cache | Size is measured and content categories identified | Databases, state, or unique downloads prevent treating the entire directory as rebuildable cache or reclaimable space |
| Stale background definition | Its target is confirmed missing while the definition remains | Report loaded state separately; unfamiliar names do not establish malware or abandonment |
| Observed activity | A process, service, recent write, or valid invocation reference exists | Background tasks can cause recent writes; no current process does not prove disuse |
| Backup directory | Backup naming/structure and storage usage are observed | Without content inspection, equivalence to current data is unknown; do not hash all private files to compare backups |

Assess installed, running, recently used, removable, and potentially reclaimable separately. Confirmed installation conflicts or leftovers do not establish that the user should discard them.

## Storage and priorities

- Directory usage is not reclaimable space. Report approximate storage associated with candidates. Estimate conditional potential savings only when scope is clear, data is rebuildable, and counting does not overlap.
- Deduplicate canonical real paths. Do not add a child already counted in its parent; check overlaps between package-manager inventories and application bundles too.
- If hard links, shared clone blocks, or virtual disks prevent reliable addition, say so. Distinguish decimal GB from GiB; explain the measurement basis when retaining tool output units.
- Prioritize evidence strength, space/background resources/maintenance burden, dependency impact, and asset risk together. Do not rank solely by size. Critical system components, active proxies, and backups with unique history are not high-confidence cleanup candidates.
- Recommend review steps such as confirming purpose, checking backups, verifying dependencies, or choosing an installation source. Do not generate executable bulk deletion, uninstall, or service-disabling scripts.

## Default report structure

Write the report in Chinese unless the user requests another language. Lead with the key findings and the fact that no modifications were performed. Organize the following according to information volume; small audits may combine sections, but deep audits must retain coverage and limitations.

1. **Scope and coverage:** Local time, OS/architecture, user scope, each domain's complete/partial/restricted/not-applicable status and reason. Identify uninspected locations; never claim a full-disk audit when coverage is incomplete.
2. **Priority review table:** Item, confirmed facts, real paths, source/version, size, activity/dependency evidence, assessment and confidence, and what the user should confirm. Use absolute-path links; redact sensitive paths without inventing unusable links.
3. **Duplicates and conflicts:** Separate multiple installations of one product, actual PATH resolution, architecture/channel differences, and functional overlap. Highlight cases that select an older copy unexpectedly.
4. **AI agents and less-visible installations:** Connect desktop apps, CLIs, extensions, proxies, MCP, and model data. Explain nickname matching, including lobster-related tool names; do not limit findings to Applications.
5. **Packages, runtimes, and large data:** Separate manually installed tools, dependency libraries, project environments, caches, assets, and unknowns. Explain dependency limits and storage measurement.
6. **Background items:** Targets, existence, loaded/running states, associated tools and ports, and missing evidence. Do not expose credentials or unrelated personal network activity.
7. **Review order and limitations:** Offer a practical sequence of user decisions, identify items requiring usage confirmation, unverified versions, and blind spots. Stop at the report.

For historical comparisons, classify additions/removals/changes only where sources, measurement bases, and states are comparable. Historical version numbers and latest-version claims do not become current facts automatically.

## Offline scenario checks

When creating or updating this skill, use these fictional scenarios to check decisions. Do not scan the real host merely to validate the skill:

- Codex has npm and Homebrew installations plus a desktop-embedded alpha: report sources, channels, and PATH; do not treat them as one comparable version sequence or recommend removing embedded files.
- Cursor.app is missing and its CLI link is broken, but user data has recent writes: confirm the broken link and retain the counterevidence instead of declaring the entire tool abandoned.
- An old runtime appears in brew leaves but a background script references it: record the dependency and lower its review priority; do not call it safe to remove.
- A parent is 5 GiB, its child is 3 GiB, and a symlink points to the parent: do not report a 13 GiB total.
- `ps` is denied, Spotlight has no date, and brew queries fail: report limitations, not no processes, never used, or no outdated packages.
- A lobster-related fork reports an old version: identify its distributor before comparing it with a different upstream release channel.
- Process arguments or a LaunchAgent contain an API key: retain only redacted targets and relationships, never raw arguments in the report.
