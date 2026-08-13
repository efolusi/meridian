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
    "tokens": len({token["name"] for token in manifest.get("tokens", [])}),
    "version": manifest["version"],
}

checks = [
    (ROOT / "README.md", f"components-{facts['components']}-", "component badge"),
    (ROOT / "README.md", f"{facts['components']} accessible React components", "README component count"),
    (ROOT / "README.md", f"{facts['tokens']} design tokens", "README token count"),
    (ROOT / "ROADMAP.md", f"{facts['tokens']} unique token names", "roadmap token count"),
    (ROOT / "VISION.md", f"{facts['tokens']} design tokens", "vision token count"),
    (ROOT / "llms.txt", f"{facts['tokens']} design tokens", "llms token count"),
    (ROOT / "site/Docs.dc.html", f"{facts['tokens']} tokens", "docs token count"),
    (ROOT / "site/DsSite.dc.html", f"{facts['tokens']} tokens", "homepage token count"),
    (ROOT / "ROADMAP.md", f"{facts['icons']} icons", "roadmap icon count"),
    (ROOT / "ROADMAP.md", f"{facts['blocks']} blocks", "roadmap block count"),
    (ROOT / "ROADMAP.md", f"{facts['starters']} starter journeys", "roadmap starter count"),
    (ROOT / "site/Components.dc.html", f"{facts['components']} accessible React components", "components SEO count"),
    (ROOT / "site/Docs.dc.html", f"{facts['components']} accessible components", "docs SEO count"),
    (ROOT / "site/DsSite.dc.html", f"{facts['components']} accessible React components", "homepage SEO count"),
    (ROOT / "site/DsSite.dc.html", f'"softwareVersion":"{facts["version"]}"', "JSON-LD version"),
    (ROOT / "CITATION.cff", f"version: {facts['version']}", "citation version"),
]

failures = []
for path, needle, label in checks:
    if needle not in path.read_text():
        failures.append(f"{label}: expected {needle!r} in {path.relative_to(ROOT)}")

# Exact SEO needles are not enough: visible copy and translations can retain a
# stale count while another correct occurrence lets the page pass. Check every
# authored component-count claim on the public surfaces in both languages.
public_surfaces = (
    ROOT / "README.md",
    ROOT / "ROADMAP.md",
    ROOT / "site/Components.dc.html",
    ROOT / "site/Docs.dc.html",
    ROOT / "site/DsSite.dc.html",
    ROOT / "site/Examples.dc.html",
    ROOT / "VISION.md",
    ROOT / "llms.txt",
)
component_claim_patterns = (
    re.compile(r"\b(\d+)\s+accessible\s+(?:React\s+)?components\b", re.IGNORECASE),
    re.compile(r"\b(\d+)\s+komponen\s+aksesibel\b", re.IGNORECASE),
    re.compile(r"\bthe\s+(\d+)\s+components\b", re.IGNORECASE),
    re.compile(r"\bsame\s+(\d+)\s+components\b", re.IGNORECASE),
    re.compile(r"\b(\d+)\s+components\s+in\s+12\s+groups\b", re.IGNORECASE),
    re.compile(r"\b(\d+)\s+komponen\s+dalam\s+12\s+grup\b", re.IGNORECASE),
    re.compile(r"\b(\d+)\s+(?:components|komponen)\s+·", re.IGNORECASE),
    re.compile(r"\b(\d+)\s+components\s+\(source\b", re.IGNORECASE),
)
for path in public_surfaces:
    source = path.read_text()
    for pattern in component_claim_patterns:
        for match in pattern.finditer(source):
            if int(match.group(1)) != facts["components"]:
                line = source[: match.start()].count("\n") + 1
                failures.append(
                    f"{path.relative_to(ROOT)}:{line}: stale public component count "
                    f"{match.group(1)} (expected {facts['components']})"
                )

token_claim_patterns = (
    re.compile(r"\b(\d+)\s+(?:unique\s+)?design\s+tokens?\b", re.IGNORECASE),
    re.compile(r"\b(\d+)\s+unique\s+token(?:\s+names?)?\b", re.IGNORECASE),
    re.compile(r"\b(\d+)\s+token\s+unik\b", re.IGNORECASE),
    re.compile(r"\b(\d+)\s+(?:tokens|token)\s+·", re.IGNORECASE),
)
for path in public_surfaces:
    source = path.read_text()
    for pattern in token_claim_patterns:
        for match in pattern.finditer(source):
            if int(match.group(1)) != facts["tokens"]:
                line = source[: match.start()].count("\n") + 1
                failures.append(
                    f"{path.relative_to(ROOT)}:{line}: stale public token count "
                    f"{match.group(1)} (expected {facts['tokens']})"
                )

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
    f"{facts['tokens']} tokens, {facts['blocks']} blocks, "
    f"{facts['starters']} starters, v{facts['version']})"
)
