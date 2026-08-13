#!/usr/bin/env python3
"""Rebuild generated inventories in _ds_manifest.json.

The manifest is a compiler artifact whose inventories drift silently, and the
drift is not cosmetic: scripts/build_registry.py derives the whole registry from
manifest["components"], so a component missing here produces no registry item and
is silently dropped from the dependency lists of everything that imports it.
Adding Portal.jsx did exactly that. `components` is therefore taken from the
bundle header (which the compiler auto-discovers) and `tokens` from the
stylesheets, so neither can disagree with the source again.

`templates` is discovered from authored ``@template`` markers. Each starter
folder must have exactly one entry marker whose description contains
``journey``; this distinguishes the journey entry page from its linked detail
pages while keeping the public name and description beside the source. The docs
site is a single explicit template entry and follows the same marker grammar.

Conventions preserved from the compiler output:
  - grouped per file in the order colors, typography, spacing, effects
  - within a file, the :root block first, then each scoped block
  - each entry is {name, value, kind, definedIn} plus {scope} for scoped blocks
  - a token that already exists keeps its recorded `kind` (the compiler is the
    authority on those); only new tokens get a kind inferred from their name

`version` is reconciled against package.json because the npm build reads the
version from the manifest, not from package.json. Bumping package.json alone
therefore builds a tarball carrying the previous version, and every gate stays
green while it happens: this was hit for real while cutting 1.5.2. The release
workflow does compare the release tag against dist/package.json and would catch
it, but only on the release path, so a local `build_npm` still ships the wrong
number silently. package.json is the source of truth here, since that is the
file `npm version` and a human both edit.

Usage: python3 scripts/sync_manifest.py [--check]
  --check  exit 1 if the manifest is out of date, without writing
"""
import json, pathlib, re, sys

ROOT = pathlib.Path(__file__).resolve().parent.parent
MANIFEST = ROOT / "_ds_manifest.json"
PACKAGE = ROOT / "package.json"
BUNDLE = ROOT / "_ds_bundle.js"
ADHERENCE = ROOT / "_adherence.oxlintrc.json"
FILE_ORDER = ["colors.css", "typography.css", "spacing.css", "effects.css"]

# Prefix rules for tokens the manifest has not classified before. Longest match wins.
KIND_RULES = [
    ("--shadow-", "shadow"),
    ("--focus-ring-color", "color"),
    ("--focus-ring-offset", "color"),
    ("--focus-ring", "shadow"),
    ("--radius-", "radius"),
    ("--space-", "spacing"),
    ("--control-h-", "spacing"),
    ("--table-pad-", "spacing"),
    ("--container-max", "spacing"),
    ("--container-text", "font"),
    ("--font-", "font"),
    ("--leading-", "font"),
    ("--tracking-", "font"),
    ("--weight-", "font"),
    ("--dur-", "other"),
    ("--ease-", "other"),
    ("--z-", "other"),
]
# --text-* is a font size unless it names a colour role.
TEXT_COLOR_TOKENS = {"--text-code", "--text-on-brand-muted"}


def infer_kind(name, value):
    for prefix, kind in sorted(KIND_RULES, key=lambda r: -len(r[0])):
        if name.startswith(prefix):
            return kind
    if name.startswith("--text-"):
        if name in TEXT_COLOR_TOKENS:
            return "color"
        # a size/leading style token has a unit or a bare number; a colour role does not
        return "font" if re.match(r"^[\d.]+(px|rem|em)?$", value) or value.startswith("var(--sand") \
            or value.startswith("var(--brand") else "font"
    return "color"


def blocks(css, filename):
    """Yield (scope, [(name, value), ...]) for the :root block then each scoped block."""
    out = []
    m = re.search(r":root\{(.*?)\n\}", css, re.S)
    if m:
        out.append(("", m.group(1)))
    for scope_m in re.finditer(r'(\[data-[\w-]+="[\w-]+"\])\{(.*?)\n\}', css, re.S):
        out.append((scope_m.group(1), scope_m.group(2)))
    for scope, body in out:
        decls = []
        for name, value in re.findall(r"(--[\w-]+)\s*:\s*([^;]+);", body):
            decls.append((name, value.split("/*")[0].strip()))
        yield scope, decls


