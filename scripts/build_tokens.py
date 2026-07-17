#!/usr/bin/env python3
"""Generate DTCG tokens.json and a Tailwind preset from the CSS token source.

Parses the :root block of every tokens/*.css file (the single source of
truth) and emits:
  - tokens.json      — Design Tokens Community Group format (Style Dictionary,
                       Figma Variables, etc. consume this)
  - tailwind.preset.js — a Tailwind theme.extend preset mapping the same tokens

Usage: python3 scripts/build_tokens.py
Idempotent; run after editing tokens/*.css.
"""
import json, pathlib, re

ROOT = pathlib.Path(__file__).resolve().parent.parent
FILES = ["colors.css", "typography.css", "spacing.css", "effects.css"]

def parse_root(css):
    m = re.search(r":root\{(.*?)\}", css, re.S)
    body = m.group(1) if m else ""
    body = re.sub(r"/\*.*?\*/", "", body, flags=re.S)  # strip comments
    out = {}
    for name, val in re.findall(r"(--[\w-]+)\s*:\s*([^;]+);", body):
        out[name[2:]] = val.strip()
    return out

def dtcg_type(name, value):
    if re.match(r"^(sand|brand|cocoa|caramel|peach|cream|success|warning|danger|surface|text|border|accent|overlay)", name):
        return "color"
    if name.startswith("shadow"):
        return "shadow"
    if name.startswith("z-"):
        return "number"
    if name.startswith("dur"):
        return "duration"
    if name.startswith("ease"):
        return "cubicBezier"
    if name.startswith(("space", "radius", "container", "control", "table", "text", "leading", "tracking")):
        return "dimension"
    if name.startswith(("font", "weight")):
        return "fontFamily" if name.startswith("font-") and "family" not in name and value.find(",") != -1 else "other"
    if name == "focus-ring":
        return "shadow"
    return "other"

def to_dtcg(tokens):
    tree = {}
    for name, value in tokens.items():
        node = {"$value": value, "$type": dtcg_type(name, value)}
        # group by first segment (color families etc.)
        parts = name.split("-", 1)
        group = parts[0]
        leaf = parts[1] if len(parts) > 1 else "_"
        tree.setdefault(group, {})[leaf] = node
    return tree

def tailwind_preset(tokens):
    colors, space, radius, shadow, fontsize, z = {}, {}, {}, {}, {}, {}
    for name, value in tokens.items():
        ref = f"var(--{name})"
        if dtcg_type(name, value) == "color":
            colors[name] = ref
        elif name.startswith("space-"):
            space[name[6:]] = ref
        elif name.startswith("radius-"):
            radius[name[7:]] = ref
        elif name.startswith("shadow-"):
            shadow[name[7:]] = ref
        elif name.startswith("text-") and re.match(r"^text-(\d?xs|sm|md|lg|xl|\dxl)$", name):
            fontsize[name[5:]] = ref
        elif name.startswith("z-"):
            z[name[2:]] = ref
    theme = {"colors": colors, "spacing": space, "borderRadius": radius,
             "boxShadow": shadow, "fontSize": fontsize, "zIndex": z}
    body = json.dumps(theme, indent=2)
    return ("// Meridian Tailwind preset — maps Meridian's CSS custom properties to\n"
            "// Tailwind utilities. Load tokens (styles.css) alongside this preset.\n"
            "// tailwind.config.js: module.exports = { presets: [require('./tailwind.preset.js')] }\n"
            f"module.exports = {{ theme: {{ extend: {body} }} }};\n")

def main():
    tokens = {}
    for f in FILES:
        tokens.update(parse_root((ROOT / "tokens" / f).read_text()))
    dtcg = to_dtcg(tokens)
    (ROOT / "tokens.json").write_text(json.dumps(dtcg, indent=2) + "\n")
    (ROOT / "tailwind.preset.js").write_text(tailwind_preset(tokens))
    print(f"tokens.json: {len(tokens)} tokens (DTCG); tailwind.preset.js written")

if __name__ == "__main__":
    main()
