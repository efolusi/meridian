#!/usr/bin/env python3
"""Keep directional component layout on CSS logical properties.

Physical spacing, alignment, borders and corners are always semantic mistakes in
component source. Physical ``left``/``right`` coordinates are allowed only for
geometry that is explicitly viewport-, pointer-, chart- or shape-relative, or
for APIs whose public placement value is literally ``left``/``right``.

The coordinate allowlist is intentionally line-pattern based: a new physical
coordinate must be reviewed and documented here instead of silently expanding
the RTL surface area.
"""
from pathlib import Path
import re
import sys

ROOT = Path(__file__).resolve().parent.parent

SEMANTIC_PHYSICAL = re.compile(
    r"(?:margin|padding)-(?:left|right)\s*:|"
    r"text-align\s*:\s*(?:left|right)\b|"
    r"border-(?:left|right)(?:-[a-z]+)?\s*:|"
    r"border-(?:top|bottom)-(?:left|right)-radius\s*:|"
    r"\b(?:marginLeft|marginRight|paddingLeft|paddingRight|"
    r"borderLeft|borderRight|borderTopLeftRadius|borderTopRightRadius|"
    r"borderBottomLeftRadius|borderBottomRightRadius)\s*:"
)
PHYSICAL_INSET = re.compile(r"(?<![\w-])(?:left|right)\s*:")

# path -> fragments that identify reviewed physical-coordinate lines.
COORDINATE_EXCEPTIONS = {
    "components/ai/Conversation.jsx": ["left:50%"],
    "components/ai/SelectionQuote.jsx": ["left: pos.left", "left: 0"],
    "components/data/LineChart.jsx": ["left: cssPct("],
    "components/display/Carousel.jsx": ["left:50%", "scrollTo({ left:"],
    "components/display/Resizable.jsx": ["left:4px", "left:0;right:0"],
    "components/feedback/Tooltip.jsx": [
        "left:var(--ef-tt-arrow,50%)",
        "left:100%",
        "left:auto;right:100%",
        "left: 0",
        "left: Math.round(left)",
    ],
    "components/files/FileTypeIcon.jsx": ["left:50%"],
    "components/navigation/PageControl.jsx": ["left:50%"],
    # Context menus open at a physical pointer coordinate, independent of text direction.
    "components/overlay/ContextMenu.jsx": ["left: root.point.x"],
    "components/overlay/Drawer.jsx": ["right:0", "left:0"],
    "components/overlay/Sheet.jsx": ["right:0", "left:0"],
    "components/overlay/Portal.jsx": [
        "left:0",
        "left: 0, right: 'auto'",
        "left: Math.round(left), right: 'auto'",
    ],
}

# These borders draw arrows or edges for a public physical-side placement.
SEMANTIC_EXCEPTIONS = {
    "components/feedback/Tooltip.jsx": [
        "ef-tooltip__bubble--left::after",
        "ef-tooltip__bubble--right::after",
    ],
    "components/overlay/Drawer.jsx": ["ef-drawer--left", "ef-drawer--right"],
    "components/overlay/Sheet.jsx": ["ef-sheet[data-side=left]", "ef-sheet[data-side=right]"],
}


def allowed(path, line, table):
    return any(fragment in line for fragment in table.get(path, []))


def main():
    problems = []
    for file in sorted((ROOT / "components").glob("*/*.jsx")):
        rel = file.relative_to(ROOT).as_posix()
        for number, line in enumerate(file.read_text().splitlines(), 1):
            if line.lstrip().startswith("//"):
                continue
            if SEMANTIC_PHYSICAL.search(line) and not allowed(rel, line, SEMANTIC_EXCEPTIONS):
                problems.append(f"{rel}:{number}: semantic physical property: {line.strip()}")
            if PHYSICAL_INSET.search(line) and not allowed(rel, line, COORDINATE_EXCEPTIONS):
                problems.append(f"{rel}:{number}: unreviewed physical coordinate: {line.strip()}")

    if problems:
        print("Directional CSS regressions found:\n")
        print("\n".join(f"  {problem}" for problem in problems))
        print("\nUse logical properties, or document a genuinely physical coordinate in the allowlist.")
        return 1

    print("component direction safety: logical properties plus reviewed physical-coordinate exceptions")
    return 0


if __name__ == "__main__":
    sys.exit(main())
