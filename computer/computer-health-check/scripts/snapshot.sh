#!/usr/bin/env bash
# Read-only macOS health snapshot. No sudo, no network, no changes.
# Usage: snapshot.sh [section...]   sections: basics cpu memory thermal power disk background dev schedules security threats crashes
# With no arguments every section runs. Output is plain text grouped by "## <section>".
set -u
export LC_ALL=C

limit() { # limit <seconds> <cmd...>: run with a time cap when timeout is available
	local s=$1; shift
	if command -v timeout >/dev/null 2>&1; then timeout "$s" "$@"; else "$@"; fi
}
hr() { printf '\n## %s\n' "$1"; }

basics() {
	hr basics
	echo "date: $(date '+%Y-%m-%d %H:%M:%S %Z')"
	echo "model: $(sysctl -n hw.model 2>/dev/null)"
	echo "chip: $(sysctl -n machdep.cpu.brand_string 2>/dev/null)"
	echo "cores: $(sysctl -n hw.ncpu) (perf $(sysctl -n hw.perflevel0.physicalcpu 2>/dev/null || echo ?), eff $(sysctl -n hw.perflevel1.physicalcpu 2>/dev/null || echo ?))"
	echo "memory: $(( $(sysctl -n hw.memsize) / 1073741824 )) GB"
	echo "os: $(sw_vers -productName) $(sw_vers -productVersion) ($(sw_vers -buildVersion))"
	echo "uptime: $(uptime)"
}

cpu() {
	hr cpu
	# 第二次采样才是真实的瞬时 CPU 占用
	limit 15 top -l 2 -s 2 -o cpu -n 20 -stats pid,ppid,command,cpu,mem,time,state | awk '/^PID/{n++} n==2'
	echo
	echo "# long-running CPU hogs (cpu time > 1h, %cpu > 20), with start time and command"
	ps -Ao pid=,ppid=,pcpu=,time=,lstart=,command= -r | awk '
		{ split($4,t,/[:.-]/); hours=0
		  if ($4 ~ /-/) hours=t[1]*24+t[2]; else if (length(t)>=3) hours=t[1];
		  if ($3+0 > 20 && hours+0 >= 1) print }' | cut -c1-260 | head -20
}

memory() {
	hr memory
	memory_pressure 2>/dev/null | grep -E "System-wide memory free percentage|Pages (free|purgeable|compressed)|Swapins|Swapouts"
	echo "swap: $(sysctl -n vm.swapusage)"
	top -l 1 -n 0 | grep -E "^PhysMem|^VM:"
	echo
	echo "# top resident memory (MB)"
	ps -Ao pid=,rss=,command= -m | head -15 | awk '{ printf "%7s %8.0f  ", $1, $2/1024; $1=$2=""; print substr($0,3) }' | cut -c1-200
}

thermal() {
	hr thermal
	pmset -g therm 2>/dev/null
	echo
	echo "# thermal pressure (from powermetrics-free sources)"
	limit 5 log show --last 30m --style compact --predicate 'subsystem == "com.apple.thermalmonitord" OR eventMessage CONTAINS[c] "thermal pressure"' 2>/dev/null | grep -v " log\[" | tail -8
	echo
	echo "# signals that usually mean heat"
	ps -Ao pcpu=,command= | awk '
		/kernel_task/ && $1>30 {print "kernel_task " $1 "% (often the OS throttling to cool down)"}
		/WindowServer/ && $1>30 {print "WindowServer " $1 "% (display/GPU work: external monitors, animations, many windows)"}
		/mds_stores|mdworker|mds / && $1>20 {print "Spotlight " $1 "% (" $2 ")"}
		/backupd/ && $1>10 {print "Time Machine backupd " $1 "%"}
		/photoanalysisd|mediaanalysisd/ && $1>10 {print "Photos analysis " $1 "%"}
		/softwareupdated|com.apple.MobileSoftwareUpdate/ && $1>10 {print "software update " $1 "%"}'
	echo "displays: $(system_profiler SPDisplaysDataType 2>/dev/null | grep -c 'Resolution:')"
}

