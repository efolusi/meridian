#!/usr/bin/env python3
"""Generate the root source registry, site/registry.json, and per-item install
files under site/registry/<name>.json with embedded content, from
_ds_manifest.json plus the files on disk. Items follow the public registry
schema so compatible clients can install them from GitHub or the hosted site.

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
    # Generic files and pages have no framework-conventional destination, so
    # the current registry schema requires the registry to state it explicitly.
    if ftype in {"registry:file", "registry:page"}:
        e["target"] = rel
    if embed:
        e["content"] = path.read_text()
    return e

HOST = "https://meridian.efolusi.com/site/registry"
BASE_ITEM = "meridian-base"

# Registry item names are install contracts. Keep them stable when a source
# gains compositional exports whose declaration order differs from the root.
REGISTRY_NAME_OVERRIDES = {
    "components/ai/Bubble.jsx": "bubble",
    "components/ai/MessageScroller.jsx": "message-scroller",
    "components/dates/Calendar.jsx": "calendar",
    "components/data/Chart.jsx": "chart",
    "components/display/Card.jsx": "card",
    "components/display/Item.jsx": "item",
    "components/display/Direction.jsx": "direction",
    "components/forms/Radio.jsx": "radio-group",
    "components/navigation/Sidebar.jsx": "sidebar",
    "components/feedback/Sonner.jsx": "sonner",
}

EXTERNAL_DEPENDENCIES = {
    "components/data/Chart.jsx": ["recharts@^3.8.0"],
}

def _source_to_item_name():
    """Map a component sourcePath to the registry item name that ships it."""
    manifest = json.loads((ROOT / "_ds_manifest.json").read_text())
    by_source = {}
    for c in manifest["components"]:
        by_source.setdefault(c["sourcePath"], []).append(c["name"])
    return {
        src: REGISTRY_NAME_OVERRIDES.get(src, names[0].lower())
        for src, names in by_source.items()
    }, by_source


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
        self_name = name_of_source[source]
        reg_deps = [f"{HOST}/{BASE_ITEM}.json"] + [
            f"{HOST}/{d}.json" for d in deps if d != self_name
        ]
        primary = next((name for name in names if name.lower() == self_name), names[0])
        ordered_names = [primary] + [name for name in names if name != primary]
        item = {
            "name": self_name,
            "type": "registry:ui",
            "title": " + ".join(ordered_names),
            "description": prompt_summary(prompt) or f"{names[0]} ({group}) from the Meridian design system.",
            "dependencies": ["react", *EXTERNAL_DEPENDENCIES.get(source, [])],
            "registryDependencies": reg_deps,
            "files": files,
            "categories": [group],
        }
        items.append(item)
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


def template_items(embed):
    """Publish copyable starter journeys from the generated manifest inventory."""
    manifest = json.loads((ROOT / "_ds_manifest.json").read_text())
    items = []
    for template in manifest.get("templates", []):
        folder = template["folder"]
        if not folder.startswith("starters/"):
            continue
        root = ROOT / folder
        files = []
        for path in sorted(root.iterdir()):
            if not path.is_file() or path.name == ".thumbnail":
                continue
            files.append(file_entry(path, "registry:page", embed))
        items.append({
            "name": "starter-" + root.name,
            "type": "registry:page",
            "title": template["name"],
            "description": template["description"],
            "dependencies": ["react", "react-dom"],
            "registryDependencies": [f"{HOST}/{BASE_ITEM}.json"],
            "files": files,
            "categories": ["starters"],
        })
    return items

def main():
    R_DIR.mkdir(exist_ok=True)
    index_items, written = [], 0
    for make in (base_item, component_items, block_items, template_items):
        for lean, full in zip(make(embed=False), make(embed=True)):
            index_items.append(lean)
            full["$schema"] = "https://ui.shadcn.com/schema/registry-item.json"
            (R_DIR / f"{full['name']}.json").write_text(json.dumps(full, indent=2) + "\n")
            written += 1
    expected = {f"{item['name']}.json" for item in index_items}
    removed = 0
    for stale in R_DIR.glob("*.json"):
        if stale.name not in expected:
            stale.unlink()
            removed += 1
    registry = {
        "$schema": "https://ui.shadcn.com/schema/registry.json",
        "name": "meridian",
        "homepage": "https://github.com/efolusi/meridian",
        "items": index_items,
    }
    payload = json.dumps(registry, indent=2) + "\n"
    # The root catalog makes this public repository directly installable by
    # compatible registry clients. The hosted copy remains the discovery index
    # for the docs site and MCP server.
    (ROOT / "registry.json").write_text(payload)
    (WWW / "registry.json").write_text(payload)
    suffix = f"; removed {removed} stale file(s)" if removed else ""
    print(f"registry.json: {len(index_items)} items; registry/: {written} item files{suffix}")

if __name__ == "__main__":
    main()
