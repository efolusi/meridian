#!/usr/bin/env python3
"""Generate apps/www/registry.json (shadcn registry schema) and per-item
files under apps/www/r/<name>.json with embedded content, from
_ds_manifest.json plus the files on disk.

Usage: python3 scripts/build_registry.py
Idempotent; run after adding or renaming components, blocks, or kits.
"""
import json, pathlib, re

ROOT = pathlib.Path(__file__).resolve().parent.parent
WWW = ROOT / "site"
R_DIR = WWW / "r"

def prompt_summary(prompt_path):
    """First non-heading prose line of a .prompt.md, as the item description."""
    try:
        for line in prompt_path.read_text().splitlines():
            line = line.strip()
            if line and not line.startswith("#"):
                return re.sub(r"\s+", " ", line)[:300]
    except OSError:
        pass
    return ""

def file_entry(path, ftype, embed):
    rel = str(path.relative_to(ROOT))
    e = {"path": rel, "type": ftype}
    if embed:
        e["content"] = path.read_text()
    return e

def component_items(embed):
    manifest = json.loads((ROOT / "_ds_manifest.json").read_text())
    by_source = {}
    for c in manifest["components"]:
        by_source.setdefault(c["sourcePath"], []).append(c["name"])
    items = []
    for source, names in sorted(by_source.items()):
        jsx = ROOT / source
        base = jsx.with_suffix("")
        dts, prompt = base.with_suffix(".d.ts"), pathlib.Path(str(base) + ".prompt.md")
        group = jsx.parent.name
        files = [file_entry(jsx, "registry:ui", embed)]
        for extra in (dts, prompt):
            if extra.exists():
                files.append(file_entry(extra, "registry:component", embed))
        items.append({
            "name": names[0].lower(),
            "type": "registry:ui",
            "title": " + ".join(names) if len(names) > 1 else names[0],
            "description": prompt_summary(prompt) or f"{names[0]} ({group}) from the Meridian design system.",
            "files": files,
            "categories": [group],
        })
    return items

def block_items(embed):
    items = []
    for f in sorted((ROOT / "blocks").glob("*.html")):
        items.append({
            "name": "block-" + f.stem,
            "type": "registry:block",
            "title": f.stem.replace("-", " ").capitalize() + " block",
            "description": f"Pre-composed Meridian section: {f.stem.replace('-', ' ')}.",
            "files": [file_entry(f, "registry:block", embed)],
            "categories": ["blocks"],
        })
    return items

def main():
    R_DIR.mkdir(exist_ok=True)
    index_items, written = [], 0
    for make in (component_items, block_items):
        for lean, full in zip(make(embed=False), make(embed=True)):
            index_items.append(lean)
            full["$schema"] = "https://ui.shadcn.com/schema/registry-item.json"
            (R_DIR / f"{full['name']}.json").write_text(json.dumps(full, indent=2) + "\n")
            written += 1
    registry = {
        "$schema": "https://ui.shadcn.com/schema/registry.json",
        "name": "meridian",
        "homepage": "https://github.com/efolusi/meridian",
        "items": index_items,
    }
    (WWW / "registry.json").write_text(json.dumps(registry, indent=2) + "\n")
    print(f"registry.json: {len(index_items)} items; r/: {written} item files")

if __name__ == "__main__":
    main()
