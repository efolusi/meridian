# Ecosystem

Meridian is the web half of Efolusi's design stack:

| Repo | Job |
|---|---|
| [efolusi/design-tokens](https://github.com/efolusi/design-tokens) | Shared token names and values; exports for web and native |
| [efolusi/meridian](https://github.com/efolusi/meridian) (this repo) | Web: CSS, React, CDN / npm |
| [efolusi/glamor](https://github.com/efolusi/glamor) | Native: SwiftUI seeds, HTML previews |

Root paths in this repo (`styles.css`, `tokens/`, `assets/`, `components/`, `_ds_bundle.js`, and the other vendoring artifacts listed in [ARCHITECTURE.md](../ARCHITECTURE.md)) do not move. `tokens/{colors,typography,spacing,effects}.css` are vendored from `design-tokens` (pin in `tokens/design-tokens.lock.json`). Change tokens there, then run `node scripts/sync_tokens.mjs <tag>`.

## Plan

### How Meridian consumes design-tokens

The source of truth is `design-tokens`. Every design-tokens tag is re-vendored here and in Glamor to the same tag before either releases ([rule](https://github.com/efolusi/design-tokens/blob/main/docs/consumers.md#releasing-a-new-version)). `scripts/sync_tokens.mjs <tag>` vendors its `tokens.json` and `tokens/web/{colors,typography,spacing,effects}.css` into this repo and pins them in `tokens/design-tokens.lock.json`. `scripts/build_tokens.py` only writes `tailwind.preset.js`.

How it got there:

1. `design-tokens` adopts the DTCG shape Meridian already emits (`$value`, `$type`, aliases as `{group.leaf}`, modes in `$extensions`). It becomes the authored source.
2. Product-only tokens (Komando terminal, ANSI, resource tints) stay in their product, per `design-tokens/docs/consumers.md`.
3. A generator in `design-tokens` writes `tokens/web/*.css` (same file split as here: colors, typography, spacing, effects).
4. Meridian vendors those files into `tokens/` with a sync script, pinned to a `design-tokens` tag. Root paths do not move; the zero-build CDN page keeps working.
5. A check in `npm run check` fails when vendored `tokens/*.css` differs from the pinned export.

### How efolusi/efolusi adopts Meridian

The site already depends on `@efolusi/meridian` (`^1.22.0`, the latest release). It imports `styles.css` and components (`Button`, `Accordion`, `Icon`, …) and uses Meridian CSS variables. Adoption means: keep it on the newest release, replace hand-written styles with Meridian components or tokens, and feed gaps it finds back here.

### Planned work

| # | Item | Repo | Status |
|---|---|---|---|
| 1 | Pick DTCG (Meridian shape) as the `design-tokens` format; Komando-only tokens stay in komando-apps | design-tokens | done (v0.0.1) |
| 2 | Move Meridian's token values into `design-tokens/tokens.json`; move Komando-only tokens back to Glamor/komando-apps | design-tokens | done (v0.0.1) |
| 3 | Generator: `tokens.json` → `tokens/web/*.css` | design-tokens | done (v0.0.1) |
| 4 | Sync script + pinned tag; `build_tokens.py` reads the vendored files | meridian | done (pinned to v0.1.1) |
| 5 | Check: vendored tokens equal pinned export | meridian | done (`sync_tokens.mjs --check` offline in `npm run check`; upstream against the pinned tag when `CI=true`) |
| 6 | Map Glamor names (`window`, `panel`, `text2`, …) to Meridian roles (`surface`, `text`, `border`) so both use one set of names | design-tokens + glamor | open |
| 7 | efolusi/efolusi: bump to 1.22.0, audit hand-written CSS that a Meridian component or token covers | efolusi | done (efolusi/efolusi#76) |
| 8 | efolusi/efolusi: list missing components or tokens as Meridian issues | efolusi → meridian | done (#108, #109, #110, #111) |
| 9 | Meridian vendors `tokens.json` with the new root `$extensions` shape (`base`, `modes` with `blocks`); joint `$type` fixes (`leading.*` number, `weight.*` fontWeight, `tap.min` dimension) | meridian + design-tokens | done (design-tokens v0.1.1; Meridian vendors tokens.json) |
