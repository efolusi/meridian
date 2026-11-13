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
import os, pathlib, re, sys

# CONTRAST_CSS lets the gate's own test point it at a deliberately broken copy.
CSS = pathlib.Path(os.environ.get("CONTRAST_CSS") or
                   pathlib.Path(__file__).resolve().parent.parent / "tokens" / "colors.css").read_text()


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


SURFACES = ["--surface-page", "--surface-card", "--surface-sunken", "--surface-subtle"]

# (foreground, [backgrounds], minimum ratio, what the pair guarantees)
# Every pair here is one a component actually paints; the comment names it.
PAIRS = [
    ("--text-primary", SURFACES, 4.5, "body text"),
    ("--text-secondary", SURFACES, 4.5, "secondary text"),
    ("--text-muted", SURFACES, 4.5, "muted text"),
    ("--text-link", SURFACES, 4.5, "links, Marker, Badge link"),
    ("--success-600", ["--success-100", "--surface-card"], 4.5, "status text"),
    ("--warning-600", ["--warning-100", "--surface-card"], 4.5, "status text"),
    ("--danger-600", ["--danger-100", "--surface-card"], 4.5, "status text"),
    ("--accent-contrast", ["--accent"], 4.5, "text on accent"),
    ("--accent-subtle-fg", ["--accent-subtle"], 4.5, "text and icons on the accent tint"),
    ("--danger-contrast", ["--danger-600", "--danger-700"], 4.5, "danger button normal and hover text"),
    ("--success-contrast", ["--success-600"], 4.5, "FileTypeIcon label on the green fill"),
    ("--warning-contrast", ["--warning-600"], 4.5, "FileTypeIcon label on the amber fill"),
    ("--text-on-brand", ["--brand-700", "--brand-800", "--sand-600", "--sand-800"], 4.5,
     "brand Button (rest, hover) and FileTypeIcon labels on fixed fills"),
    ("--brand-950", ["--brand-500", "--sand-500"], 4.5, "FileTypeIcon ink label on fixed light fills"),
    ("--text-inverse", ["--surface-inverse"], 4.5, "Toast text"),
    ("--text-on-brand-muted", ["--surface-brand"], 4.5, "muted text on the brand surface"),
    # The code surface is fixed dark in both themes, so are these inks.
    ("--text-code", ["--surface-code"], 4.5, "code text"),
    ("--code-ink", ["--surface-code"], 4.5, "terminal output"),
    ("--code-ink-strong", ["--surface-code"], 4.5, "control labels on code"),
    ("--code-ink-muted", ["--surface-code"], 4.5, "resting copy button"),
    ("--code-ink-subtle", ["--surface-code"], 4.5, "language and host labels, Terminal timestamps"),
    # Terminal timestamps moved to --code-ink-subtle (5.97:1); --code-ink-faint paints no text.
    ("--success-on-dark", ["--surface-code"], 4.5, "Terminal ok lines"),
    ("--danger-on-dark", ["--surface-code"], 4.5, "Terminal error lines"),
    ("--text-on-media", ["--media-backdrop"], 4.5, "GeneratedImage prompt"),
    ("--text-on-media-muted", ["--media-backdrop"], 4.5, "GeneratedImage status line"),
    # WCAG 1.4.11 — a form control's edge is its only boundary, so it needs 3:1
    # on every surface a field can sit on.
    ("--border-control", SURFACES, 3.0, "form-control edge"),
    ("--border-control-hover", SURFACES, 3.0, "form-control edge on hover"),
    # WCAG 1.4.11 — the focus indicator must be distinguishable from whatever it
    # sits on. The inner offset ring is surface-coloured, so the outer ring only
    # ever borders a surface, never a control fill.
    ("--focus-ring-color", SURFACES + ["--focus-ring-offset"], 3.0, "focus indicator"),
    # Toast status icons (non-text, 3:1). Light uses these on the dark inverse
    # surface; in dark Toast swaps to the strong status tokens on a light one.
    # Dark success and warning icons are color-mix(in srgb, <tone> 60%, --text-inverse).
    ("mix(--success-600 60%, --text-inverse)", ["--surface-inverse"], 3.0, "Toast success icon (dark theme)"),
    ("--danger-600", ["--surface-inverse"], 3.0, "Toast danger icon (dark theme)"),
    ("mix(--warning-600 60%, --text-inverse)", ["--surface-inverse"], 3.0, "Toast warning icon (dark theme)"),
    ("--success-on-dark", ["--surface-inverse"], 3.0, "Toast success icon (light theme)"),
    ("--danger-on-dark", ["--surface-inverse"], 3.0, "Toast danger icon (light theme)"),
    ("--warning-on-dark", ["--surface-inverse"], 3.0, "Toast warning icon (light theme)"),
    # Chart series marks (non-text, 3:1) on the surfaces a chart sits on.
    ("--chart-1", ["--surface-card", "--surface-page"], 3.0, "chart series 1"),
    ("--chart-2", ["--surface-card", "--surface-page"], 3.0, "chart series 2"),
    ("--chart-3", ["--surface-card", "--surface-page"], 3.0, "chart series 3"),
    ("--chart-4", ["--surface-card", "--surface-page"], 3.0, "chart series 4"),
    ("--chart-5", ["--surface-card", "--surface-page"], 3.0, "chart series 5"),
]

