# Contributing to Meridian

Meridian is MIT-licensed and open to contributions. It is plain HTML + CSS + JSX. For most of the repo there is no build step and no npm install — open any `.html` in a browser and you are running the real thing.

## Read this first if you are changing a component

`_ds_bundle.js` is a **compiled artifact**. Every `components/**/*.jsx` and `showcases/**/*.jsx` file is compiled into it, and the bundle header records a SHA-256 of each source file. Pages load the bundle, not your `.jsx`, so **editing a component source alone changes nothing at runtime.**

The compiler that produces the bundle is **not in this repository**. That means:

- **You cannot regenerate `_ds_bundle.js` yourself, and you are not expected to.** Open your PR with the source change only (`.jsx` + `.d.ts` + `.prompt.md` + specimen card). A maintainer recompiles the bundle and pushes it to your branch before merge.
- **CI will report a bundle hash mismatch on your PR.** For pull requests from forks that touch component sources this check is informational and will not block you. Seeing `hash mismatch (bundle stale)` on a component PR is expected and is the maintainer's job to resolve, not yours.
- Describe the visual or behavioural change in the PR body so the maintainer can verify it after recompiling.

Everything else in the repo you can build, run, and verify completely on your own: `tokens/`, `blocks/`, `starters/`, `site/`, `guidelines/`, `scripts/`, and all documentation. Those PRs need no special handling.

Removing this asymmetry is tracked in [ROADMAP.md](ROADMAP.md) — vendoring the compiler (or replacing it) is the single highest-value contribution anyone could make to this project.

## Running the checks locally

```bash
python3 scripts/check_contrast.py          # WCAG contrast pairs (4.5:1 text, 3:1 non-text)
python3 scripts/check_dead_controls.py     # no buttons that render but do nothing
python3 scripts/check_paths.py             # every relative reference resolves
python3 scripts/check_runtime_copies.py    # support.js / ds-base.js copies have not drifted
python3 scripts/sync_manifest_tokens.py --check
python3 scripts/build_registry.py && python3 scripts/build_tokens.py && python3 scripts/build_interfaces.py
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
