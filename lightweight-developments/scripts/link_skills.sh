#!/usr/bin/env bash
# Symlink active lightweight-developments skills into agent skill directories.
# Skills whose SKILL.md frontmatter has `status: "deprecated"` are skipped.
# Skills in claude_skip are not linked into a Claude Code directory (any target
# path containing "/.claude/"), because Claude Code has a built-in with that name.
# Usage: link_skills.sh <target-skills-dir> [more dirs...]
set -euo pipefail

root="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
skills_src="$root/.agents/skills"

[[ $# -ge 1 ]] || { echo "usage: $0 <target-skills-dir> [...]" >&2; exit 1; }

claude_skip=(code-review)

skip_for_target() {
	# $1 = skill name, $2 = target dir
	[[ "$2" == */.claude/* ]] || return 1
	local s
	for s in "${claude_skip[@]}"; do [[ "$1" == "$s" ]] && return 0; done
	return 1
}

is_deprecated() {
	# Only read the frontmatter block (between the first two --- lines).
	awk '/^---$/{n++; next} n==1 && /^[[:space:]]*status:[[:space:]]*"?deprecated"?[[:space:]]*$/{found=1} n>=2{exit} END{exit !found}' "$1/SKILL.md"
}

for target in "$@"; do
	mkdir -p "$target"
	# Remove links that point into this pack but whose skill is now deprecated or gone.
	for link in "$target"/*; do
		[[ -L "$link" ]] || continue
		dest="$(readlink "$link")"
		case "$dest" in "$skills_src"/*) ;; *) continue ;; esac
		name="$(basename "$link")"
		if [[ ! -f "$skills_src/$name/SKILL.md" ]] || is_deprecated "$skills_src/$name" || skip_for_target "$name" "$target"; then
			rm -- "$link"
			echo "pruned: $link"
		fi
	done
	for dir in "$skills_src"/*/; do
		name="$(basename "$dir")"
		[[ -f "$dir/SKILL.md" ]] || continue
		if is_deprecated "$dir"; then
			echo "skip (deprecated): $name"
			continue
		fi
		if skip_for_target "$name" "$target"; then
			echo "skip (Claude Code built-in): $name"
			continue
		fi
		ln -sfn "${dir%/}" "$target/$name"
		echo "linked: $target/$name"
	done
done
