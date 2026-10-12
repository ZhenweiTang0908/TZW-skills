#!/usr/bin/env python3
"""Conservative static preflight for a single read-only SQL statement.

This checker cannot prove that functions, views, or database extensions are free
of side effects. It supplements, but never replaces, server-enforced read-only
credentials, a read-only transaction, timeouts, and bounded execution.
"""

from __future__ import annotations

import argparse
import re
import sys
from pathlib import Path


FORBIDDEN = {
    "alter", "analyze", "call", "cluster", "comment", "commit", "copy", "create",
    "delete", "discard", "do", "drop", "execute", "grant", "insert", "listen",
    "lock", "merge", "notify", "prepare", "refresh", "reindex", "release", "reset",
    "revoke", "rollback", "savepoint", "security", "set", "truncate", "unlisten",
    "update", "vacuum",
}
SIDE_EFFECT_FUNCTIONS = {
    "dblink_exec", "lo_export", "lo_import", "nextval", "pg_advisory_lock",
    "pg_advisory_xact_lock", "pg_notify", "set_config", "setval",
}


def mask_literals(sql: str) -> tuple[str, list[str]]:
    output: list[str] = []
    errors: list[str] = []
    quote: str | None = None
    index = 0
    while index < len(sql):
        char = sql[index]
        pair = sql[index:index + 2]
        if quote:
            output.append(" ")
            if char == quote:
                if index + 1 < len(sql) and sql[index + 1] == quote:
                    output.append(" ")
                    index += 2
                    continue
                quote = None
            index += 1
            continue
        if pair in {"--", "/*"}:
            errors.append("SQL comments are rejected by this conservative preflight")
            break
        if char in {"'", '"'}:
            quote = char
            output.append(" ")
        else:
            output.append(char)
        index += 1
    if quote:
        errors.append("unterminated quoted literal or identifier")
    return "".join(output), errors


def check(sql: str) -> list[str]:
    masked, errors = mask_literals(sql)
    if errors:
        return errors
    statements = [part.strip() for part in masked.split(";") if part.strip()]
    if len(statements) != 1:
        errors.append("exactly one SQL statement is required")
        return errors

    statement = statements[0].lower()
    tokens = re.findall(r"[a-z_][a-z0-9_]*", statement)
    if not tokens or tokens[0] not in {"select", "with", "explain"}:
        errors.append("statement must begin with SELECT, WITH, or safe EXPLAIN")
    present = sorted(FORBIDDEN & set(tokens))
    if present:
        errors.append(f"forbidden SQL keyword(s): {', '.join(present)}")
    if re.search(r"\bselect\b[\s\S]*?\binto\b", statement):
        errors.append("SELECT INTO is not read-only")
    if re.search(r"\bfor\s+(update|share|no\s+key\s+update|key\s+share)\b", statement):
        errors.append("row-locking SELECT is not allowed")
    if tokens and tokens[0] == "explain" and re.search(r"\b(analyze|analyse)\b", statement):
        errors.append("EXPLAIN ANALYZE is rejected; use plain EXPLAIN")
    called = {name.lower() for name in re.findall(r"\b([a-z_][a-z0-9_]*)\s*\(", statement)}
    dangerous_calls = sorted(called & SIDE_EFFECT_FUNCTIONS)
    if dangerous_calls:
        errors.append(f"known side-effecting function(s): {', '.join(dangerous_calls)}")
    return errors


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("path", nargs="?", type=Path, help="SQL file; omit to read stdin")
    args = parser.parse_args()
    sql = args.path.read_text(encoding="utf-8") if args.path else sys.stdin.read()
    errors = check(sql)
    if errors:
        for error in errors:
            print(f"REJECT: {error}")
        return 1
    print("STATIC PREFLIGHT PASSED. This is not proof of database-level read-only safety.")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())

# NiuNiu Tang
