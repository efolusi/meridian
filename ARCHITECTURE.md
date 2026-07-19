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

1. **The root is a contract.** `styles.css`, `tokens/`, and `assets/` are what consumers link when they vendor the folder, and the compiled artifacts (`_ds_bundle.js`, `_ds_manifest.json`, `_adherence.oxlintrc.json`, `thumbnail.html`) sit beside them. Consumers, the CDN, and `Icon`'s asset resolution all depend on these paths. They never move.
2. **Shallow beats deep.** Pages resolve the root by counted `../` segments, so every authored page lives at most two directories down. Depth is a bug factory here; keep it flat.
3. **The site consumes, it does not own.** Component, block, and example-app source live in their own directories; `site/` renders them. An earlier layout nested source inside the docs app and buried half the repo six levels deep; it was reverted.

## The pipeline

- Components are plain `.jsx` files styling against semantic tokens only. Each calls `injectEfCss(id, css)` and is compiled by **`scripts/build_bundle.mjs`** into `_ds_bundle.js`, which attaches every export to `window.EfolusiDesignSystem_4ffc3d`. Run `npm install` once, then `node scripts/build_bundle.mjs`.
- Pages load `react`, `react-dom`, and the bundle, then read components off that namespace. `.dc.html` pages additionally use the `x-dc` runtime in `support.js`.
- `Icon` fetches `assets/icons/<name>.svg` relative to the **bundle script's URL**, not the page URL. Root placement of `_ds_bundle.js` is therefore load-bearing.
- Each starter (and `site/`) carries its own `ds-base.js` (one `base` line pointing at the root) and a copy of `support.js`, so a copied folder works standalone. The copies must stay byte-identical; `scripts/check_runtime_copies.py` enforces that.

## Generated versus authored

| Path | Written by | Committed because |
|---|---|---|
| `_ds_bundle.js` | `scripts/build_bundle.mjs` | zero-build distribution: pages run from it directly |
| `_ds_manifest.json` | DS compiler | machine-readable inventory for tools and agents |
| `_adherence.oxlintrc.json` | DS compiler | token/prop adherence rules for linting |
| `site/registry.json`, `site/registry/*.json` | `scripts/build_registry.py` | open-schema registry items; any static host can serve them |

Everything else is authored by hand. Never edit generated files directly — rebuild them. The bundle is reproducible (`node scripts/build_bundle.mjs`), so the "lockstep edit" workaround that this file used to document is retired: there is no longer a situation where a source string must be patched into the artifact by hand.

### The bundle format

The compiler used to live outside this repository, which meant no outside contributor could regenerate `_ds_bundle.js` and CI could only check a hash the artifact reported about itself. `scripts/build_bundle.mjs` now produces it here, and reproduces the historical artifact byte for byte. This is the format, for anyone maintaining or replacing that script.

**File shape.** Line 1 is `/* @ds-bundle: {…} */` carrying `format: 4`, `namespace`, `components` (one entry per exported name, `{name, sourcePath}`, sorted by source path then declaration order), `sourceHashes` (path → first 12 hex of the source's SHA-256, keys sorted by path), `inlinedExternals`, and `unexposedExports` (helpers kept off the public namespace, sorted by name: `computeDiff`, `formatTime`, `injectEfCss`). Then a single IIFE that defines `__ds_ns` (the window global), a private `__ds_scope = {}`, and `__ds_ns.__errors`. Then one unit per source file. Then an epilogue of `__ds_ns.X = __ds_scope.X;` in the same order as `components`.

**What gets exposed.** A capitalised export from `components/` becomes a public component; a lowercase export is an internal helper and is listed in `unexposedExports` instead. Showcase screens are compiled into the bundle but never attached to the namespace.

**Unit shape.** Each unit is:

```js
// <repo-relative source path>
try { (() => {
<source compiled with Babel preset "react", imports stripped>
Object.assign(__ds_scope, { <exported names> });
})(); } catch (e) { __ds_ns.__errors.push({ path: "<path>", error: String((e && e.message) || e) }); }
```

Bare imports (`react`) are dropped — React is read off the global. Relative imports are erased and every reference to the imported binding is rewritten to `__ds_scope.<local>` (including JSX identifiers, which become `<__ds_scope.Name>`). A unit that throws is caught and recorded in `__ds_ns.__errors` rather than taking the page down.

**Unit order** is a greedy lexicographic topological sort: repeatedly emit the alphabetically-first file whose relative imports have all been emitted. (Because `components/…` sorts before `showcases/…`, showcases naturally land last.) Order is not load-bearing at runtime — every cross-unit reference resolves inside a function body, not at unit evaluation — but reproducing it keeps the artifact diff-stable against history.

Two gates protect this. `scripts/check_bundle_hashes.py` is a fast check of the recorded hashes against the sources; `node scripts/build_bundle.mjs --check` is the real one, recompiling from scratch and requiring a byte-identical result. CI runs both.

## The invariants

1. **Bundle lockstep.** Any change to `components/**/*.jsx` or `showcases/**/*.jsx` requires a matching `_ds_bundle.js` recompile (`node scripts/build_bundle.mjs`). Source-only component edits silently ship stale behaviour; CI blocks them by rebuilding and diffing.
2. **Path depth table.** Root references by location: `blocks/*.html` and `site/*` are one directory down and use `../`; `components/<g>/*.card.html`, `showcases/<p>/*`, and `starters/<j>/*` are two down and use `../../`. When adding a page, copy an existing neighbor and keep its prefix.
3. **Namespace collisions.** Local helpers must never share a name with a DS export (the runtime resolves against the namespace first). See CLAUDE.md and STYLEGUIDE.md.
4. **Verification gate.** `site/_smoke.html` must report 121/121 (or the new total) rendered with zero console errors; `scripts/check_contrast.py` and `scripts/check_runtime_copies.py` must pass before any push.

## Verifying locally

Serve the repo root with any static server and open `index.html` (redirects to `site/DsSite.dc.html`), `site/_smoke.html`, a showcase, and a starter page. There is no build step; if a page is blank, check the browser network tab for a mis-depthed `../` reference first. After editing `_ds_bundle.js`, hard-reload (or `fetch('/_ds_bundle.js', {cache:'reload'})`): browsers heuristically cache the bundle and will happily run stale code while you debug the new code's "failure".
