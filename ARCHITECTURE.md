# Architecture

How Meridian's pieces fit together, what is generated versus authored, and the rules that keep the repository coherent. Read this before moving, renaming, or adding files.

## The shape, and why

```
meridian/
├── styles.css · tokens/ · assets/       # system core — the vendoring API
├── _ds_bundle.js · _ds_manifest.json    # compiler output (generated, committed)
├── _adherence.oxlintrc.json · thumbnail.html · index.html
├── components/<group>/                  # the library: lift code from here
├── blocks/                              # pre-composed sections: paste from here
├── showcases/<app>/                     # example apps: see the system in use
├── starters/<journey>/                  # copyable journeys: start a surface here
├── site/                                # the docs website: consumes all of the above
├── guidelines/ · skills/ · scripts/
└── governance docs (README, STYLEGUIDE, CONTRIBUTING, …)
```

Three principles produced this layout:

1. **The root is a contract.** `styles.css`, `tokens/`, and `assets/` are what consumers link when they vendor the folder, and the DS compiler writes `_ds_bundle.js`, `_ds_manifest.json`, `_adherence.oxlintrc.json`, and `thumbnail.html` at the root. These paths are pinned by tooling we do not control from this repo. They never move.
2. **Shallow beats deep.** Pages resolve the root by counted `../` segments, so every authored page lives at most two directories down. Depth is a bug factory here; keep it flat.
3. **The site consumes, it does not own.** Component, block, and example-app source live in their own directories; `site/` renders them. An earlier layout nested source inside the docs app and buried half the repo six levels deep; it was reverted.

## The pipeline

- Components are plain `.jsx` files styling against semantic tokens only. Each calls `injectEfCss(id, css)` and is compiled by an **external DS compiler** into `_ds_bundle.js`, which attaches every export to `window.EfolusiDesignSystem_4ffc3d`.
- Pages load `react`, `react-dom`, and the bundle, then read components off that namespace. `.dc.html` pages additionally use the `x-dc` runtime in `support.js`.
- `Icon` fetches `assets/icons/<name>.svg` relative to the **bundle script's URL**, not the page URL. Root placement of `_ds_bundle.js` is therefore load-bearing.
- Each starter (and `site/`) carries its own `ds-base.js` (one `base` line pointing at the root) and a copy of `support.js`, so a copied folder works standalone. The copies must stay byte-identical; `scripts/check_runtime_copies.py` enforces that.

## Generated versus authored

| Path | Written by | Committed because |
|---|---|---|
| `_ds_bundle.js` | DS compiler | zero-build distribution: pages run from it directly |
| `_ds_manifest.json` | DS compiler | machine-readable inventory for tools and agents |
| `_adherence.oxlintrc.json` | DS compiler | token/prop adherence rules for linting |
| `site/registry.json`, `site/registry/*.json` | `scripts/build_registry.py` | open-schema registry items; any static host can serve them |

Everything else is authored by hand. Never edit generated files directly, with one documented exception: when a source string that is embedded in the bundle must change before a recompile is possible, apply the identical replacement to both files in the same commit ("lockstep edit") and note it in the commit message.

### The bundle format, for whoever vendors the compiler in

The compiler living outside this repo is the project's single biggest structural limit: an outside contributor cannot regenerate `_ds_bundle.js`, so component PRs cannot be verified by CI or by the contributor. Replacing or vendoring it is the highest-value work available. This is the format it emits, recovered by reading the artifact, so a replacement can be checked against the committed bundle.

**File shape.** Line 1 is `/* @ds-bundle: {…} */` carrying `format: 4`, `namespace`, `version`, `components` (one entry per exported name, `{name, sourcePath}`), `sourceHashes` (path → first 12 hex of the source's SHA-256, keys sorted by path), `inlinedExternals`, and `unexposedExports` (exports deliberately kept off the public namespace: `injectEfCss`, `computeDiff`, `formatTime`). Then a single IIFE that defines `__ds_ns` (the window global), a private `__ds_scope = {}`, and `__ds_ns.__errors`. Then one unit per source file. Then an epilogue of `__ds_ns.X = __ds_scope.X;` for every exposed export.

**Unit shape.** Each unit is:

```js
// <repo-relative source path>
try { (() => {
<source compiled with Babel preset "react", imports stripped>
Object.assign(__ds_scope, { <exported names> });
})(); } catch (e) { __ds_ns.__errors.push({ path: "<path>", error: String((e && e.message) || e) }); }
```

Bare imports (`react`) are dropped — React is read off the global. Relative imports are erased and every reference to the imported binding is rewritten to `__ds_scope.<local>` (including JSX identifiers, which become `<__ds_scope.Name>`). A unit that throws is caught and recorded in `__ds_ns.__errors` rather than taking the page down.

**Unit order** is dependency-respecting: components before showcases, and within that a file is emitted only once its relative imports have been. Order is not load-bearing at runtime — every cross-unit reference resolves inside a function body, not at unit evaluation — so a replacement compiler may order differently without changing behaviour.

`scripts/check_bundle_hashes.py` verifies the recorded hashes against the sources. Once the compiler is in-repo, upgrade that gate from self-attestation to reproduction: run the compiler in CI and `git diff --exit-code -- _ds_bundle.js`, the way the registry and token generators are already gated, and delete the lockstep-edit exception above.

## The invariants

1. **Bundle lockstep.** Any change to `components/**/*.jsx` or `showcases/**/*.jsx` requires a matching `_ds_bundle.js` update (recompile, or a lockstep edit as above). Source-only component edits silently ship stale behavior.
2. **Path depth table.** Root references by location: `blocks/*.html` and `site/*` are one directory down and use `../`; `components/<g>/*.card.html`, `showcases/<p>/*`, and `starters/<j>/*` are two down and use `../../`. When adding a page, copy an existing neighbor and keep its prefix.
3. **Namespace collisions.** Local helpers must never share a name with a DS export (the runtime resolves against the namespace first). See CLAUDE.md and STYLEGUIDE.md.
4. **Verification gate.** `site/_smoke.html` must report 121/121 (or the new total) rendered with zero console errors; `scripts/check_contrast.py` and `scripts/check_runtime_copies.py` must pass before any push.

## Verifying locally

Serve the repo root with any static server and open `index.html` (redirects to `site/DsSite.dc.html`), `site/_smoke.html`, a showcase, and a starter page. There is no build step; if a page is blank, check the browser network tab for a mis-depthed `../` reference first. After editing `_ds_bundle.js`, hard-reload (or `fetch('/_ds_bundle.js', {cache:'reload'})`): browsers heuristically cache the bundle and will happily run stale code while you debug the new code's "failure".
