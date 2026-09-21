#!/usr/bin/env python3
"""Create deterministic ZIP packages for the full pack and each skill."""

from __future__ import annotations

import argparse
import hashlib
import zipfile
from pathlib import Path


FIXED_TIME = (2026, 1, 1, 0, 0, 0)
EXCLUDED_PARTS = {"dist", "__pycache__", ".git", ".DS_Store"}


def included_files(root: Path) -> list[Path]:
    return sorted(
        path for path in root.rglob("*")
        if path.is_file() and not any(part in EXCLUDED_PARTS for part in path.parts)
    )


def write_zip(source: Path, destination: Path, prefix: str) -> None:
    with zipfile.ZipFile(destination, "w", compression=zipfile.ZIP_DEFLATED) as archive:
        for path in included_files(source):
            relative = path.relative_to(source)
            info = zipfile.ZipInfo(str(Path(prefix) / relative), FIXED_TIME)
            info.compress_type = zipfile.ZIP_DEFLATED
            info.external_attr = 0o644 << 16
            archive.writestr(info, path.read_bytes())


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("root", nargs="?", type=Path, default=Path(__file__).resolve().parents[1])
    parser.add_argument("--output", type=Path, help="Output directory; defaults to <root>/dist")
    args = parser.parse_args()

    root = args.root.resolve()
    output = (args.output or root / "dist").resolve()
    output.mkdir(parents=True, exist_ok=True)

    artifacts: list[Path] = []
    pack_zip = output / "lightweight-developments.zip"
    write_zip(root, pack_zip, root.name)
    artifacts.append(pack_zip)

    for skill in sorted((root / ".agents" / "skills").iterdir()):
        if not skill.is_dir():
            continue
        destination = output / f"{skill.name}.zip"
        write_zip(skill, destination, skill.name)
        artifacts.append(destination)

    manifest = output / "SHA256SUMS"
    manifest.write_text(
        "".join(f"{hashlib.sha256(path.read_bytes()).hexdigest()}  {path.name}\n" for path in artifacts),
        encoding="utf-8",
    )
    print(f"Created {len(artifacts)} packages in {output}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())

# NiuNiu Tang
