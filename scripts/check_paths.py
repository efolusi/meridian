#!/usr/bin/env python3
"""Verify every relative href/src in HTML files resolves to a real file.

Counted ../ prefixes are the repo's one recurring bug class (see
ARCHITECTURE.md § invariants); this makes them impossible to break
silently. Skips absolute URLs, data:, anchors, and template bindings.

Usage: python3 scripts/check_paths.py
"""
import pathlib, re, sys

ROOT = pathlib.Path(__file__).resolve().parent.parent
# "meridian/" is the documented vendor prefix used inside install-snippet
# code examples; it never refers to a file in this repo.
SKIP_PREFIXES = ("http://", "https://", "data:", "mailto:", "#", "{{", "meridian/")
ATTR = re.compile(r'(?:href|src)="([^"]+)"')

fail = []
checked = 0
for html in ROOT.rglob("*.html"):
    if ".git" in html.parts or "node_modules" in html.parts:
        continue
    text = html.read_text(errors="ignore")
    for ref in ATTR.findall(text):
        if ref.startswith(SKIP_PREFIXES) or "{{" in ref:
            continue
        target = ref.split("#")[0].split("?")[0]
        if not target:
            continue
        resolved = (ROOT / target.lstrip("/")).resolve() if target.startswith("/") else (html.parent / target).resolve()
        if not resolved.exists():
            fail.append(f"{html.relative_to(ROOT)}: {ref}")
        checked += 1

if fail:
    print(f"{len(fail)} broken relative reference(s):")
    [print("  " + f) for f in fail]
    sys.exit(1)
print(f"all {checked} relative references resolve")
