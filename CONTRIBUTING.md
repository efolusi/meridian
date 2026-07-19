# Contributing to Meridian

Meridian is MIT-licensed and open to contributions. It is plain HTML + CSS + JSX. For most of the repo there is no build step and no npm install — open any `.html` in a browser and you are running the real thing.

## Read this first if you are changing a component

`_ds_bundle.js` is a **compiled artifact**. Every `components/**/*.jsx` and `showcases/**/*.jsx` file is compiled into it, and pages load the bundle rather than your `.jsx` — so **editing a component source alone changes nothing at runtime until you rebuild.**

Rebuilding takes one command:

```bash
npm install                      # once — @babel/standalone is the only build dependency
node scripts/build_bundle.mjs    # recompile _ds_bundle.js from source
```

Commit the regenerated `_ds_bundle.js` alongside your source change. CI recompiles from scratch and requires the committed artifact to match byte for byte (`node scripts/build_bundle.mjs --check`), so a stale bundle cannot merge and neither can a bundle that does not correspond to its sources.

The compiler is `scripts/build_bundle.mjs` and the format it emits is documented in [ARCHITECTURE.md](ARCHITECTURE.md) § The bundle format. It was previously an external tool nobody outside the project could run; it now lives here, and reproduces the historical artifact exactly.

## Running the checks locally

```bash
python3 scripts/check_contrast.py          # WCAG contrast pairs (4.5:1 text, 3:1 non-text)
python3 scripts/check_dead_controls.py     # no buttons that render but do nothing
python3 scripts/check_paths.py             # every relative reference resolves
python3 scripts/check_runtime_copies.py    # support.js / ds-base.js copies have not drifted
python3 scripts/sync_manifest.py --check
python3 scripts/build_registry.py && python3 scripts/build_tokens.py && python3 scripts/build_interfaces.py
node scripts/build_bundle.mjs --check      # the committed bundle matches a fresh compile
```

Then open `site/_smoke.html` in a browser; it renders every demo and reports pass/fail in the page title.

## Component contract

Every component ships four files in its group folder (`components/<group>/`):

1. `<Name>.jsx` — the implementation. Styles against **semantic tokens only** (`var(--surface-card)`, never raw hex), so dark theme and compact density work for free.
2. `<Name>.d.ts` — the public props interface. JSDoc every prop; mark defaults with `@default`.
3. `<Name>.prompt.md` — usage guide: when to use it, when not to, prop recipes.
4. A specimen in the group's `<group>.card.html` showing every variant and state.

**Naming rule:** never give a local helper (in kits, blocks, cards, or demos) the same name as a design-system export — locals like `Stat` or `Divider` get shadowed by the namespace at runtime. Prefix them (`KpiCard`, `AuthDivider`).

## Rules

- **Tokens first.** New colors/sizes go in `tokens/`, components consume them. Raw values in a component are a review blocker.
- **Sentence case** for all UI copy. Buttons are verbs.
- **Motion** uses the shared scale: 100/160/240ms, `--ease-out` / `--ease-spring`. Nothing longer than 240ms.
- **Accessibility**: keyboard path + visible focus (`--focus-ring`) + ARIA per `guidelines/accessibility.md`. Non-negotiable.
- **No new dependencies.** Icons come from the curated Lucide set in `assets/icons/`.
- **Showcase or starter?** A new product category gets a kit (`showcases/`, plain JSX showcase). A new page journey people should copy gets a starter (`starters/`, self-contained folder). If both, build the starter first and let the kit show its richest screen. Four twin pairs exist on purpose (console/dashboard, auth, website/marketing, docs); a change to a shared screen updates both sides.
- Semver + deprecation policy: see `guidelines/governance.md`.

## Checklist before you open a PR

- [ ] Works in light **and** dark (`data-theme="dark"`), comfortable **and** compact (`data-density="compact"`)
- [ ] Keyboard operable, focus visible
- [ ] `.d.ts` + `.prompt.md` updated
- [ ] Specimen card updated
- [ ] No hard-coded colors, sizes, or fonts

## License

By contributing, you agree your contributions are licensed under the MIT License.
