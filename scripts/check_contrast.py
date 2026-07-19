#!/usr/bin/env python3
"""Verify the WCAG contrast pairs the token layer guarantees.

Parses tokens/colors.css (light :root and [data-theme="dark"] blocks) and asserts:
  - text/surface and status pairs hold >= 4.5:1 (WCAG 1.4.3 AA)
  - non-text UI pairs (the focus indicator) hold >= 3:1 (WCAG 1.4.11)

Alpha colours are composited over their background before measuring, so a
semi-transparent token can no longer slip through unmeasured. A pair whose
tokens cannot be resolved to a colour is a hard failure, not a silent skip.

Exit 1 with a report if any pair fails.

Usage: python3 scripts/check_contrast.py
"""
import pathlib, re, sys

CSS = (pathlib.Path(__file__).resolve().parent.parent / "tokens" / "colors.css").read_text()


def block(name):
    if name == "light":
        m = re.search(r":root\{(.*?)\n\}", CSS, re.S)
    else:
        m = re.search(r'\[data-theme="dark"\]\{(.*?)\n\}', CSS, re.S)
    if not m:
        sys.exit(f"could not locate the {name} token block in tokens/colors.css")
    return m.group(1)


def tokens(name):
    return {tok: val.strip() for tok, val in re.findall(r"(--[\w-]+):([^;]+);", block(name))}


def resolve(tok, table, fallback=None):
    """Follow a var() chain, re-checking the active theme table at every hop.

    Per-hop lookup matters: --focus-ring-offset is declared once in :root as
    var(--surface-card), but --surface-card is remapped in dark. Resolving the
    whole chain in one table would report the light surface for the dark theme.
    """
    seen = set()
    cur = tok
    while cur not in seen:
        seen.add(cur)
        val = table.get(cur)
        if val is None and fallback is not None:
            val = fallback.get(cur)
        if val is None:
            return None
        val = val.split("/*")[0].strip()
        m = re.match(r"var\((--[\w-]+)\)", val)
        if not m:
            return val
        cur = m.group(1)
    return None


def to_hex(val, over=None):
    """Return an opaque #RRGGBB for a hex or rgb()/rgba() value.

    A translucent colour is composited over `over` (an opaque hex). Returns None
    if the value is not a colour, or is translucent with no background given.
    """
    if val is None:
        return None
    val = val.strip()
    if val.startswith("#"):
        h = val.lstrip("#")
        if len(h) == 3:
            h = "".join(c * 2 for c in h)
        return "#" + h.upper() if len(h) == 6 else None
    m = re.match(r"rgba?\(\s*([\d.]+)[,\s]+([\d.]+)[,\s]+([\d.]+)\s*(?:[,/]\s*([\d.]+)\s*)?\)", val)
    if not m:
        return None
    r, g, b = (int(float(m.group(i))) for i in (1, 2, 3))
    a = float(m.group(4)) if m.group(4) else 1.0
    if a >= 1:
        return "#%02X%02X%02X" % (r, g, b)
    if over is None:
        return None
    o = over.lstrip("#")
    br, bg, bb = (int(o[i:i + 2], 16) for i in (0, 2, 4))
    return "#%02X%02X%02X" % (
        round(a * r + (1 - a) * br),
        round(a * g + (1 - a) * bg),
        round(a * b + (1 - a) * bb),
    )


def lum(hexstr):
    h = hexstr.lstrip("#")
    r, g, b = (int(h[i:i + 2], 16) / 255 for i in (0, 2, 4))
    lin = lambda c: c / 12.92 if c <= 0.04045 else ((c + 0.055) / 1.055) ** 2.4
    return 0.2126 * lin(r) + 0.7152 * lin(g) + 0.0722 * lin(b)


def ratio(fg, bg):
    l1, l2 = sorted((lum(fg), lum(bg)), reverse=True)
    return (l1 + 0.05) / (l2 + 0.05)


SURFACES = ["--surface-page", "--surface-card", "--surface-sunken"]

# (foreground, [backgrounds], minimum ratio, what the pair guarantees)
PAIRS = [
    ("--text-primary", SURFACES, 4.5, "body text"),
    ("--text-secondary", SURFACES, 4.5, "secondary text"),
    ("--text-muted", SURFACES, 4.5, "muted text"),
    ("--success-600", ["--success-100", "--surface-card"], 4.5, "status text"),
    ("--warning-600", ["--warning-100", "--surface-card"], 4.5, "status text"),
    ("--danger-600", ["--danger-100", "--surface-card"], 4.5, "status text"),
    ("--accent-contrast", ["--accent"], 4.5, "text on accent"),
    # WCAG 1.4.11 — the focus indicator must be distinguishable from whatever it
    # sits on. The inner offset ring is surface-coloured, so the outer ring only
    # ever borders a surface, never a control fill.
    ("--focus-ring-color", SURFACES + ["--focus-ring-offset"], 3.0, "focus indicator"),
]

light = tokens("light")
dark = tokens("dark")
failures, unresolved, checked = [], [], 0

for theme, table, fallback in (("light", light, None), ("dark", dark, light)):
    for fg_tok, bg_toks, minimum, label in PAIRS:
        fg_raw = resolve(fg_tok, table, fallback)
        for bg_tok in bg_toks:
            bg = to_hex(resolve(bg_tok, table, fallback))
            if bg is None:
                unresolved.append((theme, bg_tok, "background is not an opaque colour"))
                continue
            fg = to_hex(fg_raw, over=bg)
            if fg is None:
                unresolved.append((theme, fg_tok, "foreground did not resolve to a colour"))
                continue
            r = ratio(fg, bg)
            checked += 1
            ok = r >= minimum
            print(f"{'ok  ' if ok else 'FAIL'} {theme:5s} {fg_tok:20s} on {bg_tok:20s} "
                  f"{r:5.2f}:1  (min {minimum}, {label})")
            if not ok:
                failures.append((theme, fg_tok, bg_tok, r, minimum))

if unresolved:
    print("\nunresolved tokens (a pair that cannot be measured is a failure, not a pass):")
    for theme, tok, why in unresolved:
        print(f"  {theme:5s} {tok}: {why}")

if failures or unresolved:
    if failures:
        print(f"\n{len(failures)} pair(s) under their minimum ratio")
    sys.exit(1)

print(f"\nall {checked} pairs pass (4.5:1 text, 3:1 non-text)")
