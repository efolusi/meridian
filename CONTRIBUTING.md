# Contributing to Meridian

Meridian is MIT-licensed and open to contributions. It is plain HTML + CSS + JSX — no build step, no npm install. Open any `.html` in a browser.

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
- Semver + deprecation policy: see `guidelines/governance.md`.

## Checklist before you open a PR

- [ ] Works in light **and** dark (`data-theme="dark"`), comfortable **and** compact (`data-density="compact"`)
- [ ] Keyboard operable, focus visible
- [ ] `.d.ts` + `.prompt.md` updated
- [ ] Specimen card updated
- [ ] No hard-coded colors, sizes, or fonts

## License

By contributing, you agree your contributions are licensed under the MIT License.
