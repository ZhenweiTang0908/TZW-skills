#!/usr/bin/env python3
"""Validate every skill in the repository, not only the development pack.

Checks per skill: frontmatter (name matches folder, description, version,
author), a title heading ending in "(NIU)", agents/openai.yaml display name
ending in "(NIU)", relative links that resolve, and no hard-coded
/Users/<name>/ paths (personal values belong in config.local.env).
Then runs the development pack's own validator.
"""

from __future__ import annotations

import re
import subprocess
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
EXCLUDED = {".git", "node_modules", "Temp", "temp", "output", "dist", "__pycache__", ".venv"}
TEXT_SUFFIXES = {".md", ".yaml", ".yml", ".sh", ".py", ".swift", ".js", ".ts", ".mjs", ".json"}
FRONTMATTER_RE = re.compile(r"\A---\n(.*?)\n---\n", re.DOTALL)
NAME_RE = re.compile(r"^[a-z0-9]+(?:-[a-z0-9]+)*$")
LINK_RE = re.compile(r"\[[^\]]*\]\(([^)\s]+)\)")
USER_PATH_RE = re.compile(r"/Users/(?!Shared\b)[A-Za-z0-9._-]+/")


def included(path: Path) -> bool:
    return not any(part in EXCLUDED for part in path.relative_to(ROOT).parts)


def scalar(frontmatter: str, key: str) -> str | None:
    match = re.search(rf"(?m)^\s*{re.escape(key)}:\s*(.+?)\s*$", frontmatter)
    if not match:
        return None
    value = match.group(1).strip()
    if len(value) >= 2 and value[0] == value[-1] and value[0] in "\"'":
        value = value[1:-1]
    return value


def check_skill(skill_md: Path, errors: list[str]) -> None:
    skill_dir = skill_md.parent
    rel = skill_md.relative_to(ROOT)
    text = skill_md.read_text(encoding="utf-8")
    match = FRONTMATTER_RE.match(text)
    if not match:
        errors.append(f"{rel}: invalid frontmatter")
        return
    fm = match.group(1)
    name = scalar(fm, "name")
    description = scalar(fm, "description")
    if name != skill_dir.name or not name or not NAME_RE.fullmatch(name):
        errors.append(f"{rel}: name {name!r} must be kebab-case and match the folder")
    if not description or not 1 <= len(description) <= 1024:
        errors.append(f"{rel}: description must be 1-1024 characters")
    if not scalar(fm, "version"):
        errors.append(f"{rel}: metadata version missing")
    if "author: NiuNiu Tang" not in fm:
        errors.append(f"{rel}: author metadata missing")

    title = re.search(r"(?m)^# (.+)$", text[match.end():])
    if not title or not title.group(1).rstrip().endswith("(NIU)"):
        errors.append(f"{rel}: first '# ' title must end with '(NIU)'")

    ui_file = skill_dir / "agents" / "openai.yaml"
    if not ui_file.is_file():
        errors.append(f"{rel.parent}: missing agents/openai.yaml")
    else:
        display = re.search(r'(?m)^\s*display_name:\s*"([^"]+)"', ui_file.read_text(encoding="utf-8"))
        if not display or not display.group(1).endswith(" (NIU)"):
            errors.append(f"{ui_file.relative_to(ROOT)}: display_name must end with ' (NIU)'")


def check_links(md: Path, errors: list[str]) -> None:
    for target in LINK_RE.findall(md.read_text(encoding="utf-8")):
        target = target.split("#", 1)[0]
        if not target or target.startswith(("http://", "https://", "mailto:")) or "<" in target:
            continue
        if not (md.parent / target).exists():
            errors.append(f"{md.relative_to(ROOT)}: broken link {target!r}")


def check_user_paths(path: Path, errors: list[str]) -> None:
    try:
        lines = path.read_text(encoding="utf-8").splitlines()
    except UnicodeDecodeError:
        return
    for number, line in enumerate(lines, 1):
        if USER_PATH_RE.search(line):
            errors.append(
                f"{path.relative_to(ROOT)}:{number}: hard-coded user path; "
                "use ~, $HOME, or a key in config.local.env"
            )


def main() -> int:
    errors: list[str] = []
    skills = sorted(p for p in ROOT.rglob("SKILL.md") if included(p))
    for skill_md in skills:
        check_skill(skill_md, errors)
    for md in sorted(p for p in ROOT.rglob("*.md") if included(p)):
        check_links(md, errors)
    for path in sorted(p for p in ROOT.rglob("*") if p.is_file() and included(p)):
        if path.suffix in TEXT_SUFFIXES and path.name != "validate_repo.py":
            check_user_paths(path, errors)
    if not (ROOT / "config.example.env").is_file():
        errors.append("config.example.env: missing config template")

    for error in errors:
        print(f"ERROR: {error}")
    print(f"Repo check: {len(skills)} skills, {len(errors)} error(s).")

    pack = subprocess.run(
        [sys.executable, str(ROOT / "lightweight-developments" / "scripts" / "validate_pack.py")],
        check=False,
    )
    return 1 if errors or pack.returncode else 0


if __name__ == "__main__":
    raise SystemExit(main())
