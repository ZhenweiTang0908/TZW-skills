#!/usr/bin/env bash
# Shared config loader for TZW Skills. Source it, then read the variables:
#   source "<repo>/config.sh"; echo "$WORK_LOG_DIR"
# Or run it to print the resolved settings: bash config.sh [KEY]
# Lookup: $NIU_SKILLS_CONFIG, else config.local.env next to this file.
# Real environment variables win over the file. "~" expands to $HOME.

_niu_root=$(cd "$(dirname "$(readlink -f "${BASH_SOURCE[0]}")")" && pwd)
_niu_file=${NIU_SKILLS_CONFIG:-$_niu_root/config.local.env}
NIU_SKILLS_CONFIG_LOADED=""
if [[ -f "$_niu_file" ]]; then
	NIU_SKILLS_CONFIG_LOADED=$_niu_file
	while IFS= read -r _niu_line || [[ -n "$_niu_line" ]]; do
		[[ "$_niu_line" =~ ^[[:space:]]*(#|$) ]] && continue
		_niu_key=${_niu_line%%=*}; _niu_val=${_niu_line#*=}
		[[ "$_niu_key" =~ ^[A-Z_][A-Z0-9_]*$ ]] || continue
		[[ -n "${!_niu_key+x}" ]] && continue   # environment wins
		_niu_val=${_niu_val//\~/$HOME}
		printf -v "$_niu_key" '%s' "$_niu_val"
		export "${_niu_key?}"
	done < "$_niu_file"
fi
unset _niu_root _niu_file _niu_line _niu_key _niu_val

if [[ "${BASH_SOURCE[0]}" == "$0" ]]; then
	if [[ -z "$NIU_SKILLS_CONFIG_LOADED" ]]; then echo "no config file found (copy config.example.env to config.local.env)" >&2; exit 1; fi
	if [[ $# -gt 0 ]]; then printf '%s\n' "${!1-}"; [[ -n "${!1+x}" ]]; exit; fi
	for k in WORK_LOG_DIR REMINDER_LIST_WORK REMINDER_LIST_STUDY REMINDER_LIST_ERRANDS PROJECT_DIRS; do printf '%s=%s\n' "$k" "${!k-}"; done
fi
