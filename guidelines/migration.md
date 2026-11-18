# Migration

How Meridian retires an API, and what to change in your code before each major version.

## Policy

Meridian keeps no legacy code. A rename or removal lands in one release, with no alias and no deprecation warning, and is marked **Breaking** in [CHANGELOG.md](../CHANGELOG.md). Each one has a section below with the reason and the before and after code. The full rules are in [governance § Breaking changes](governance.md#breaking-changes).

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

## 1.24.0

### Drawer `modal`

Removed in 1.24.0. It had been ignored since 1.22.0.

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

1.21.0 and 1.21.2 removed shorthand renderers and the first wave of prop aliases in minor releases. Those entries in [CHANGELOG.md](../CHANGELOG.md) list each removal and its replacement; there is no deprecation warning or Guard rule for them.

## Breaking something (contributors)

1. Rename or remove it in one change, and update every caller there: showcases, starters, blocks, the docs site, tests, skills and the product apps. Add no alias and no warning.
2. Add a `### Component \`prop\`` section under the release above, with the reason and the before and after code. Say whether `meridian-guard --fix` can apply it.
3. Mark it **Breaking** in `CHANGELOG.md`.
4. Open the product apps' pull requests together with it. The release waits until they are ready, and they land with it.
