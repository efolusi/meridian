#!/usr/bin/env python3
"""Fail on interactive controls inside components/ that cannot do anything.

A Button or IconButton rendered with no onClick, no handler spread, and no
type="submit" is a visible, labelled, focusable control that does nothing when
activated. It reads as broken to a sighted user and lies to a screen-reader
user, who is told there is a button worth pressing.

Components may only render such a control if the surrounding JSX makes it
conditional on a handler prop existing (the pattern used by PromptComposer and
ChatMessage), which this check approximates by requiring a handler-ish
attribute on the element itself.

Usage: python3 scripts/check_dead_controls.py
"""
import pathlib, re, sys

ROOT = pathlib.Path(__file__).resolve().parent.parent

# An element is "wired" if it carries any of these.
WIRED = re.compile(
    r"\bonClick\s*=|\bonPointerDown\s*=|\bonMouseDown\s*=|\bonKeyDown\s*=|"
    r"\{\.\.\.\w+\}|\btype\s*=\s*[\"{]?submit|\bhref\s*=|\bas\s*=\s*[\"{]?a\b"
)
TAG = re.compile(r"<(Button|IconButton)\b((?:[^<>]|\{[^{}]*\})*?)/?>", re.S)


def main():
    problems = []
    for path in sorted(ROOT.glob("components/*/*.jsx")):
        src = path.read_text()
        for m in TAG.finditer(src):
            tag, attrs = m.group(1), m.group(2)
            if WIRED.search(attrs):
                continue
            # a control whose props are forwarded wholesale is fine
            if re.search(r"\{\.\.\.", attrs):
                continue
            line = src[: m.start()].count("\n") + 1
            label = re.search(r'label\s*=\s*"([^"]*)"', attrs)
            problems.append(
                f"{path.relative_to(ROOT)}:{line}: <{tag}"
                f"{' label=' + label.group(1) if label else ''}> has no onClick "
                f"and no handler prop — it renders but does nothing"
            )

    if problems:
        print("Dead interactive controls found:\n")
        for p in problems:
            print("  " + p)
        print(
            "\nEither wire the control to a prop, or render it conditionally on that\n"
            "prop existing so it disappears when the caller cannot handle it."
        )
        return 1

    n = sum(1 for _ in ROOT.glob("components/*/*.jsx"))
    print(f"no dead Button/IconButton controls across {n} component sources")
    return 0


if __name__ == "__main__":
    sys.exit(main())
