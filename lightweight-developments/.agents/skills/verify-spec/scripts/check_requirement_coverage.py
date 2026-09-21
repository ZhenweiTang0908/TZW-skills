#!/usr/bin/env python3
"""Check that every Spec requirement ID has one verification status."""

from __future__ import annotations

import argparse
import json
import re
from collections import defaultdict
from pathlib import Path


ID_RE = re.compile(r"\bR[1-9][0-9]*\b", re.IGNORECASE)
STATUS_RE = re.compile(r"\b(PASS|FAIL|NOT\s+VERIFIED)\b", re.IGNORECASE)


def requirement_ids(text: str) -> set[str]:
    return {match.upper() for match in ID_RE.findall(text)}


def report_statuses(text: str) -> dict[str, set[str]]:
    statuses: dict[str, set[str]] = defaultdict(set)
    for line in text.splitlines():
        ids = requirement_ids(line)
        status = STATUS_RE.search(line)
        if status:
            normalized = re.sub(r"\s+", " ", status.group(1).upper())
            for requirement in ids:
                statuses[requirement].add(normalized)
    return dict(statuses)


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("spec", type=Path)
    parser.add_argument("report", type=Path)
    parser.add_argument("--json", action="store_true")
    args = parser.parse_args()

    expected = requirement_ids(args.spec.read_text(encoding="utf-8"))
    statuses = report_statuses(args.report.read_text(encoding="utf-8"))
    missing = sorted(expected - statuses.keys())
    unknown = sorted(statuses.keys() - expected)
    conflicting = sorted(key for key, values in statuses.items() if len(values) != 1)
    result = {
        "requirements": len(expected),
        "covered": len(expected & statuses.keys()),
        "missing": missing,
        "unknown": unknown,
        "conflicting": conflicting,
    }
    if args.json:
        print(json.dumps(result, indent=2))
    else:
        print(f"Requirements: {result['requirements']}; covered: {result['covered']}")
        print(f"Missing: {', '.join(missing) if missing else 'none'}")
        print(f"Unknown: {', '.join(unknown) if unknown else 'none'}")
        print(f"Conflicting: {', '.join(conflicting) if conflicting else 'none'}")
    return 1 if missing or unknown or conflicting or not expected else 0


if __name__ == "__main__":
    raise SystemExit(main())

# NiuNiu Tang