def build(existing_kinds):
    tokens = []
    for fname in FILE_ORDER:
        path = ROOT / "tokens" / fname
        if not path.exists():
            continue
        css = path.read_text()
        for scope, decls in blocks(css, fname):
            for name, value in decls:
                entry = {
                    "name": name,
                    "value": value,
                    "kind": existing_kinds.get(name) or infer_kind(name, value),
                    "definedIn": f"tokens/{fname}",
                }
                if scope:
                    entry["scope"] = scope
                tokens.append(entry)
    return tokens


def bundle_components():
    """The component inventory the compiler actually produced, from the header."""
    text = BUNDLE.read_text()
    header = text[: text.index("\n")]
    meta = json.loads(header[header.index("{"): header.rindex("}") + 1])
    return [{"name": c["name"], "sourcePath": c["sourcePath"]} for c in meta["components"]]


def sync_adherence_tokens(tokens, check=False):
    """Keep the compiler-owned adherence token inventory aligned to token source."""
    adherence = json.loads(ADHERENCE.read_text())
    metadata = adherence["x-omelette"]
    names = sorted({entry["name"] for entry in tokens})
    kinds = {name: next(entry["kind"] for entry in tokens if entry["name"] == name) for name in names}
    changed = metadata.get("tokens") != names or metadata.get("tokenKinds") != kinds
    if not changed:
        return False
    if check:
        print("adherence token inventory OUT OF DATE")
        return True
    metadata["tokens"] = names
    metadata["tokenKinds"] = kinds
    ADHERENCE.write_text(json.dumps(adherence, indent=2) + "\n")
    print(f"adherence tokens: {len(names)} entries")
    return True


TEMPLATE_RE = re.compile(
    r'<!--\s*@template\s+name="([^"]+)"\s+description="([^"]+)"\s*-->'
)


def template_marker(path):
    """Return authored (name, description), or None when a page is not a template."""
    match = TEMPLATE_RE.search(path.read_text())
    return match.groups() if match else None


def template_entry(name, description, folder, entry_path):
    thumbnail = ROOT / folder / ".thumbnail"
    if not thumbnail.exists():
        raise ValueError(f"template {folder} has no .thumbnail")
    return {
        "name": name,
        "description": description,
        "folder": folder,
        "entryPath": entry_path,
        "thumbnail": {"path": f"{folder}/.thumbnail", "kind": "captured"},
    }


def template_inventory():
    """Discover every starter journey plus the docs-site template."""
    entries = []
    for folder_path in sorted((ROOT / "starters").iterdir()):
        if not folder_path.is_dir():
            continue
        candidates = []
        for page in sorted(folder_path.glob("*.dc.html")):
            marker = template_marker(page)
            if marker and "journey" in marker[1].lower():
                candidates.append((page, marker))
        if len(candidates) != 1:
            names = ", ".join(str(p.relative_to(ROOT)) for p, _ in candidates) or "none"
            raise ValueError(
                f"{folder_path.relative_to(ROOT)} must have exactly one @template "
                f"entry whose description contains 'journey'; found {names}"
            )
        page, (name, description) = candidates[0]
        folder = str(folder_path.relative_to(ROOT))
        entries.append(template_entry(name, description, folder, str(page.relative_to(ROOT))))

    site_page = ROOT / "site" / "DsSite.dc.html"
    site_marker = template_marker(site_page)
    if not site_marker:
        raise ValueError("site/DsSite.dc.html has no @template marker")
    entries.append(template_entry(*site_marker, "site", "site/DsSite.dc.html"))
    return entries


