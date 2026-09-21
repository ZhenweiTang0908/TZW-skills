#!/usr/bin/env python3
"""Validate the structure and internal links of the skill pack."""

from __future__ import annotations

import argparse
import re
import sys
from pathlib import Path


NAME_RE = re.compile(r"^[a-z0-9]+(?:-[a-z0-9]+)*$")
LINK_RE = re.compile(r"\[[^\]]*\]\(([^)]+)\)")
FRONTMATTER_RE = re.compile(r"\A---\n(.*?)\n---\n", re.DOTALL)


def scalar(frontmatter: str, key: str) -> str | None:
    match = re.search(rf"(?m)^\s*{re.escape(key)}:\s*(.+?)\s*$", frontmatter)
    if not match:
        return None
    value = match.group(1).strip()
    if len(value) >= 2 and value[0] == value[-1] and value[0] in "\"'":
        value = value[1:-1]
    return value


def validate_markdown_links(path: Path, errors: list[str]) -> None:
    text = path.read_text(encoding="utf-8")
    for target in LINK_RE.findall(text):
        target = target.strip().split("#", 1)[0]
        if not target or target.startswith(("http://", "https://", "mailto:")):
            continue
        if "<" in target or ">" in target:
            continue
        if not (path.parent / target).resolve().exists():
            errors.append(f"{path}: broken relative link {target!r}")


def validate_skill(skill_dir: Path, errors: list[str]) -> None:
    skill_md = skill_dir / "SKILL.md"
    if not skill_md.is_file():
        errors.append(f"{skill_dir}: missing SKILL.md")
        return

    text = skill_md.read_text(encoding="utf-8")
    match = FRONTMATTER_RE.match(text)
    if not match:
        errors.append(f"{skill_md}: invalid frontmatter delimiters")
        return

    frontmatter = match.group(1)
    name = scalar(frontmatter, "name")
    description = scalar(frontmatter, "description")
    version = scalar(frontmatter, "version")

    if name != skill_dir.name:
        errors.append(f"{skill_md}: name {name!r} does not match folder")
    if not name or not NAME_RE.fullmatch(name):
        errors.append(f"{skill_md}: invalid skill name")
    if not description or not (1 <= len(description) <= 1024):
        errors.append(f"{skill_md}: description must contain 1-1024 characters")
    if not version:
        errors.append(f"{skill_md}: metadata version is required by this pack")
    if "author: NiuNiu Tang" not in frontmatter:
        errors.append(f"{skill_md}: missing NiuNiu Tang author metadata")

    openai_yaml = skill_dir / "agents" / "openai.yaml"
    if not openai_yaml.is_file():
        errors.append(f"{skill_dir}: missing agents/openai.yaml")
    else:
        ui = openai_yaml.read_text(encoding="utf-8")
        display = re.search(r'(?m)^\s*display_name:\s*"([^"]+)"\s*$', ui)
        short = re.search(r'(?m)^\s*short_description:\s*"([^"]+)"\s*$', ui)
        prompt = re.search(r'(?m)^\s*default_prompt:\s*"([^"]+)"\s*$', ui)
        if not display or not display.group(1).endswith(" (NIU)"):
            errors.append(f"{openai_yaml}: display_name must end with ' (NIU)'")
        if not short or not (25 <= len(short.group(1)) <= 64):
            errors.append(f"{openai_yaml}: short_description must be 25-64 characters")
        if not prompt or f"${name}" not in prompt.group(1):
            errors.append(f"{openai_yaml}: default_prompt must mention ${name}")

    assets = skill_dir / "assets"
    if not assets.is_dir() or not any(path.is_file() for path in assets.iterdir()):
        errors.append(f"{skill_dir}: assets must contain a useful output resource")


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument(
        "root",
        nargs="?",
        type=Path,
        default=Path(__file__).resolve().parents[1],
        help="Skill-pack root (defaults to this script's parent project)",
    )
    args = parser.parse_args()
    root = args.root.resolve()
    skill_root = root / ".agents" / "skills"
    errors: list[str] = []

    if not skill_root.is_dir():
        print(f"ERROR: missing skill root: {skill_root}", file=sys.stderr)
        return 2

    skills = sorted(path for path in skill_root.iterdir() if path.is_dir())
    for skill in skills:
        validate_skill(skill, errors)

    for markdown in sorted(root.rglob("*.md")):
        if "— NiuNiu Tang" not in markdown.read_text(encoding="utf-8"):
            errors.append(f"{markdown}: missing NiuNiu Tang signature")
        validate_markdown_links(markdown, errors)

    catalog = (root / "catalog.yaml").read_text(encoding="utf-8") if (root / "catalog.yaml").exists() else ""
    for skill in skills:
        if f'"{skill.name}"' not in catalog:
            errors.append(f"catalog.yaml: missing {skill.name}")

    if errors:
        for error in errors:
            print(f"ERROR: {error}")
        print(f"Validation failed with {len(errors)} error(s).")
        return 1

    print(f"Validated {len(skills)} skills and {sum(1 for _ in root.rglob('*.md'))} Markdown files.")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())

# NiuNiu Tang
