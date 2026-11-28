import os
import subprocess
import tempfile
import unittest
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
SCRIPT = ROOT / "scripts" / "link_skills.sh"


class LinkSkillsTests(unittest.TestCase):
    def run_script(self, *args):
        return subprocess.run(["bash", str(SCRIPT), *args], capture_output=True, text=True, check=True)

    def test_skips_deprecated_and_prunes_stale_links(self):
        with tempfile.TemporaryDirectory() as tmp:
            target = Path(tmp) / "skills"
            target.mkdir()
            # A stale link to a deprecated skill, left over from an older install.
            os.symlink(ROOT / ".agents" / "skills" / "verify-change", target / "verify-change")
            result = self.run_script(str(target))
            self.assertIn("pruned:", result.stdout)
            self.assertFalse((target / "verify-change").is_symlink())
            self.assertFalse((target / "doubt-review").exists())
            self.assertTrue((target / "diagnose").is_symlink())
            self.assertTrue((target / "code-review").is_symlink())

    def test_skips_claude_builtin_names_in_claude_dir(self):
        with tempfile.TemporaryDirectory() as tmp:
            target = Path(tmp) / ".claude" / "skills"
            target.mkdir(parents=True)
            os.symlink(ROOT / ".agents" / "skills" / "code-review", target / "code-review")
            self.run_script(str(target))
            self.assertFalse((target / "code-review").exists())
            self.assertTrue((target / "diagnose").is_symlink())


if __name__ == "__main__":
    unittest.main()
