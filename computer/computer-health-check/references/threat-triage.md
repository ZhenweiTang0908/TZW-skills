# Threat and Suspected Malware Triage

Goal: spot anything that **could** be malware, adware, a backdoor or unwanted remote control, rate each item honestly, and tell the user how to confirm it. This is a triage, not an antivirus scan: say so in the report, and never declare a machine "clean" — only "no suspicious signs found in the checked areas".

## Boundaries specific to this section

- Do not delete, quarantine, unload, disable or "fix" anything, even when an item looks clearly malicious. Removing persistence the wrong way can break the system or tip off an attacker; give the user steps and let them decide.
- Do not run, open or `strings`-dump a suspicious binary or script. Reading a small script file (shell/Python/AppleScript under ~50 KB) that a launchd job runs is allowed so the user can see what it does; redact secrets in what you quote.
- Do not upload files, hashes, paths or process lists to VirusTotal or any other service on your own. You may compute a SHA-256 (`shasum -a 256 <file>`) and suggest the user look it up, or look it up only after they agree.
- Do not read browser history, cookies, keychains, mail or chat to hunt for infections.

## What the `threats` section collects

| Check | Why it matters |
|---|---|
| launchd agents/daemons with program path, signature, payload and flags | The most common macOS persistence. Malware usually installs a LaunchAgent. |
| Running executables in odd places, or unsigned/ad-hoc outside dev folders | Malware often runs from temp, `/Users/Shared`, Downloads, or hidden folders, unsigned. |
| Unsigned/ad-hoc apps in /Applications | Not malicious by itself, but these bypass Apple's notarization checks. |
| Kernel and system extensions | Network filters and kernel code can see or redirect all traffic. |
| Authorization plugins | Run inside the login window; rare and powerful. |
| Configuration profiles | Can force proxies, certificates, DNS — a classic adware/MITM move. |
| Proxy, DNS, /etc/hosts | Traffic redirection. |
| Established outbound connections by process | Unknown processes talking out persistently. |
| Crontab and shell startup hooks (only line numbers of risky patterns) | Alternative persistence: `curl … | sh`, base64 decoding, `/dev/tcp`. |
| Browser extensions (names only) | Adware and data-stealing extensions are the most common real-world "virus" on Macs. |
| XProtect version | Apple's built-in signature scanner; old means Apple's protection is out of date. |

## Rating each item

Use three levels and always give the reason:

- **可疑 (suspicious)** — needs the user's attention now. Any of:
  - persistence or running code from temp, `/Users/Shared`, Downloads, a hidden folder, or with a random-looking name
  - interpreter-launched job whose payload has download/obfuscation patterns (`curl|sh`, `base64 -d`, `eval`, `/dev/tcp`, `osascript -e`), or the payload sits in an odd place
  - unsigned/ad-hoc binary that is persistent or talks to the network and that the user does not recognise
  - a configuration profile, proxy, DNS server or hosts entry the user did not set
  - a browser extension the user does not recognise, especially one with a generic name ("PDF Converter", "Search Helper"), or a search/homepage hijacker
  - authorization plugins or kernel extensions from unknown vendors
- **需确认 (needs confirmation)** — plausible but unusual: a self-made or third-party script run by python/sh at login, a leftover job whose program is missing, an empty plist, an unsigned app from a small developer, an outbound connection from an app the user has not opened.
- **正常 (normal)** — signed by a known vendor and matches software the user uses (Google/Microsoft updaters, Zoom, Arturia, OrbStack, a VPN or proxy the user installed), local proxies the user runs (127.0.0.1 ports belonging to their proxy app), dev builds inside project folders.

Do not raise the level just because something is unsigned or ad-hoc: Homebrew, pip/npm binaries, Godot exports and many open-source apps are ad-hoc signed. Do not lower it just because the name looks familiar: malware imitates names like `com.apple.*`, `com.google.*`, `update`, `helper`. Check that the signing team matches the vendor the name claims (`codesign -dvv <path>`: Authority and TeamIdentifier).

## Digging into a flagged item

1. Identify the owner: plist label and path, program path, signing authority/team, install date (`stat -f '%SB' <file>`), and whether a matching app exists in /Applications.
2. For interpreter jobs, read the script (within the limits above) and summarise what it does in one or two sentences.
3. Check activity: is it running (`launchctl list | grep <label>`), what it has open (`lsof -p <pid> | head`), and its network connections (`lsof -nP -a -p <pid> -i`).
4. Ask the user whether they installed or recognise it. Their answer is evidence; record it.

## Recommending next steps (the user acts)

- For a confirmed-unwanted LaunchAgent: tell the user to quit the related app, then `launchctl bootout gui/$(id -u) <plist>` and move the plist and its program to the Trash (not delete), or remove it in System Settings → General → Login Items & Extensions. Offer to run the exact commands only after they confirm each one.
- For browser extensions: remove from the browser's extensions page; reset search engine and homepage.
- For profiles, proxies, DNS: remove in System Settings → Privacy & Security → Profiles / Network.
- For anything rated suspicious that the user does not recognise, recommend a second opinion with a reputable scanner (Malwarebytes for Mac) and Objective-See tools (KnockKnock for persistence, LuLu for outbound connections), and changing important passwords from another device if credentials may be exposed.
- If XProtect is outdated, suggest enabling automatic security updates.
