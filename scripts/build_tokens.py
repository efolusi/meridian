#!/usr/bin/env python3
"""Generate DTCG tokens.json and a Tailwind preset from the CSS token source.

Parses tokens/*.css (the single source of truth) and emits:
  - tokens.json      — Design Tokens Community Group format (Style Dictionary,
                       Figma Variables, etc. consume this)
  - tailwind.preset.js — a Tailwind theme.extend preset mapping the same tokens

tokens.json shape:
  - $value is the light, default-density, fine-pointer value.
  - A reference to another token is a DTCG alias, {group.leaf}, never var().
    Inside a composite string (the focus-ring shadows) the alias is embedded,
    which Style Dictionary resolves.
  - Values that change under a theme, density or pointer live in
    $extensions["com.efolusi.meridian"].modes.<mode>, only where they differ.
    The root $extensions entry maps each mode name to the CSS that applies it.

Usage: python3 scripts/build_tokens.py
Idempotent; run after editing tokens/*.css.
"""
import json, pathlib, re

ROOT = pathlib.Path(__file__).resolve().parent.parent
FILES = ["colors.css", "typography.css", "spacing.css", "effects.css"]

def declarations(body):
    body = re.sub(r"/\*.*?\*/", "", body, flags=re.S)  # strip comments
    return {name[2:]: val.strip() for name, val in re.findall(r"(--[\w-]+)\s*:\s*([^;]+);", body)}

def block(css, pattern):
    m = re.search(pattern, css, re.S)
    return declarations(m.group(1)) if m else {}

def parse_root(css):
    return block(css, r":root\{(.*?)\}")

# Mode name -> (source file, block pattern, the CSS that applies it).
MODES = {
    "dark": ("colors.css", r'\[data-theme="dark"\]\{(.*?)\}', '[data-theme="dark"]'),
    "compact": ("spacing.css", r'\[data-density="compact"\]\{(.*?)\}', '[data-density="compact"]'),
    "coarse": ("spacing.css", r"@media \(pointer: coarse\) \{\s*[^{]*\{(.*?)\}", "@media (pointer: coarse)"),
}
VENDOR = "com.efolusi.meridian"

def path_of(name):
    group, _, leaf = name.partition("-")
    return group, leaf or "_"

def to_alias(value, known):
    """Rewrite every var(--x) as the DTCG alias {group.leaf}."""
    def ref(m):
        name = m.group(1)
        if name not in known:
            raise SystemExit(f"var(--{name}) does not name a token")
        return "{%s.%s}" % path_of(name)
    return re.sub(r"var\(--([\w-]+)\)", ref, value)

# The type scale shares the text- prefix with the text colours, so it has to be
# recognised before the colour families or every size lands under `colors`.
FONT_SIZE = re.compile(r"^text-(\d?xs|sm|md|lg|\d?xl)$")

def dtcg_type(name, value):
    if FONT_SIZE.match(name):
        return "dimension"
    if name in ("focus-ring", "focus-ring-danger"):
        return "shadow"
    if re.match(r"^(sand|brand|cocoa|caramel|peach|cream|success|warning|danger|surface|text|border|accent|overlay|code|media|focus-ring)", name):
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
    return "other"

def to_dtcg(tokens, modes):
    tree = {"$extensions": {VENDOR: {"modes": {m: MODES[m][2] for m in MODES}}}}
    for name, value in tokens.items():
        node = {"$value": to_alias(value, tokens), "$type": dtcg_type(name, value)}
        overrides = {m: to_alias(vals[name], tokens) for m, vals in modes.items()
                     if name in vals and vals[name] != value}
        if overrides:
            node["$extensions"] = {VENDOR: {"modes": overrides}}
        group, leaf = path_of(name)
        tree.setdefault(group, {})[leaf] = node
    return tree

def tailwind_preset(tokens):
    colors, space, radius, shadow, fontsize, z = {}, {}, {}, {}, {}, {}
    for name, value in tokens.items():
        ref = f"var(--{name})"
        if FONT_SIZE.match(name):
            fontsize[name[5:]] = ref
        elif dtcg_type(name, value) == "color":
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
    modes = {}
    for mode, (fname, pattern, _) in MODES.items():
        vals = block((ROOT / "tokens" / fname).read_text(), pattern)
        if not vals:
            raise SystemExit(f"no {mode} block found in tokens/{fname}")
        stray = sorted(set(vals) - set(tokens))
        if stray:
            raise SystemExit(f"{mode} sets tokens with no default value: {', '.join(stray)}")
        modes[mode] = vals
    dtcg = to_dtcg(tokens, modes)
    (ROOT / "tokens.json").write_text(json.dumps(dtcg, indent=2) + "\n")
    (ROOT / "tailwind.preset.js").write_text(tailwind_preset(tokens))
    print(f"tokens.json: {len(tokens)} tokens (DTCG); tailwind.preset.js written")

if __name__ == "__main__":
    main()
