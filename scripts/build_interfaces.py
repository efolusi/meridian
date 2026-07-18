#!/usr/bin/env python3
"""Extract data sub-interfaces (TableColumn, TabItem, ...) from the .d.ts files
into site/interfaces.json, so the docs prop tables can expand a prop typed
`TableColumn[]` into that interface's own fields.

Only interfaces referenced by a component prop type are emitted, and only the
data shapes (not the *Props interfaces themselves).

Usage: python3 scripts/build_interfaces.py
Idempotent; run after editing component .d.ts files.
"""
import json, pathlib, re

ROOT = pathlib.Path(__file__).resolve().parent.parent

def parse_interfaces(text):
    """Return {InterfaceName: [{n,t,req,d}]} for every `interface X { ... }`."""
    out = {}
    for m in re.finditer(r"interface\s+(\w+)\s*\{", text):
        name = m.group(1)
        # find the matching closing brace
        depth, i = 1, m.end()
        while i < len(text) and depth:
            if text[i] == "{": depth += 1
            elif text[i] == "}": depth -= 1
            i += 1
        body = text[m.end():i - 1]
        fields, doc = [], ""
        for line in body.splitlines():
            s = line.strip()
            if not s:
                continue
            dm = re.match(r"/\*\*\s*(.*?)\s*\*/", s)
            if dm:
                doc = dm.group(1); continue
            if s.startswith("//"):
                doc = s[2:].strip(); continue
            fm = re.match(r"(\w+)(\??)\s*:\s*(.+?);?$", s)
            if fm:
                fields.append({"n": fm.group(1), "t": fm.group(3).rstrip(";").strip(),
                               "req": fm.group(2) != "?", "d": doc})
                doc = ""
        if fields:
            out[name] = fields
    return out

def main():
    all_ifaces = {}
    for f in ROOT.glob("components/*/*.d.ts"):
        all_ifaces.update(parse_interfaces(f.read_text()))
    # which interfaces are referenced by a component prop type?
    reg = (ROOT / "site" / "registry.js").read_text()
    groups = json.loads(reg[reg.index("GROUPS = ") + 9: reg.rindex(";")])
    referenced = set()
    for g in groups:
        for it in g.get("items", []):
            for p in it.get("props", []):
                for nm in re.findall(r"\b([A-Z]\w+)\b", p.get("t") or ""):
                    if nm in all_ifaces and not nm.endswith("Props"):
                        referenced.add(nm)
    emitted = {k: all_ifaces[k] for k in sorted(referenced)}
    (ROOT / "site" / "interfaces.json").write_text(json.dumps(emitted, separators=(",", ":")) + "\n")
    print(f"interfaces.json: {len(emitted)} referenced sub-interfaces ({', '.join(sorted(emitted))})")

if __name__ == "__main__":
    main()
