#!/usr/bin/env python3
"""Generate the Tailwind preset from the vendored CSS tokens.

tokens.json and tokens/{colors,typography,spacing,effects}.css are vendored
from efolusi/design-tokens (scripts/sync_tokens.mjs). This script only maps
the :root custom properties to tailwind.preset.js.

Usage: python3 scripts/build_tokens.py
"""
import json, pathlib, re

ROOT = pathlib.Path(__file__).resolve().parent.parent
FILES = ["colors.css", "typography.css", "spacing.css", "effects.css"]

def declarations(body):
    body = re.sub(r"/\*.*?\*/", "", body, flags=re.S)  # strip comments
    return {name[2:]: val.strip() for name, val in re.findall(r"(--[\w-]+)\s*:\s*([^;]+);", body)}

def parse_root(css):
    m = re.search(r":root\s*\{(.*?)\}", css, re.S)
    return declarations(m.group(1)) if m else {}

# The type scale shares the text- prefix with the text colours, so it has to be
# recognised before the colour families or every size lands under `colors`.
FONT_SIZE = re.compile(r"^text-(\d?xs|sm|md|lg|\d?xl)$")
COLOR = re.compile(r"^(sand|brand|cocoa|caramel|peach|cream|success|warning|danger|surface|text|border|accent|overlay|code|media|chart|focus-ring)")

def tailwind_preset(tokens):
    colors, space, radius, shadow, fontsize, z = {}, {}, {}, {}, {}, {}
    for name, value in tokens.items():
        ref = f"var(--{name})"
        if FONT_SIZE.match(name):
            fontsize[name[5:]] = ref
        elif COLOR.match(name) and name not in ("focus-ring", "focus-ring-danger"):
            colors[name] = ref
        elif name.startswith("space-"):
            space[name[6:]] = ref
        elif name.startswith("radius-"):
            radius[name[7:]] = ref
        elif name.startswith("shadow-"):
            shadow[name[7:]] = ref

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
    (ROOT / "tailwind.preset.js").write_text(tailwind_preset(tokens))
    print(f"tailwind.preset.js: {len(tokens)} tokens")

if __name__ == "__main__":
    main()
