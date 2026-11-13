# Contributing to Meridian

Meridian is MIT-licensed and open to contributions. Pages are plain HTML, CSS and JSX: open any `.html` in a browser and you are running the real thing. Component changes need one build step, below.

## Read this first if you are changing a component

`_ds_bundle.js` is a **compiled artifact**. Every `components/**/*.jsx` file is compiled into it, and pages load the bundle rather than your `.jsx`, so **editing a component source alone changes nothing at runtime until you rebuild.** Showcases are not in the bundle: each `showcases/<app>/index.html` compiles its own `.jsx` in the browser, so a showcase edit needs no rebuild.

Rebuilding takes one command:

```bash
npm ci                           # once
node scripts/build_bundle.mjs    # recompile _ds_bundle.js from source
```

Commit the regenerated `_ds_bundle.js` alongside your source change. CI recompiles from scratch and requires the committed artifact to match byte for byte (`node scripts/build_bundle.mjs --check`), so a stale bundle cannot merge and neither can a bundle that does not correspond to its sources.

The compiler is `scripts/build_bundle.mjs` and the format it emits is documented in [ARCHITECTURE.md](ARCHITECTURE.md) § The bundle format.

## Running the checks locally

Use Node.js 22.23.2 and npm 10.9.8, matching `.nvmrc`, `package.json`, and CI. With nvm, run `nvm use` before installing dependencies.

```bash
npm ci               # install the exact package-lock.json dependency tree
npm run check        # what CI runs: every generator, then every gate
npm run check:fix    # same, but regenerate stale generated files first
```

A green run proves that the committed bundle rebuilds byte for byte from source, that every generated file is fresh, that contrast, keyboard contracts, server rendering and types hold, and that the npm packages build and import cleanly.

One command is the whole contract: it is the same script CI executes, so a green run here means a green run there. The only thing it cannot cover locally is the browser: open `site/_smoke.html` after demo changes; it renders every demo and reports pass/fail in the page title.

## Component contract

Every component ships four files in its group folder (`components/<group>/`):

1. `<Name>.jsx`: the implementation. Styles against **semantic tokens only** (`var(--surface-card)`, never raw hex), so dark theme and compact density work for free.
2. `<Name>.d.ts`: the public props interface. JSDoc every prop; mark defaults with `@default`.
3. `<Name>.prompt.md`: usage guide: when to use it, when not to, prop recipes.
4. A specimen in the group's `<group>.card.html` showing every variant and state.

## Rules

- **Conventions** (naming, props, tokens, motion, copy, accessibility) are in [STYLEGUIDE.md](STYLEGUIDE.md). Reviewers block on them.
- **When a component belongs in Meridian**, versioning and deprecation: [guidelines/governance.md](guidelines/governance.md). Deprecating a prop also needs a section in [guidelines/migration.md](guidelines/migration.md); `npm run check` fails without it.
- **Showcase or starter?** A new product category gets a showcase (`showcases/`, plain JSX). A new page journey people should copy gets a starter (`starters/`, self-contained folder). If both, build the starter first and let the showcase show its richest screen. Four twin pairs exist on purpose (console/dashboard, auth, website/marketing, docs); a change to a shared screen updates both sides.

## Checklist before you open a PR

- [ ] `npm run check` is green
- [ ] Works in light **and** dark (`data-theme="dark"`), comfortable **and** compact (`data-density="compact"`)
- [ ] Keyboard operable, focus visible
- [ ] `.d.ts` + `.prompt.md` updated
- [ ] Specimen card updated
- [ ] No hard-coded colors, sizes, or fonts

## License

By contributing, you agree your contributions are licensed under the MIT License.
