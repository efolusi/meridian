#!/usr/bin/env python3
"""Generate llms-full.txt — the single-file AI corpus for the design system.

An agent that can fetch exactly one URL gets the entire system: the llms.txt
intro and install paths, every component's public exports, prompt guidance and
typed props interface, and the design-token vocabulary.

Everything is derived from committed sources, never hand-written here:
  header      — intro and install snippets copied out of llms.txt at
                generation time, so the two files cannot drift apart
  components  — components/<group>/<Name>.{jsx,prompt.md,d.ts}
  tokens      — custom property names declared in tokens/*.css (names only;
                values drift, names are the API)

Output is deterministic (sorted, no timestamps), which is what makes the
staleness gate in scripts/check_all.mjs meaningful.

Usage: python3 scripts/build_llms.py
Idempotent; run after editing llms.txt, any component file, or tokens/*.css.
"""
import pathlib, re

ROOT = pathlib.Path(__file__).resolve().parent.parent
OUT = ROOT / "llms-full.txt"


def llms_txt_sections():
    """Return (intro, usage) copied verbatim from llms.txt.

    intro — everything after the `# Meridian` title up to `## Start here`
            (the description blockquote, links line, and layout paragraph).
    usage — the body of the `## Usage` section (namespace snippet, CDN tags,
            npm install block, theming rules).
    """
    text = (ROOT / "llms.txt").read_text()

    def between(start, end):
        i = text.index(start) + len(start)
        j = text.index(end, i)
        return text[i:j].strip("\n")

    intro = between("# Meridian\n", "## Start here")
    usage = between("## Usage\n", "## More")
    return intro.rstrip(), usage.rstrip()


def public_exports(jsx_text):
    """Capitalised `export function` / `export const` names, in source order."""
    names = re.findall(r"^export\s+(?:function|const)\s+([A-Z]\w*)", jsx_text, re.M)
    seen = []
    for n in names:
        if n not in seen:
            seen.append(n)
    return seen


def fenced(text, info=""):
    """Fence `text` with more backticks than any run it contains."""
    longest = max((len(m) for m in re.findall(r"`+", text)), default=0)
    fence = "`" * max(3, longest + 1)
    return f"{fence}{info}\n{text.rstrip()}\n{fence}"


def component_entries():
    """[(group, name, exports, prompt, dts)] sorted by group then name."""
    entries = []
    for jsx in sorted(ROOT.glob("components/*/*.jsx")):
        group, name = jsx.parent.name, jsx.stem
        prompt = jsx.with_name(f"{name}.prompt.md")
        dts = jsx.with_name(f"{name}.d.ts")
        for sibling in (prompt, dts):
            if not sibling.exists():
                raise SystemExit(f"build_llms: {jsx} has no {sibling.name} — "
                                 "every component ships all three flat files")
        entries.append((group, name, public_exports(jsx.read_text()),
                        prompt.read_text().rstrip(), dts.read_text().rstrip()))
    return entries


def token_names_by_file():
    """{'tokens/colors.css': [--name, ...]} — declared names, unique, sorted."""
    out = {}
    for css_file in sorted((ROOT / "tokens").glob("*.css")):
        css = re.sub(r"/\*.*?\*/", "", css_file.read_text(), flags=re.S)
        names = sorted(set(re.findall(r"(--[\w-]+)\s*:", css)))
        out[f"tokens/{css_file.name}"] = names
    return out


def main():
    intro, usage = llms_txt_sections()
    components = component_entries()
    tokens = token_names_by_file()
    groups = sorted({g for g, *_ in components})

    parts = [
        "# Meridian — llms-full.txt",
        "The entire design system in one file, generated from llms.txt, "
        "components/*/, and tokens/*.css by scripts/build_llms.py. "
        "Do not edit by hand. The short map of the repository is /llms.txt.",
        intro,
        "## Install\n\n" + usage,
        f"## Components\n\n{len(components)} components across "
        f"{len(groups)} groups: {', '.join(groups)}. Each entry lists the "
        "component's public exports, its usage guidance (.prompt.md), and its "
        "typed props interface (.d.ts).",
    ]

    for group in groups:
        parts.append(f"### {group}")
        for g, name, exports, prompt, dts in components:
            if g != group:
                continue
            parts.append(
                f"#### {name}\n\n"
                f"Group: {group} · Source: /components/{group}/{name}.jsx · "
                f"Exports: {', '.join(exports)}\n\n"
                f"{prompt}\n\n"
                f"{fenced(dts, 'ts')}"
            )

    token_count = sum(len(v) for v in tokens.values())
    parts.append(
        f"## Design tokens\n\n{token_count} custom property names by file "
        "(names only — resolve current values from /styles.css, which imports "
        "these files, or /tokens.json):"
    )
    for fname, names in tokens.items():
        body = "\n".join(names) if names else "(no custom properties — font-face declarations only)"
        parts.append(f"### /{fname}\n\n{body}")

    parts.append(
        "## More\n\n"
        "- /llms.txt — the short map of this repository\n"
        "- /site/registry.json — machine-readable registry index; "
        "per-item install files in /site/registry/\n"
        "- /guidelines/ — accessibility, forms, governance"
    )

    OUT.write_text("\n\n".join(parts) + "\n")
    print(f"llms-full.txt: {len(components)} components in {len(groups)} groups, "
          f"{token_count} token names, {OUT.stat().st_size} bytes")


if __name__ == "__main__":
    main()
