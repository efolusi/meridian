#!/usr/bin/env python3
"""Keep authored public counts and version metadata aligned with inventories."""

import json
import pathlib
import re
import sys

ROOT = pathlib.Path(__file__).resolve().parent.parent
manifest = json.loads((ROOT / "_ds_manifest.json").read_text())

facts = {
    "components": len(list((ROOT / "components").glob("*/*.jsx"))),
    "icons": len(list((ROOT / "assets/icons").glob("*.svg"))),
    "blocks": len(list((ROOT / "blocks").glob("*.html"))),
    "starters": len([t for t in manifest.get("templates", []) if t["folder"].startswith("starters/")]),
    "version": manifest["version"],
}

checks = [
    (ROOT / "README.md", f"components-{facts['components']}-", "component badge"),
    (ROOT / "README.md", f"{facts['components']} accessible React components", "README component count"),
    (ROOT / "ROADMAP.md", f"{facts['icons']} icons", "roadmap icon count"),
    (ROOT / "ROADMAP.md", f"{facts['blocks']} blocks", "roadmap block count"),
    (ROOT / "ROADMAP.md", f"{facts['starters']} starter journeys", "roadmap starter count"),
    (ROOT / "site/Components.dc.html", f"{facts['components']} accessible React components", "components SEO count"),
    (ROOT / "site/Docs.dc.html", f"{facts['components']} accessible components", "docs SEO count"),
    (ROOT / "site/DsSite.dc.html", f"{facts['components']} accessible React components", "homepage SEO count"),
    (ROOT / "site/DsSite.dc.html", f'"softwareVersion":"{facts["version"]}"', "JSON-LD version"),
]

failures = []
for path, needle, label in checks:
    if needle not in path.read_text():
        failures.append(f"{label}: expected {needle!r} in {path.relative_to(ROOT)}")

# Catch the common partial-update failure even when the expected string appears
# elsewhere on the same page.
for path in (ROOT / "site/Components.dc.html", ROOT / "site/Docs.dc.html", ROOT / "site/DsSite.dc.html"):
    for stale in re.findall(r"(\d+) accessible React? ?components", path.read_text()):
        if int(stale) != facts["components"]:
            failures.append(f"{path.relative_to(ROOT)}: stale public component count {stale}")

if failures:
    print("\n".join(failures))
    sys.exit(1)

print(
    "public facts synchronized "
    f"({facts['components']} components, {facts['icons']} icons, "
    f"{facts['blocks']} blocks, {facts['starters']} starters, v{facts['version']})"
)
