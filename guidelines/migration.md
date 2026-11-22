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

## Unreleased

### FeatureCard tone="cocoa" is tone="band"

design-tokens v0.7.0 renamed `tone.cocoa` to `tone.band`: its fill is the warm band (`--surface-brand`) and its text `--text-on-brand`. Cocoa stays only in the marks and the wordmark. There is no alias.

**Before.** `tone="cocoa"`, a dark cocoa card with light text; CSS `--tone-cocoa-fill`, `--tone-cocoa-on-fill`.

**After.** `tone="band"`, the warm band with dark ink; CSS `--tone-band-fill`, `--tone-band-on-fill`.

```jsx
// before
<FeatureCard tone="cocoa" title="Token" />
// after
<FeatureCard tone="band" title="Token" />
```

### TopNav is chrome glass; floating and sticky are opt-in

`TopNav` keeps its layout: static and full width, now on chrome glass instead of the 85% page colour with a blur. Two props are new and off by default: `floating` (a pill inset from the edges) and `sticky` (stays at the top and blurs what scrolls under it; the page then keeps `--ef-topnav-space` free at the top). The recommended look is both.

```jsx
// before
<TopNav title="Docs" />            // sticky, blurred 85% page colour
// after: the recommended look
<TopNav title="Docs" floating sticky />
```

### --text-on-brand is dark ink on the warm band

`--surface-brand` is the warm band now, and `--text-on-brand` is dark ink on it (light in dark). Code that put `--text-on-brand` on a fixed dark fill gets dark text on a dark fill.

**Before.** `--text-on-brand` was white, used on cocoa fills.

**After.** On the band, keep `--text-on-brand`. On a fixed dark fill (a file-type colour, a photo) use `--text-on-media`. Meridian's brand `Button` is the band (`--surface-brand`, hover `--surface-brand-hover`); `Questionnaire`'s primary button is the accent.

```css
/* before */ .my-chip { background: var(--brand-700); color: var(--text-on-brand); }
/* after  */ .my-chip { background: var(--brand-700); color: var(--text-on-media); }
```

## 1.31.0

### ThemeToggle offers light and dark only

The theme switch has two choices, `light` and `dark`, in every product (owner rule, 2026-11-22). The `system` choice, its icon and its label are gone. A first visit starts in the device's theme and stores nothing; the choice is kept once the person switches.

**Before.** The button cycled Light, Dark, System. `readThemePreference()` returned `'system'` with no choice. `ThemePreference` included `'system'`. `refreshSystemCookie()` existed. `labels` took a `system` key. The button carried `data-preference`.

**After.** The button flips between Light and Dark and shows the theme in use. `readThemePreference()` returns `null` with no choice. `ThemePreference` is `'light' | 'dark'`. `refreshSystemCookie()` is removed. `labels` takes `light`, `dark` and `next`. The button carries `data-theme-shown`, and its `aria-label` names the action ("Switch to dark theme", "Ganti ke tema gelap"). `resolveTheme(null)` and `applyTheme(null)` give the device's theme. `writeThemePreference()` refuses anything but `light` or `dark` and returns `null`.

```jsx
// before
const pref = readThemePreference();          // 'light' | 'dark' | 'system'
<ThemeToggle labels={{ system: 'Auto' }} />
// after
const pref = readThemePreference();          // 'light' | 'dark' | null
<ThemeToggle labels={{ next: 'Switch to' }} />
```

A `system` value stored in a visitor's browser by an earlier release is read as no choice and removed once by the reader and by `themeInitScript()`. That is visitor data, not an alias. `themeInitScript()` no longer writes the cookie, so a site that hard-codes its hash needs the new hash from `browser/hashes.json`.

**Mechanical fix.** No Guard rule. Remove `system` from your `labels`, any `ThemePreference` switch and any `data-preference` selector; the CSS for the markup in `marketing.js` drops the `system` icon.

### Logo path

The Meridian mark is the logo-system file at `assets/meridian.svg` (owner rule: one logo per product). The old path (named in the CHANGELOG entry) is gone, and the mark is now square (viewBox 64 by 64) where it was wide.

**Before.** The image at the old path with `width="30" height="16"`, and the matching old class in `site/site.css`.
**After.** `<img src="assets/meridian.svg" width="32" height="32">`, `.meridian-logo`. The minimum size is 32px square.

**Mechanical fix.** No Guard rule. Replace the path in your copies and give the image a square box; copy the new file from the release, not from the old one.

## 1.25.0

### Drawer `modal`

Removed in 1.25.0. It had been ignored since 1.22.0.

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

### Status and variant names

**Why.** One status meant several names (`ok` and `success`, `err`, `error` and `danger`). Every status-bearing component now uses `success`, `warning`, `danger`, `info`, `neutral` and `busy`.

| Component | Prop | Old | New |
|---|---|---|---|
| StatusDot | `status` | `ok`, `warn`, `err`, `off` | `success`, `warning`, `danger`, `neutral` |
| Terminal | line `type` | `ok`, `err` | `success`, `danger` |
| Console, WebPreview | log `level` | `warn`, `error` | `warning`, `danger` |
| ToolCall, Sandbox | `status` | `running`, `error` | `busy`, `danger` |
| GeneratedImage | `status` | `generating`, `error` | `busy`, `danger` |
| Button, Alert, Badge, Bubble, DropdownMenuItem, ContextMenuItem, InputGroupButton | `variant` | `destructive` | `danger` |
| Button, InputGroupButton | `variant` | `outline` (the same look as `secondary`) | `secondary` |

**Before**

```jsx
<StatusDot status="ok" label="API" />
<Button variant="destructive">Delete</Button>
```

**After**

```jsx
<StatusDot status="success" label="API" />
<Button variant="danger">Delete</Button>
```

**Mechanical fix.** No Guard rule. Search for the old values and replace them; an old value now falls back to the component's default look.

### Toast `type`

**Why.** The toast manager took `type: 'error'` and drew it as `danger`. It now takes `danger`, like every other component. `toast.promise` marks a rejected promise `danger`. The `error` key of `toast.promise` options stays: it names the rejection callback, not a type.

**Before**

```js
toast.add({ title: 'Deploy failed', type: 'error' });
```

**After**

```js
toast.add({ title: 'Deploy failed', type: 'danger' });
```

**Mechanical fix.** No Guard rule. Replace `type: 'error'` in `toast.add` calls. A toast with `type: 'error'` now shows as `info`.

## Earlier breaking changes

1.21.0 and 1.21.2 removed shorthand renderers and the first wave of prop aliases in minor releases. Those entries in [CHANGELOG.md](../CHANGELOG.md) list each removal and its replacement; there is no deprecation warning or Guard rule for them.

## Breaking something (contributors)

1. Rename or remove it in one change, and update every caller there: showcases, starters, blocks, the docs site, tests, skills and the product apps. Add no alias and no warning.
2. Add a `### Component \`prop\`` section under the release above, with the reason and the before and after code. Say whether `meridian-guard --fix` can apply it.
3. Mark it **Breaking** in `CHANGELOG.md`.
4. Open the product apps' pull requests together with it. The release waits until they are ready, and they land with it.
