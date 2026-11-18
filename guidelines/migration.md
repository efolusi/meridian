# Migration

How Meridian retires an API, and what to change in your code before each major version.

## Policy

A deprecated prop, component or token keeps working until the next major version. While it is deprecated:

- it is marked `@deprecated` in its `.d.ts`, so your editor strikes it through;
- it logs one development warning per page that names the component and prop, such as `<Drawer modal={false}>`, and links here (production builds stay quiet);
- [Meridian Guard](https://www.npmjs.com/package/@efolusi/meridian-guard) reports it as `MDG004`;
- it has a section below with the reason and the before and after code.

It is removed only in a major version, and only after at least one release that shipped the warning. The full rules are in [governance § Deprecation](governance.md#deprecation).

## Finding what to change

1. Run your app in development and read the console. Every warning starts with `[meridian]`.
2. Run Guard over your source. It finds every deprecated prop on a component imported from `@efolusi/meridian`, including aliased and namespace imports:

   ```sh
   npx @efolusi/meridian-guard src
   ```

3. Where a section below says a fix is mechanical, Guard can apply it. `--fix` needs a Guard release newer than 1.22.0 (older ones stop with "unknown option --fix"). It rewrites files in place, so commit or stash first and review the diff:

   ```sh
   npx @efolusi/meridian-guard src --fix
   ```

Guard reads imports, so it does not see components used as CDN globals (`window.Drawer`) or props passed through a spread (`<Drawer {...props}>`). Search for those by hand; the development warning still catches them at runtime.

## 1.x to 2.0

### Drawer `modal`

Deprecated in 1.22.0. Removed in 2.0.

**Why.** A Drawer is always modal: it draws a scrim, traps focus and locks page scroll. The `modal` prop was accepted but never read, so `modal={false}` looked like a non-modal drawer and behaved like a modal one. Removing the prop makes the type say what the component does.

**Before**

```jsx
<Drawer modal={false} direction="right">
  <DrawerTrigger asChild><Button>Filters</Button></DrawerTrigger>
  <DrawerContent>…</DrawerContent>
</Drawer>
```

**After**

```jsx
<Drawer direction="right">
  <DrawerTrigger asChild><Button>Filters</Button></DrawerTrigger>
  <DrawerContent>…</DrawerContent>
</Drawer>
```

**Mechanical fix.** Yes. The prop never changed behaviour, so deleting it, whatever its value, leaves the rendered page identical. `meridian-guard --fix` removes `modal`, `modal={false}`, `modal={true}` and `modal={expression}` from every `Drawer` it can see. If the removed expression was the only use of a variable, your linter will then report the variable as unused.

**If you wanted a non-modal panel.** Meridian has never shipped one, and the Drawer did not provide it either. For content that sits beside the page and stays interactive, make it part of the page layout (a column in your grid, for example) rather than an overlay.

## Earlier breaking changes

1.21.0 and 1.21.2 removed shorthand renderers and the first wave of prop aliases in minor releases, without a deprecation release first. That broke the policy above. Those entries in [CHANGELOG.md](../CHANGELOG.md) list each removal and its replacement; there is no deprecation warning or Guard rule for them.

## Deprecating something (contributors)

1. Publish the replacement, and migrate the showcases, starters, blocks and docs site to it.
2. Mark the prop `@deprecated` in the `.d.ts`. Say what to use instead, that it goes in the next major version, and link this page.
3. Log one development warning per page from the component. The message must contain "deprecated" and name the call site as `<Component prop`, for example `<Drawer modal={false}>`.
4. Add a `### Component \`prop\`` section under the next major above, with the reason and the before and after code.
5. Add `@codemod remove` to the `.d.ts` comment only when the component ignores the prop, so deleting it cannot change behaviour. Anything else (a rename, a changed value) gets a written migration, not a codemod.
6. Record it in `CHANGELOG.md`.

`npm run check` runs `scripts/check_migration_guide.mjs`, which fails when a deprecation warning, a `@deprecated` prop and a section here do not all line up.
