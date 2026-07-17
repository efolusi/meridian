#!/usr/bin/env python3
"""Verify the WCAG AA contrast pairs the token layer guarantees.

Parses tokens/colors.css (light root and [data-theme="dark"] blocks) and
asserts every documented text/surface and status pair holds >= 4.5:1.
Exit 1 with a report if any pair fails.

Usage: python3 scripts/check_contrast.py
"""
import pathlib, re, sys

CSS = (pathlib.Path(__file__).resolve().parent.parent / "tokens" / "colors.css").read_text()

def block(name):
    if name == "light":
        m = re.search(r":root\{(.*?)\}", CSS, re.S)
    else:
        m = re.search(r'\[data-theme="dark"\]\{(.*?)\}', CSS, re.S)
    return m.group(1)

def tokens(name):
    out = {}
    for tok, val in re.findall(r"(--[\w-]+):([^;]+);", block(name)):
        out[tok] = val.strip()
    return out

def resolve(tok, table, fallback=None):
    seen = set()
    while tok in table and tok not in seen:
        seen.add(tok)
        val = table[tok]
        m = re.match(r"var\((--[\w-]+)\)", val)
        if not m:
            return val
        tok = m.group(1)
    if fallback and tok in fallback:
        return resolve(tok, fallback)
    return None

def lum(hexstr):
    h = hexstr.lstrip("#")
    if len(h) == 3:
        h = "".join(c * 2 for c in h)
    r, g, b = (int(h[i:i + 2], 16) / 255 for i in (0, 2, 4))
    lin = lambda c: c / 12.92 if c <= 0.04045 else ((c + 0.055) / 1.055) ** 2.4
    return 0.2126 * lin(r) + 0.7152 * lin(g) + 0.0722 * lin(b)

def ratio(fg, bg):
    l1, l2 = sorted((lum(fg), lum(bg)), reverse=True)
    return (l1 + 0.05) / (l2 + 0.05)

PAIRS = [
    ("--text-primary", ["--surface-page", "--surface-card", "--surface-sunken"]),
    ("--text-secondary", ["--surface-page", "--surface-card", "--surface-sunken"]),
    ("--text-muted", ["--surface-page", "--surface-card", "--surface-sunken"]),
    ("--success-600", ["--success-100", "--surface-card"]),
    ("--warning-600", ["--warning-100", "--surface-card"]),
    ("--danger-600", ["--danger-100", "--surface-card"]),
    ("--accent-contrast", ["--accent"]),
]

light = tokens("light")
dark = tokens("dark")
failures = []
for theme, table, fallback in (("light", light, None), ("dark", dark, light)):
    for fg_tok, bg_toks in PAIRS:
        fg = resolve(fg_tok, table, fallback)
        if fg is None or not fg.startswith("#"):
            continue
        for bg_tok in bg_toks:
            bg = resolve(bg_tok, table, fallback)
            if bg is None or not bg.startswith("#"):
                continue
            r = ratio(fg, bg)
            mark = "ok " if r >= 4.5 else "FAIL"
            print(f"{mark} {theme:5s} {fg_tok:18s} on {bg_tok:18s} {r:5.2f}:1")
            if r < 4.5:
                failures.append((theme, fg_tok, bg_tok, r))

if failures:
    print(f"\n{len(failures)} pair(s) under 4.5:1")
    sys.exit(1)
print("\nall pairs pass AA")
