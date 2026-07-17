#!/usr/bin/env python3
"""Fail if the per-folder runtime copies drift.

Every starter and site/ carry their own support.js and ds-base.js so a
copied folder works standalone. support.js must be byte-identical
everywhere; ds-base.js is identical except its single `base` line, which
must match the folder's depth.

Usage: python3 scripts/check_runtime_copies.py
"""
import hashlib, pathlib, re, sys

ROOT = pathlib.Path(__file__).resolve().parent.parent
FOLDERS = sorted(p.parent for p in ROOT.glob("starters/*/support.js")) + [ROOT / "site"]
EXPECTED_BASE = {"site": "..", "starters": "../.."}

fail = []

hashes = {f: hashlib.md5((f / "support.js").read_bytes()).hexdigest() for f in FOLDERS}
if len(set(hashes.values())) != 1:
    fail.append("support.js copies differ:")
    for f, h in hashes.items():
        fail.append(f"  {h}  {f.relative_to(ROOT)}")

for f in FOLDERS:
    text = (f / "ds-base.js").read_text()
    m = re.search(r"const base = '([^']*)';", text)
    kind = "site" if f.name == "site" else "starters"
    want = EXPECTED_BASE[kind]
    if not m:
        fail.append(f"{f.relative_to(ROOT)}/ds-base.js: no base line found")
    elif m.group(1) != want:
        fail.append(f"{f.relative_to(ROOT)}/ds-base.js: base '{m.group(1)}' != expected '{want}'")

if fail:
    print("\n".join(fail))
    sys.exit(1)
print(f"runtime copies consistent across {len(FOLDERS)} folders "
      f"(support.js {next(iter(hashes.values()))[:8]}…, ds-base bases correct)")