# Light chart slots 3 (green) and 5 (pink) sit near 2.7:1. Darkening them would
# break the palette's lightness band and colour-blind separation, so these marks
# never carry identity alone: DonutChart always renders a text legend with values
# and a hidden data table, and Chart configs pair series with ChartLegendContent.
# Measured and printed; a pair that reaches 3:1 fails the gate until removed here.
LABELLED_MARKS = {
    ("light", f"--chart-{n}", bg) for n in (3, 5) for bg in ("--surface-card", "--surface-page")
}

# Pairs that fail today and need a visual decision from the owner before the
# token moves (see the 2026-11-12 review). They are reported, not hidden: a pair
# listed here that starts passing fails the gate until it is removed, so the
# list can only shrink. Anything not listed fails as usual.
KNOWN_FAILURES = {
}

# Toast paints the -on-dark icon tokens only in light (on the dark inverse
# surface) and the -600 tokens only in dark (on the light one). The other
# combinations never reach a screen, so they are not measured.
NOT_PAINTED = {("dark", f"--{tone}-on-dark", "--surface-inverse") for tone in ("success", "danger", "warning")}
NOT_PAINTED |= {("light", f"--{tone}-600", "--surface-inverse") for tone in ("success", "danger", "warning")}
NOT_PAINTED |= {("light", f"mix(--{tone}-600 60%, --text-inverse)", "--surface-inverse") for tone in ("success", "warning")}

MIX = re.compile(r"mix\((--[\w-]+) (\d+)%, (--[\w-]+)\)")


def mix_hex(spec, table, fallback, bg):
    """color-mix(in srgb, A p%, B): per-channel interpolation of sRGB values."""
    a_tok, pct, b_tok = MIX.fullmatch(spec).groups()
    a, b = to_hex(resolve(a_tok, table, fallback), over=bg), to_hex(resolve(b_tok, table, fallback), over=bg)
    if a is None or b is None:
        return None
    w = int(pct) / 100
    ch = lambda h, i: int(h[1 + 2 * i:3 + 2 * i], 16)
    return "#" + "".join(f"{round(ch(a, i) * w + ch(b, i) * (1 - w)):02x}" for i in range(3))

light = tokens("light")
dark = tokens("dark")
failures, unresolved, stale, tolerated, checked = [], [], [], [], 0

for theme, table, fallback in (("light", light, None), ("dark", dark, light)):
    for fg_tok, bg_toks, minimum, label in PAIRS:
        fg_raw = resolve(fg_tok, table, fallback)
        for bg_tok in bg_toks:
            key = (theme, fg_tok, bg_tok)
            if key in NOT_PAINTED:
                continue
            bg = to_hex(resolve(bg_tok, table, fallback))
            if bg is None:
                unresolved.append((theme, bg_tok, "background is not an opaque colour"))
                continue
            fg = mix_hex(fg_tok, table, fallback, bg) if fg_tok.startswith("mix(") else to_hex(fg_raw, over=bg)
            if fg is None:
                unresolved.append((theme, fg_tok, "foreground did not resolve to a colour"))
                continue
            r = ratio(fg, bg)
            checked += 1
            ok = r >= minimum
            labelled = key in LABELLED_MARKS
            known = key in KNOWN_FAILURES or labelled
            status = "ok  " if ok else ("LABEL" if labelled else "KNOWN" if known else "FAIL")
            print(f"{status:5s} {theme:5s} {fg_tok:22s} on {bg_tok:20s} "
                  f"{r:5.2f}:1  (min {minimum}, {label})")
            if ok and known:
                stale.append(key)
            elif not ok and known:
                tolerated.append(key)
            elif not ok:
                failures.append((theme, fg_tok, bg_tok, r, minimum))

if unresolved:
    print("\nunresolved tokens (a pair that cannot be measured is a failure, not a pass):")
    for theme, tok, why in unresolved:
        print(f"  {theme:5s} {tok}: {why}")

if stale:
    print("\nnow passing, remove from KNOWN_FAILURES or LABELLED_MARKS:")
    for key in stale:
        print(f"  {key}")

if failures or unresolved or stale:
    if failures:
        print(f"\n{len(failures)} pair(s) under their minimum ratio")
    sys.exit(1)

labelled = sum(1 for key in tolerated if key in LABELLED_MARKS)
print(f"\nall {checked - len(tolerated)} pairs pass (4.5:1 text, 3:1 non-text); "
      f"{len(tolerated) - labelled} known failure(s) await an owner decision; "
      f"{labelled} chart mark(s) under 3:1 rely on their text legend")