power() {
	hr power
	pmset -g batt 2>/dev/null
	system_profiler SPPowerDataType 2>/dev/null | grep -E "Cycle Count|Condition|Maximum Capacity|Charging:|Connected:|Wattage|Full Charge Capacity" | sed 's/^ *//'
	echo
	echo "# sleep blockers"
	pmset -g assertions 2>/dev/null | grep -E "PreventUserIdleSystemSleep|PreventSystemSleep|PreventUserIdleDisplaySleep|pid [0-9]+" | grep -vE " 0$" | head -15
	echo "lowpowermode: $(pmset -g | awk '/lowpowermode/{print $2}')"
}

disk() {
	hr disk
	df -h / /System/Volumes/Data 2>/dev/null
	echo
	echo "local snapshots: $(tmutil listlocalsnapshots / 2>/dev/null | grep -c com.apple)"
	echo "# disk throughput (3 samples, 1s)"
	limit 6 iostat -d -c 3 -w 1 2>/dev/null
}

background() {
	hr background
	echo "# third-party launchd jobs currently running (pid != -)"
	launchctl list 2>/dev/null | awk 'NR>1 && $1!="-" && $3 !~ /^com\.apple\./ && $3 !~ /^application\.com\.apple\./' | head -30
	echo
	echo "# user LaunchAgents"
	ls ~/Library/LaunchAgents 2>/dev/null
	echo "# system LaunchAgents/Daemons (third-party)"
	ls /Library/LaunchAgents /Library/LaunchDaemons 2>/dev/null
}

