#!/usr/bin/env python3
"""Generate site/registry.json and per-item install files under
site/registry/<name>.json with embedded content, from _ds_manifest.json
plus the files on disk. Items follow an open registry schema (see the
$schema URLs) so compatible CLIs can install them from any static host.

Usage: python3 scripts/build_registry.py
Idempotent; run after adding or renaming components, blocks, or kits.
"""
import json, pathlib, re

ROOT = pathlib.Path(__file__).resolve().parent.parent
WWW = ROOT / "site"
R_DIR = WWW / "registry"

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

HOST = "https://meridian.efolusi.com/site/registry"
BASE_ITEM = "meridian-base"


def _source_to_item_name():
    """Map a component sourcePath to the registry item name that ships it."""
    manifest = json.loads((ROOT / "_ds_manifest.json").read_text())
    by_source = {}
    for c in manifest["components"]:
        by_source.setdefault(c["sourcePath"], []).append(c["name"])
    return {src: names[0].lower() for src, names in by_source.items()}, by_source


def _registry_deps(jsx, name_of_source):
    """Every other registry item this component's imports require.

    Components import siblings by relative path ('../forms/Button.jsx'), and 85 of
    them pull Button purely for injectEfCss. Those edges have to be declared or a
    CLI writes a file whose imports resolve to nothing.
    """
    deps = set()
    for spec in re.findall(r"^import .* from '([^']+)';", jsx.read_text(), re.M):
        if not spec.endswith(".jsx"):
            continue
        target = (jsx.parent / spec).resolve()
        try:
            rel = str(target.relative_to(ROOT))
        except ValueError:
            continue
        dep = name_of_source.get(rel)
        if dep:
            deps.add(dep)
    return sorted(deps)


def base_item(embed):
    """The token layer every component styles against.

    Without this, an installed component renders unstyled: it references
    var(--surface-card) and friends that the consuming project has never defined.
    """
    files = [file_entry(ROOT / "styles.css", "registry:file", embed)]
    for css in sorted((ROOT / "tokens").glob("*.css")):
        files.append(file_entry(css, "registry:file", embed))
    return [{
        "name": BASE_ITEM,
        "type": "registry:style",
        "title": "Meridian base",
        "description": "Stylesheet entry and the full token layer (colour, typography, spacing, effects) in light, dark and compact. Every other item depends on this.",
        "files": files,
        "categories": ["foundation"],
    }]


def component_items(embed):
    name_of_source, by_source = _source_to_item_name()
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
        deps = _registry_deps(jsx, name_of_source)
        self_name = names[0].lower()
        reg_deps = [f"{HOST}/{BASE_ITEM}.json"] + [
            f"{HOST}/{d}.json" for d in deps if d != self_name
        ]
        items.append({
            "name": self_name,
            "type": "registry:ui",
            "title": " + ".join(names) if len(names) > 1 else names[0],
            "description": prompt_summary(prompt) or f"{names[0]} ({group}) from the Meridian design system.",
            "dependencies": ["react"],
            "registryDependencies": reg_deps,
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
            "dependencies": ["react"],
            "registryDependencies": [f"{HOST}/{BASE_ITEM}.json"],
            "files": [file_entry(f, "registry:block", embed)],
            "categories": ["blocks"],
        })
    return items

def main():
    R_DIR.mkdir(exist_ok=True)
    index_items, written = [], 0
    for make in (base_item, component_items, block_items):
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
    print(f"registry.json: {len(index_items)} items; registry/: {written} item files")

if __name__ == "__main__":
    main()
