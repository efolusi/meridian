#!/usr/bin/env python3
"""Fail when a component gains a new raw colour literal.

Components are supposed to style against semantic tokens only, so that dark
theme and compact density come free. Some genuinely cannot — a code surface that
is fixed dark in both themes, a media scrim over an image — and there is real
existing debt besides. Failing on all of it would just mean disabling the check.

So this is a ratchet: the current count per file is recorded in
scripts/token_adherence_baseline.json, and the build fails only when a file goes
above its baseline. Lowering a baseline is always allowed and is recorded on the
next run, so the debt can only shrink.

Usage:
  python3 scripts/check_token_adherence.py            # fail on regressions
  python3 scripts/check_token_adherence.py --update   # re-record the baseline
"""
import json, pathlib, re, sys

ROOT = pathlib.Path(__file__).resolve().parent.parent
BASELINE = ROOT / "scripts" / "token_adherence_baseline.json"

# A colour written as a literal rather than referenced through a token.
LITERAL = re.compile(r"#[0-9a-fA-F]{3,8}\b|rgba?\(\s*\d")


def counts():
    out = {}
    for path in sorted(ROOT.glob("components/*/*.jsx")):
        n = len(LITERAL.findall(path.read_text()))
        if n:
            out[str(path.relative_to(ROOT))] = n
    return out


def main():
    now = counts()
    total = sum(now.values())

    if "--update" in sys.argv:
        BASELINE.write_text(json.dumps(dict(sorted(now.items())), indent=2) + "\n")
        print(f"baseline recorded: {total} raw colour literals across {len(now)} files")
        return 0

    if not BASELINE.exists():
        print("no baseline; run with --update first")
        return 1
    base = json.loads(BASELINE.read_text())

    regressions = [(f, n, base.get(f, 0)) for f, n in now.items() if n > base.get(f, 0)]
    improved = [(f, base[f], now.get(f, 0)) for f in base if now.get(f, 0) < base[f]]

    for f, n, b in regressions:
        print(f"  REGRESSION {f}: {b} -> {n} raw colour literals")
    if regressions:
        print(f"\n{len(regressions)} file(s) gained raw colours. Use a semantic token, or if the"
              f"\ncolour is genuinely fixed in both themes, add one to tokens/ and reference it.")
        return 1

    if improved:
        print(f"{len(improved)} file(s) improved — re-record with --update:")
        for f, b, n in improved[:5]:
            print(f"  {f}: {b} -> {n}")

    baseline_total = sum(base.values())
    print(f"no new raw colours ({total} known, baseline {baseline_total}, across {len(now)} files)")
    return 0


if __name__ == "__main__":
    sys.exit(main())
