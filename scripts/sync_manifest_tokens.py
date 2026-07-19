#!/usr/bin/env python3
"""Rebuild the `tokens` array in _ds_manifest.json from tokens/*.css.

The manifest is a compiler artifact, but its token inventory is the one part
that drifts silently: retuning a colour in tokens/colors.css leaves the manifest
advertising the old value to every tool and agent that reads it. This regenerates
that array from the stylesheets so the two can never disagree.

Conventions preserved from the compiler output:
  - grouped per file in the order colors, typography, spacing, effects
  - within a file, the :root block first, then each scoped block
  - each entry is {name, value, kind, definedIn} plus {scope} for scoped blocks
  - a token that already exists keeps its recorded `kind` (the compiler is the
    authority on those); only new tokens get a kind inferred from their name

Usage: python3 scripts/sync_manifest_tokens.py [--check]
  --check  exit 1 if the manifest is out of date, without writing
"""
import json, pathlib, re, sys

ROOT = pathlib.Path(__file__).resolve().parent.parent
MANIFEST = ROOT / "_ds_manifest.json"
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


def main():
    check = "--check" in sys.argv
    manifest = json.loads(MANIFEST.read_text())
    old = manifest.get("tokens", [])
    existing_kinds = {e["name"]: e["kind"] for e in old}
    new = build(existing_kinds)

    if old == new:
        print(f"manifest tokens already in sync ({len(new)} entries)")
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
        print(f"manifest tokens OUT OF DATE: {len(old)} -> {len(new)} entries")
        for c in changed:
            print(f"  changed  {c}")
        for a in sorted(set(added)):
            print(f"  added    {a}")
        for r in sorted(set(removed)):
            print(f"  removed  {r}")
        print("\nrun: python3 scripts/sync_manifest_tokens.py")
        return 1

    manifest["tokens"] = new
    # match the compiler's serialisation exactly: compact, \u-escaped, no trailing newline
    MANIFEST.write_text(json.dumps(manifest, separators=(",", ":"), ensure_ascii=True))
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