# 只按可执行文件名匹配，避免参数里的 bundle、container 之类的词误中
DEV_RE='^(godot.*|node|python[0-9.]*|ruby|java|gradle.*|deno|bun(\.exe)?|esbuild|tsc|chrome-headless-shell|qemu.*|cargo|rustc|xcodebuild|simctl|uvicorn|gunicorn|php|dotnet|go|air|hugo|jekyll|redis-server|postgres|mysqld|mongod|nginx|caddy)$'
is_dev() { # is_dev <comm path>
	local base=${1##*/}
	[[ "$(tr '[:upper:]' '[:lower:]' <<<"$base")" =~ $DEV_RE ]]
}
app_internal() { # runtimes bundled inside desktop apps (Codex, Electron helpers) are not the user's dev services
	case "$1" in /Applications/*|"$HOME"/Applications/*|"$HOME"/Library/Application\ Support/*) return 0;; esac
	return 1
}
cwd_of() { lsof -a -p "$1" -d cwd -Fn 2>/dev/null | sed -n 's/^n//p' | sed "s#^$HOME#~#"; }
redact() { sed -E 's/((token|key|secret|password|passwd|auth)[^ =:]*[=: ]+)[^ ]+/\1REDACTED/Ig'; }

dev() {
	hr dev
	echo "# running dev services (listening): ports | pid | ppid | uptime | cwd | command"
	local listed=" "
	while read -r pid ports; do
		comm=$(ps -o comm= -p "$pid" 2>/dev/null) || continue
		cwd=$(cwd_of "$pid")
		# 开发工具，或者工作目录在项目文件夹里的任何监听进程
		if is_dev "$comm" || [[ "$cwd" == "~/Code/"* || "$cwd" == "~/Projects/"* || "$cwd" == "~/Documents/"* ]]; then
			listed+="$pid "
			printf '%s | %s | %s | %s | %s | %s\n' "$ports" "$pid" "$(ps -o ppid= -p "$pid" | tr -d ' ')" \
				"$(ps -o etime= -p "$pid" | tr -d ' ')" "${cwd:-?}" "$(ps -o args= -p "$pid" | redact | cut -c1-140)"
		fi
	done < <(lsof -nP -iTCP -sTCP:LISTEN 2>/dev/null | awk 'NR>1 {a=$9; sub(/.*:/,"",a); p[$2]=p[$2] (index(p[$2]," " a ",")?"":" " a ",")} END {for (k in p) {s=p[k]; gsub(/^ | ,$/,"",s); sub(/,$/,"",s); print k, s}}')
	echo
	echo "# other dev processes (no listening port): pid | ppid | cpu | uptime | cwd | command   (ppid 1 = orphaned)"
	local internal=0
	while read -r pid comm; do
		[[ "$listed" == *" $pid "* ]] && continue
		is_dev "$comm" || continue
		if app_internal "$comm"; then internal=$((internal+1)); continue; fi
		printf '%s | %s | %s%% | %s | %s | %s\n' "$pid" "$(ps -o ppid= -p "$pid" | tr -d ' ')" "$(ps -o pcpu= -p "$pid" | tr -d ' ')" \
			"$(ps -o etime= -p "$pid" | tr -d ' ')" "$(cwd_of "$pid")" "$(ps -o args= -p "$pid" | redact | cut -c1-140)"
	done < <(ps -Ao pid=,comm=) | head -30
	echo "(runtimes bundled inside apps, e.g. Codex/Electron helpers, not listed: $(ps -Ao comm= | while read -r c; do is_dev "$c" && app_internal "$c" && echo; done | wc -l | tr -d ' '))"
	echo
	echo "# headless/test runners (any parent)"
	ps -Ao pid=,pcpu=,etime=,command= | grep -Ei -- "--headless|--script |pytest|jest|vitest|playwright" | grep -v grep | redact | cut -c1-240 | head -20
	echo
	echo "# all listening TCP ports"
	lsof -nP -iTCP -sTCP:LISTEN 2>/dev/null | awk 'NR==1 || !seen[$1 $9]++' | head -30
}

schedules() {
	hr schedules
	echo "# cron and at"
	crontab -l 2>/dev/null | grep -vE '^\s*(#|$)' | redact | sed 's/^/user crontab: /' || true
	crontab -l >/dev/null 2>&1 || echo "user crontab: none"
	grep -vE '^\s*(#|$)|^(SHELL|PATH|HOME)=' /etc/crontab 2>/dev/null | sed 's/^/\/etc\/crontab: /'
	echo "at jobs: $(atq 2>/dev/null | wc -l | tr -d ' ')"
	ls /usr/local/etc/periodic/*/ 2>/dev/null | sed 's/^/custom periodic: /'
	echo
	echo "# launchd jobs with a trigger: label | trigger | state | plist"
	local labels=" "
	for f in ~/Library/LaunchAgents/*.plist /Library/LaunchAgents/*.plist /Library/LaunchDaemons/*.plist; do
		[[ -e "$f" ]] || continue
		label=$(plutil -extract Label raw "$f" 2>/dev/null) || label=$(basename "$f" .plist)
		labels+="$label "
		t=""
		v=$(plutil -extract StartInterval raw "$f" 2>/dev/null) && t+="every ${v}s; "
		v=$(plutil -extract StartCalendarInterval json -o - "$f" 2>/dev/null) && t+="calendar $(tr -d ' \n' <<<"$v"); "
		plutil -extract WatchPaths raw "$f" >/dev/null 2>&1 && t+="on file change; "
		plutil -extract QueueDirectories raw "$f" >/dev/null 2>&1 && t+="on queue dir; "
		[[ "$(plutil -extract RunAtLoad raw "$f" 2>/dev/null)" == true ]] && t+="at login/boot; "
		plutil -extract KeepAlive raw "$f" >/dev/null 2>&1 && [[ "$(plutil -extract KeepAlive raw "$f" 2>/dev/null)" != false ]] && t+="keep alive; "
		t=${t%; }
		if [[ "$f" == /Library/LaunchDaemons/* ]]; then
			# 系统域的任务普通用户用 launchctl 看不到，改为看它的程序是否在运行
			prog=$(plutil -extract Program raw "$f" 2>/dev/null || plutil -extract ProgramArguments.0 raw "$f" 2>/dev/null)
			pid=$([[ -n "$prog" ]] && pgrep -f -- "$prog" | head -1)
			state="system job, ${pid:+running pid $pid}"; [[ -z "$pid" ]] && state+="not running"
		else
			state=$(launchctl list 2>/dev/null | awk -v l="$label" '$3==l {print ($1=="-" ? "loaded, idle" : "running pid " $1) ", last exit " $2}')
		fi
		printf '%s | %s | %s | %s\n' "$label" "${t:-on demand}" "${state:-not loaded}" "$f"
	done
	echo
	echo "# loaded third-party jobs without a plist in the standard folders (loaded from elsewhere)"
	launchctl list 2>/dev/null | awk 'NR>1 {print $3}' | grep -vE '^(com\.apple\.|application\.|com\.openssh\.)' | while read -r l; do
		[[ "$labels" == *" $l "* ]] || echo "$l"
	done | head -20
	echo
	echo "# agent automations (file names only)"
	for d in ~/.codex/automations ~/.claude/scheduled-tasks ~/.claude/scheduled_tasks; do
		[[ -d "$d" ]] || continue
		n=$(find "$d" -mindepth 1 -maxdepth 2 ! -name '.*' 2>/dev/null)
		echo "$d: ${n:-(empty)}"
	done
}

security() {
	hr security
	echo "filevault: $(fdesetup status 2>/dev/null)"
	echo "sip: $(csrutil status 2>/dev/null)"
	echo "gatekeeper: $(spctl --status 2>/dev/null)"
	echo "firewall: $(/usr/libexec/ApplicationFirewall/socketfilterfw --getglobalstate 2>/dev/null)"
	echo "auto updates: $(defaults read /Library/Preferences/com.apple.SoftwareUpdate AutomaticCheckEnabled 2>/dev/null || echo unknown)"
}

sig() { # sig <path>: one-line signature summary, without network checks
	local p=$1 out
	[[ -e "$p" ]] || { echo "missing"; return; }
	out=$(codesign -dvv "$p" 2>&1)
	if grep -q "not signed" <<<"$out"; then echo "UNSIGNED"
	elif grep -q "Signature=adhoc" <<<"$out"; then echo "ADHOC"
	else
		local auth team
		auth=$(grep -m1 "^Authority=" <<<"$out" | cut -d= -f2-)
		team=$(grep -m1 "^TeamIdentifier=" <<<"$out" | cut -d= -f2-)
		echo "${auth:-signed} [${team:-?}]"
	fi
}
odd_path() { # locations malware likes and legitimate software rarely runs from
	case "$1" in
		/tmp/*|/private/tmp/*|/private/var/tmp/*|/var/tmp/*) echo "temp dir";;
		/private/var/folders/*) echo "per-user temp";;
		/Users/Shared/*) echo "/Users/Shared";;
		"$HOME"/Downloads/*|"$HOME"/Desktop/*|"$HOME"/Documents/*) echo "user documents folder";;
	esac
}
dev_path() { # toolchains and project folders where unsigned/ad-hoc binaries are normal
	case "$1" in
		*/.venv/*|*/venv/*|*/node_modules/*|*/target/debug/*|*/target/release/*|*/builds/*|*/DerivedData/*) return 0;;
		"$HOME"/.cache/*|"$HOME"/.cargo/*|"$HOME"/.rustup/*|"$HOME"/.pyenv/*|"$HOME"/.nvm/*|"$HOME"/.local/*|"$HOME"/.bun/*|"$HOME"/.deno/*|"$HOME"/.go/*|"$HOME"/go/*) return 0;;
		"$HOME"/Code/*|"$HOME"/Projects/*|/opt/homebrew/*|/usr/local/Cellar/*|/usr/local/bin/*) return 0;;
	esac
	return 1
}
ext_name() { # ext_name <manifest.json>: resolve __MSG_key__ names through _locales
	local m=$1 n key loc d
	n=$(plutil -extract name raw "$m" 2>/dev/null)
	if [[ "$n" == __MSG_*__ ]]; then
		key=${n#__MSG_}; key=${key%__}; d=$(dirname "$m")
		loc=$(plutil -extract default_locale raw "$m" 2>/dev/null || echo en)
		for l in "$loc" en en_US; do
			[[ -f "$d/_locales/$l/messages.json" ]] || continue
			n=$(plutil -extract "$key.message" raw "$d/_locales/$l/messages.json" 2>/dev/null \
				|| plutil -extract "$(tr '[:upper:]' '[:lower:]' <<<"$key").message" raw "$d/_locales/$l/messages.json" 2>/dev/null) && break
		done
	fi
	echo "$n"
}

threats() {
	hr threats
	echo "# persistence: launchd plists outside Apple, with program signature"
	for f in ~/Library/LaunchAgents/*.plist /Library/LaunchAgents/*.plist /Library/LaunchDaemons/*.plist; do
		[[ -e "$f" ]] || continue
		prog=$(plutil -extract Program raw "$f" 2>/dev/null || plutil -extract ProgramArguments.0 raw "$f" 2>/dev/null)
		args=""; i=1
		while a=$(plutil -extract "ProgramArguments.$i" raw "$f" 2>/dev/null); do args+="$a"$'\n'; i=$((i+1)); done
		flags=""; payload=""
		add() { flags="${flags:+$flags, }$1"; }
		if [[ -z "$prog" ]]; then
			plutil -p "$f" 2>/dev/null | grep -q '=>' && add "no program key" || add "empty plist"
		else
			[[ -e "$prog" ]] || add "program missing (leftover)"
			o=$(odd_path "$prog"); [[ -n "$o" ]] && add "$o"
		fi
		case "$prog" in */sh|*/bash|*/zsh|*/python*|*/osascript|*/perl|*/ruby|*/node|*/bun*)
			add "runs via interpreter"
			# 解释器本身总是 Apple 签名的，真正要看的是它执行的脚本/程序；只显示路径，不显示参数内容
			# 整个参数是路径时直接取；内联命令（sh -c）里取被引号包住的路径
			paths=$( { grep '^/' <<<"$args"; grep -v '^/' <<<"$args" | grep -oE "['\"]/[^'\"]+['\"]" | tr -d "'\""; } \
				| grep -vE "^/dev/|token|key|secret|password" | head -2)
			while IFS= read -r p; do
				[[ -n "$p" ]] || continue
				payload="${payload:+$payload ; }$p"
				o=$(odd_path "$p"); [[ -n "$o" ]] && add "payload in $o"
				[[ -e "$p" ]] || add "payload missing"
			done <<<"$paths";;
		esac
		grep -Eq "curl|wget|base64|eval |/dev/tcp|nc -|osascript -e" <<<"$args" && add "download/obfuscation in args"
		[[ "$(basename "$f")" =~ ^[a-z0-9]{12,}\.plist$ || "$(basename "$f")" =~ ^com\.[a-z]{8,}\.plist$ ]] && add "random-looking name"
		printf '%s\n    -> %s | %s%s%s\n' "$f" "${prog:-?}" "$( [[ -n "$prog" ]] && sig "$prog" || echo n/a)" \
			"${payload:+ | runs: $payload}" "${flags:+ | FLAG: $flags}"
	done
	echo
	echo "# running executables: odd locations, or unsigned/ad-hoc outside dev folders"
	devcount=0
	while IFS= read -r exe; do
		[[ "$exe" == /* ]] || continue
		case "$exe" in /System/*|/usr/bin/*|/usr/sbin/*|/usr/libexec/*|/bin/*|/sbin/*|/Library/Apple/*|/System/Volumes/*) continue;; esac
		o=$(odd_path "$exe"); s=$(sig "$exe")
		if [[ -n "$o" ]]; then printf '%s | %s | %s\n' "$exe" "$s" "$o"
		elif [[ "$s" == UNSIGNED || "$s" == ADHOC ]]; then
			if dev_path "$exe"; then devcount=$((devcount+1)); else printf '%s | %s\n' "$exe" "$s"; fi
		fi
	done < <(ps -Ao comm= | sort -u)
	echo "(unsigned/ad-hoc binaries inside dev folders, normal for local builds: $devcount)"
	echo
	echo "# unsigned or ad-hoc apps in /Applications"
	for app in /Applications/*.app; do
		s=$(sig "$app"); [[ "$s" == UNSIGNED || "$s" == ADHOC ]] && echo "$app | $s"
	done
	echo
	echo "# kernel and system extensions (third-party)"
	kmutil showloaded --list-only 2>/dev/null | grep -v com.apple | grep -v "No variant"
	systemextensionsctl list 2>/dev/null | grep -E "^\s*\*|^\s+\*" | sed 's/^/  /'
	echo "# authorization plugins (non-default)"
	ls /Library/Security/SecurityAgentPlugins 2>/dev/null | grep -vx StagedPlugins
	echo "# configuration profiles"
	profiles list 2>/dev/null | grep -E "profileIdentifier|installed"
	echo
	echo "# network redirection"
	scutil --proxy 2>/dev/null | grep -E "(HTTP|HTTPS|SOCKS|ProxyAutoConfig)(Enable|Proxy|Port|URLString) " | sed 's/^ *//'
	networksetup -getdnsservers Wi-Fi 2>/dev/null | sed 's/^/Wi-Fi DNS: /'
	echo "hosts (non-default lines):"
	grep -vE '^\s*(#|$)|^(127\.0\.0\.1\s+localhost|255\.255\.255\.255\s+broadcasthost|::1\s+localhost)\s*$' /etc/hosts
	echo
	echo "# established outbound connections by process (no lookups)"
	lsof -nP -iTCP -sTCP:ESTABLISHED 2>/dev/null | awk 'NR>1 {split($9,a,"->"); r=a[2]; sub(/:[0-9]+$/,"",r); if (r !~ /^(127\.|\[::1\]|localhost)/) c[$1]++} END {for (p in c) printf "%5d  %s\n", c[p], p}' | sort -rn | head -20
	echo
	echo "# scheduled jobs and shell startup hooks"
	crontab -l 2>/dev/null | grep -v '^#' || echo "no user crontab"
	for rc in ~/.zshrc ~/.zprofile ~/.zshenv ~/.bash_profile ~/.bashrc ~/.profile; do
		[[ -f "$rc" ]] || continue
		# 只报行号和触发词，不打印内容，避免泄露配置里的密钥
		grep -nE "curl[^|]*\|\s*(ba|z)?sh|wget[^|]*\|\s*(ba|z)?sh|base64 (-d|--decode)|eval \"?\\\$\(curl|/dev/tcp/|nohup .*&\s*$|osascript -e" "$rc" 2>/dev/null \
			| awk -F: -v f="$rc" '{print f ":" $1 " matches a download/exec pattern"}'
	done
	echo
	echo "# browser extensions (names only)"
	for dir in ~/Library/Application\ Support/Google/Chrome/*/Extensions ~/Library/Application\ Support/Microsoft\ Edge/*/Extensions ~/Library/Application\ Support/BraveSoftware/Brave-Browser/*/Extensions; do
		[[ -d "$dir" ]] || continue
		for m in "$dir"/*/*/manifest.json; do
			[[ -f "$m" ]] || continue
			n=$(ext_name "$m"); id=$(basename "$(dirname "$(dirname "$m")")")
			echo "$(basename "$(dirname "$dir")") | $id | $n"
		done
	done | sort -u | head -60
	echo
	echo "xprotect version: $(defaults read /Library/Apple/System/Library/CoreServices/XProtect.bundle/Contents/Info.plist CFBundleShortVersionString 2>/dev/null)"
}

crashes() {
	hr crashes
	echo "# kernel panics in the last 30 days"
	find /Library/Logs/DiagnosticReports -maxdepth 1 \( -name '*.panic' -o -name 'panic-full*' \) -mtime -30 2>/dev/null | head
	echo "# app crash/hang reports in the last 7 days, by process"
	find ~/Library/Logs/DiagnosticReports /Library/Logs/DiagnosticReports -maxdepth 1 \( -name '*.ips' -o -name '*.crash' -o -name '*.hang' \) -mtime -7 2>/dev/null \
		| sed -E 's#.*/##; s/[-_][0-9]{4}-[0-9]{2}-[0-9]{2}.*//' | sort | uniq -c | sort -rn | head -15
}

all="basics cpu memory thermal power disk background dev schedules security threats crashes"
for s in ${@:-$all}; do
	case " $all " in *" $s "*) "$s";; *) echo "unknown section: $s" >&2;; esac
done
