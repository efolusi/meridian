#!/usr/bin/env python3
"""Reject unsafe prop serialization and malformed attributes in templates.

The DC runtime does not JSON-decode arbitrary attributes. Passing
``options='[...]'`` to Select/SegmentedControl therefore reaches React as a
string and crashes when the component calls ``options.map``. Collection props
must be supplied through a ``{{ renderValsName }}`` binding instead.
"""
from pathlib import Path
import re
import sys

ROOT = Path(__file__).resolve().parent.parent
BAD = re.compile(r"\b(options|items|data)\s*=\s*(['\"])\s*\[", re.IGNORECASE)
BROKEN_STYLE = re.compile(r"\bstyle\s*=\s*(['\"])[^'\"]*<", re.IGNORECASE)


def main():
    problems = []
    paths = [*ROOT.glob("starters/**/*.dc.html"), *ROOT.glob("site/*.dc.html"), *ROOT.glob("blocks/*.html")]
    for path in sorted(paths):
        source = path.read_text()
        for match in BAD.finditer(source):
            line = source[:match.start()].count("\n") + 1
            problems.append(f"{path.relative_to(ROOT)}:{line}: {match.group(1)} is a stringified array")
        for match in BROKEN_STYLE.finditer(source):
            line = source[:match.start()].count("\n") + 1
            problems.append(f"{path.relative_to(ROOT)}:{line}: '<' found inside a style attribute")
    if problems:
        print("Template contract problems found:\n")
        print("\n".join(f"  {problem}" for problem in problems))
        print("\nExpose the array from renderVals() and bind it with {{ name }}.")
        return 1
    print(f"template prop and attribute contracts passed ({len(paths)} files checked)")
    return 0


if __name__ == "__main__":
    sys.exit(main())