def main():
    check = "--check" in sys.argv
    manifest = json.loads(MANIFEST.read_text())

    old_components = manifest.get("components", [])
    new_components = bundle_components()
    comp_added = [c["name"] for c in new_components if c["name"] not in {o["name"] for o in old_components}]
    comp_removed = [o["name"] for o in old_components if o["name"] not in {c["name"] for c in new_components}]

    old_version = manifest.get("version")
    new_version = json.loads(PACKAGE.read_text())["version"]

    old_templates = manifest.get("templates", [])
    new_templates = template_inventory()

    old = manifest.get("tokens", [])
    existing_kinds = {e["name"]: e["kind"] for e in old}
    new = build(existing_kinds)

    adherence_changed = sync_adherence_tokens(new, check=check)

    if (old == new and old_components == new_components and old_version == new_version
            and old_templates == new_templates and not adherence_changed):
        print(f"manifest in sync (version {new_version}, "
              f"{len(new_components)} components, {len(new_templates)} templates, "
              f"{len(new)} token entries)")
        return 0

    added = [e["name"] for e in new if e["name"] not in {o["name"] for o in old}]
    removed = [o["name"] for o in old if o["name"] not in {e["name"] for e in new}]
    changed = []
    oldmap = {(o["name"], o.get("scope", "")): o["value"] for o in old}
    for e in new:
        k = (e["name"], e.get("scope", ""))
        if k in oldmap and oldmap[k] != e["value"]:
            changed.append(f"{e['name']}{' ' + e['scope'] if e.get('scope') else ''}: "
                           f"{oldmap[k]!r} -> {e['value']!r}")

    if check:
        print(f"manifest OUT OF DATE")
        if old_version != new_version:
            print(f"  version: {old_version} -> {new_version} (from package.json)")
            print(f"           the npm build reads the version from the manifest, so"
                  f" building now would ship {old_version}")
        if old_components != new_components:
            print(f"  components: {len(old_components)} -> {len(new_components)}")
            for a in comp_added:
                print(f"    added    {a}")
            for r in comp_removed:
                print(f"    removed  {r}")
        if old_templates != new_templates:
            print(f"  templates: {len(old_templates)} -> {len(new_templates)}")
            old_folders = {entry["folder"] for entry in old_templates}
            new_folders = {entry["folder"] for entry in new_templates}
            for folder in sorted(new_folders - old_folders):
                print(f"    added    {folder}")
            for folder in sorted(old_folders - new_folders):
                print(f"    removed  {folder}")
        print(f"  tokens: {len(old)} -> {len(new)} entries")
        for c in changed:
            print(f"  changed  {c}")
        for a in sorted(set(added)):
            print(f"  added    {a}")
        for r in sorted(set(removed)):
            print(f"  removed  {r}")
        print("\nrun: python3 scripts/sync_manifest.py")
        return 1

    manifest["version"] = new_version
    manifest["components"] = new_components
    manifest["templates"] = new_templates
    manifest["tokens"] = new
    # match the compiler's serialisation exactly: compact, \u-escaped, no trailing newline
    MANIFEST.write_text(json.dumps(manifest, separators=(",", ":"), ensure_ascii=True))
    if old_version != new_version:
        print(f"manifest version: {old_version} -> {new_version}")
    if old_components != new_components:
        print(f"manifest components: {len(old_components)} -> {len(new_components)}")
        for a in comp_added:
            print(f"  added    {a}")
        for r in comp_removed:
            print(f"  removed  {r}")
    if old_templates != new_templates:
        print(f"manifest templates: {len(old_templates)} -> {len(new_templates)}")
        old_folders = {entry["folder"] for entry in old_templates}
        new_folders = {entry["folder"] for entry in new_templates}
        for folder in sorted(new_folders - old_folders):
            print(f"  added    {folder}")
        for folder in sorted(old_folders - new_folders):
            print(f"  removed  {folder}")
    print(f"manifest tokens: {len(old)} -> {len(new)} entries")
    for c in changed:
        print(f"  changed  {c}")
    for a in sorted(set(added)):
        print(f"  added    {a}")
    for r in sorted(set(removed)):
        print(f"  removed  {r}")
    return 0


if __name__ == "__main__":
    sys.exit(main())
