#!/usr/bin/env python3
"""Report potentially overlapping skill descriptions."""

from __future__ import annotations

import argparse
import itertools
import re
from pathlib import Path


STOPWORDS = {
    "a", "an", "and", "as", "at", "by", "do", "for", "from", "in", "into",
    "is", "it", "of", "on", "or", "the", "this", "to", "use", "when", "with",
}


def read_description(skill_md: Path) -> str:
    frontmatter = skill_md.read_text(encoding="utf-8").split("---", 2)[1]
    match = re.search(r"(?m)^description:\s*(.+?)\s*$", frontmatter)
    if not match:
        raise ValueError(f"Missing description: {skill_md}")
    return match.group(1).strip().strip("\"'")


def tokens(text: str) -> set[str]:
    return {
        token for token in re.findall(r"[a-z0-9]+", text.lower())
        if len(token) > 2 and token not in STOPWORDS
    }


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("root", nargs="?", type=Path, default=Path(__file__).resolve().parents[1])
    parser.add_argument("--threshold", type=float, default=0.35)
    parser.add_argument("--strict", action="store_true", help="Fail if any pair meets the threshold")
    args = parser.parse_args()

    skill_root = args.root / ".agents" / "skills"
    descriptions = {
        path.parent.name: tokens(read_description(path))
        for path in sorted(skill_root.glob("*/SKILL.md"))
    }
    overlaps: list[tuple[float, str, str, list[str]]] = []
    for (left, left_tokens), (right, right_tokens) in itertools.combinations(descriptions.items(), 2):
        union = left_tokens | right_tokens
        score = len(left_tokens & right_tokens) / len(union) if union else 0.0
        if score >= args.threshold:
            overlaps.append((score, left, right, sorted(left_tokens & right_tokens)))

    if not overlaps:
        print(f"No description pairs met the {args.threshold:.2f} overlap threshold.")
        return 0

    for score, left, right, shared in sorted(overlaps, reverse=True):
        print(f"{score:.2f}  {left} <-> {right}  shared={','.join(shared)}")
    return 1 if args.strict else 0


if __name__ == "__main__":
    raise SystemExit(main())

# NiuNiu Tang
