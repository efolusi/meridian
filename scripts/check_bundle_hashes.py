#!/usr/bin/env python3
"""Verify _ds_bundle.js was compiled from the source files currently on disk.

The bundle header records a SHA-256 prefix per source file. A mismatch means the
committed bundle is stale: the page would run different code than the .jsx in the
repo. This is the gate that keeps source and artifact honest.

The compiler is not in this repository, so an outside contributor cannot fix a
mismatch on a component PR. CI passes --advisory for fork pull requests that
touch component sources, which reports the drift and exits 0; a maintainer
recompiles before merge. See CONTRIBUTING.md.

Usage: python3 scripts/check_bundle_hashes.py [--advisory]
"""
import hashlib, json, pathlib, sys

ROOT = pathlib.Path(__file__).resolve().parent.parent


def main():
    advisory = "--advisory" in sys.argv
    text = (ROOT / "_ds_bundle.js").read_text()
    header = text[: text.index("\n")]
    meta = json.loads(header[header.index("{"): header.rindex("}") + 1])
    hashes = meta["sourceHashes"]

    missing, stale = [], []
    for rel, recorded in hashes.items():
        path = ROOT / rel
        if not path.exists():
            missing.append(rel)
            continue
        actual = hashlib.sha256(path.read_bytes()).hexdigest()[: len(recorded)]
        if actual != recorded:
            stale.append(rel)

    if not missing and not stale:
        print(f"{len(hashes)} source hashes verified against _ds_bundle.js")
        return 0

    for rel in missing:
        print(f"  MISSING  {rel}: recorded in the bundle but not on disk")
    for rel in stale:
        print(f"  STALE    {rel}: source changed since the bundle was compiled")

    if advisory:
        print(
            f"\n{len(missing) + len(stale)} file(s) drifted. Reported only: this pull request "
            "cannot regenerate the bundle because the compiler is not in this repo.\n"
            "A maintainer will recompile before merge (see CONTRIBUTING.md)."
        )
        return 0

    print(
        f"\n{len(missing) + len(stale)} file(s) drifted from the compiled bundle.\n"
        "Recompile _ds_bundle.js so the artifact matches the sources."
    )
    return 1


if __name__ == "__main__":
    sys.exit(main())
