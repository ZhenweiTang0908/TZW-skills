#!/usr/bin/env python3
"""Tests for deterministic helpers bundled with Lightweight Developments."""

from __future__ import annotations

import importlib.util
import subprocess
import sys
import tempfile
import unittest
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]


def load_module(name: str, path: Path):
    spec = importlib.util.spec_from_file_location(name, path)
    assert spec and spec.loader
    module = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(module)
    return module


sql_checker = load_module(
    "sql_checker",
    ROOT / ".agents/skills/product-analysis/scripts/check_sql_read_only.py",
)
coverage_checker = load_module(
    "coverage_checker",
    ROOT / ".agents/skills/verify-spec/scripts/check_requirement_coverage.py",
)


class SqlReadOnlyTests(unittest.TestCase):
    def test_accepts_bounded_select(self):
        self.assertEqual(sql_checker.check("SELECT id FROM contacts WHERE id = 1 LIMIT 10"), [])

    def test_accepts_read_only_cte(self):
        self.assertEqual(sql_checker.check("WITH recent AS (SELECT id FROM jobs) SELECT * FROM recent LIMIT 5"), [])

    def test_rejects_data_modifying_cte(self):
        self.assertTrue(sql_checker.check("WITH changed AS (UPDATE jobs SET state = 'x' RETURNING id) SELECT * FROM changed"))

    def test_rejects_select_into_and_row_lock(self):
        self.assertTrue(sql_checker.check("SELECT id INTO temp_ids FROM contacts"))
        self.assertTrue(sql_checker.check("SELECT id FROM contacts FOR UPDATE"))

    def test_rejects_multiple_statements_comments_and_side_effects(self):
        self.assertTrue(sql_checker.check("SELECT 1; SELECT 2"))
        self.assertTrue(sql_checker.check("SELECT 1 -- hidden text"))
        self.assertTrue(sql_checker.check("SELECT nextval('sequence_name')"))


class RequirementCoverageTests(unittest.TestCase):
    def test_extracts_unique_requirements(self):
        self.assertEqual(coverage_checker.requirement_ids("R1 text; R2 text; see R1"), {"R1", "R2"})

    def test_extracts_statuses_only_from_status_lines(self):
        report = "R1 — PASS\nR2: NOT VERIFIED\nMention R3 without a result"
        self.assertEqual(
            coverage_checker.report_statuses(report),
            {"R1": {"PASS"}, "R2": {"NOT VERIFIED"}},
        )


class PackIntegrationTests(unittest.TestCase):
    def test_pack_validator(self):
        completed = subprocess.run(
            [sys.executable, str(ROOT / "scripts/validate_pack.py"), str(ROOT)],
            check=False,
            capture_output=True,
            text=True,
        )
        self.assertEqual(completed.returncode, 0, completed.stdout + completed.stderr)

    def test_packager_creates_full_and_per_skill_archives(self):
        with tempfile.TemporaryDirectory() as directory:
            completed = subprocess.run(
                [
                    sys.executable,
                    str(ROOT / "scripts/package_skills.py"),
                    str(ROOT),
                    "--output",
                    directory,
                ],
                check=False,
                capture_output=True,
                text=True,
            )
            self.assertEqual(completed.returncode, 0, completed.stdout + completed.stderr)
            archives = sorted(Path(directory).glob("*.zip"))
            self.assertEqual(len(archives), 16)
            self.assertTrue((Path(directory) / "SHA256SUMS").is_file())


if __name__ == "__main__":
    unittest.main()

# NiuNiu Tang
