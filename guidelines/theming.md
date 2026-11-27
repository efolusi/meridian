# Theming

How to put your own brand on Meridian without forking component code. Components style against semantic tokens only, so a rebrand is a CSS override file, not a component edit.

Two ways to apply everything below:

- **Vendored folder**: edit `tokens/colors.css` (and `tokens/fonts.css`) in place. `scripts/check_contrast.py` verifies your edits directly.
- **CDN or npm**: leave the stylesheet untouched and load one override file after it:

```html
<link rel="stylesheet" href="https://meridian.efolusi.com/styles.css">
<link rel="stylesheet" href="brand.css">
```

## The three token layers

1. **Ramps**: raw scales in `tokens/colors.css`: `--sand-25…950` (warm neutrals), `--brand-50…950` (the identity color, cream→cocoa), and the status hexes. Physical constants: the same value in light and dark.
2. **Semantic aliases**: the vocabulary components actually use: `--surface-page`, `--text-primary`, `--accent`, `--focus-ring-color`, and friends. Each resolves to a ramp stop or a tuned hex. This is the only layer the dark theme remaps.
3. **Component styles**: every component reads semantic tokens only. No component knows a hex.

A rebrand touches layer 2, plus the `--brand-*` stops in layer 1 when the identity color itself changes: links (`--text-link`), focus (`--focus-ring-color`), and the light-theme text selection (`--brand-100`) all resolve through that ramp, so replacing the ramp carries them at once. The sand neutrals can stay: a brand usually lives in the accent, not the paper.

## The minimum viable rebrand

The brand rides on a small set of tokens: the accent group (`--accent`, `--accent-hover`, `--accent-active`, `--accent-contrast`, `--accent-edge`, plus the `--accent-subtle` / `--accent-subtle-border` tint pair), the focus ring pair (`--focus-ring-color`, `--focus-ring-offset`), the link color (`--text-link`), and the `--brand-*` ramp they resolve through. Everything else is neutral.

Copy this block and swap in your values. The example is a deep teal; every pair in it passes the contrast duty below, in both themes.

```css
/* brand.css: load after styles.css */
:root {
  /* Brand ramp: your scale, 50 lightest to 950 darkest */
  --brand-50:  #EAF4F0;
  --brand-100: #D7EAE2;  /* also the light-theme selection highlight */
  --brand-200: #AFD6C7;
  --brand-300: #7FBAA4;
  --brand-400: #4F9D82;  /* dark-theme links + focus resolve here */
  --brand-500: #35836A;
  --brand-600: #2A6E57;
  --brand-700: #1F5A46;  /* light-theme links + focus resolve here */
  --brand-800: #194838;
  --brand-900: #12352A;
  --brand-950: #0B2119;

  /* Primary action */
  --accent: var(--brand-950);
  --accent-hover: #071812;   /* darker than your 950 */
  --accent-active: #04100C;  /* darker still */
  --accent-contrast: #FFFFFF;
  --accent-edge: var(--accent);  /* shapes and the 1px edge of the fill: 3:1 on page, card, sunken, track */
  --accent-subtle: var(--brand-50);
  --accent-subtle-border: var(--brand-200);

  /* Focus ring + links. These three repeat the stylesheet defaults;
     keep them so the brand contract is explicit in your file, or
     point them at something else entirely. */
  --focus-ring-color: var(--brand-700);
  --focus-ring-offset: var(--surface-card);
  --text-link: var(--brand-700);
}
```

`--focus-ring` itself is a composite (a surface-colored offset layer under the color band) and re-resolves through the pair; `--focus-ring-danger` does the same with `--danger-600` in the band. Set the pair; never rebuild the composites by hand.

## Dark mode

Two facts drive the dark half of your override file:

- **Only semantic aliases remap in dark.** The stylesheet's `[data-theme="dark"]` block re-points surfaces, text, borders, the accent group, status tints, and `--focus-ring-color`. Ramps never change: `--brand-400` is the same hex at midnight.
- **Your `:root` block outranks the stylesheet's dark block.** Both selectors have equal specificity and your file loads later, so any dark-remapped token you set in `:root` needs a dark value in the same file, otherwise dark mode inherits your light value.

From the block above, the dark-remapped tokens are the seven accent tokens, `--text-link`, and `--focus-ring-color` (the ramp and `--focus-ring-offset` are not). So the dark half restores or retunes exactly those:

```css
/* brand.css, continued */
[data-theme="dark"] {
  /* The first four set this brand's dark accent (near-white here, so primary
     buttons stay the brightest thing on a dark page); the stylesheet's own is copper. */
  --accent: #F3EFE7;
  --accent-hover: #FFFFFF;
  --accent-active: #D5CFC0;
  --accent-contrast: #1E1A14;
  --accent-edge: var(--accent);
  --accent-subtle: #12251E;        /* dark tint of your brand */
  --accent-subtle-border: #1E4033;
  --text-link: var(--brand-400);
  --focus-ring-color: var(--brand-400);
}
```

The invariant: **only semantic aliases ever appear inside `[data-theme="dark"]`.** If you catch yourself writing `--brand-500` in the dark block, stop and remap the alias that points at it instead. One ramp, two semantic mappings is what keeps a single source of color truth, and what lets `scripts/check_contrast.py` reason about both themes from one file.

**Following the OS.** With no `data-theme` on `<html>`, the stylesheet also applies its dark block under `@media (prefers-color-scheme: dark)`, with the selector `:root:not(:where([data-theme="light"]))`, which keeps `:root` specificity. Your later `:root` overrides still beat it, so if your product follows the OS too, repeat your dark overrides there:

```css
@media (prefers-color-scheme: dark) {
  :root:not(:where([data-theme="light"])) { /* same declarations as your [data-theme="dark"] block */ }
}
```

If your product has no dark styling at all, set `data-theme="light"` on `<html>`. Otherwise a dark OS turns Meridian components dark inside a light page.

## Glass

The glass material comes from design-tokens (`docs/glass.md`): one number, `--glass-strength`, sets how much glass shows, and every `--material-*` value follows it. Meridian draws it with classes in `tokens/base.css`:

| Class | Use |
|---|---|
| `.ef-glass .ef-glass--chrome .ef-glass--blur` | Bars that content scrolls under: `TopNav`, `TabBar`, a toolbar |
| `.ef-glass .ef-glass--clear` | Controls on a bar or panel: `ThemeToggle`, `SegmentedControl`, `Input glass` |
| `.ef-glass .ef-glass--regular` | A card or panel on the field, without a blur |
| `.ef-glass .ef-glass--thick .ef-glass--blur` | Your own sheet or popover; Meridian's overlays already are |
| `.ef-glass-field` | On the page body: the quiet warm field that glass blurs |

Rules: blur only what content scrolls under; at most four blurred surfaces on screen; never put a blurred surface inside another (the inner one blurs nothing); an overlay never fades its opacity in. Every class turns solid under reduced transparency, more contrast, no `backdrop-filter` and forced colours, so a product needs no fallback of its own. To show more or less glass, set `--glass-strength` on `:root` (design-tokens recommends 0.33; 0.5 is visibly more glass) and run `scripts/check_contrast.py`, which measures every pair Meridian paints on glass.

## Fonts

Three families, three tokens (`tokens/typography.css`): `--font-display` for h1–h4 and display moments, `--font-sans` for everything readable, `--font-mono` for code, keys, and tabular numbers. The stock faces load via `@font-face` in `tokens/fonts.css` from `assets/fonts/`.

Vendored installs replace the WOFF2 files in `assets/fonts/` and update the `@font-face` rules in `tokens/fonts.css`. The override path declares your own faces and re-points the tokens:

```css
@font-face {
  font-family: 'Your Display';
  src: url('/fonts/YourDisplay-Variable.woff2') format('woff2-variations');
  font-weight: 200 800;
  font-style: normal;
  font-display: swap;
}
/* repeat for the text and mono faces */

:root {
  --font-display: 'Your Display', ui-sans-serif, system-ui, sans-serif;
  --font-sans: 'Your Text', ui-sans-serif, system-ui, sans-serif;
  --font-mono: 'Your Mono', ui-monospace, 'SF Mono', Menlo, monospace;
}
```

The `--font-*` tokens are not dark-remapped, so `:root` alone is safe. Keep the fallback stacks. One tuning knob: `--weight-display` (680) is tuned to Bricolage Grotesque's variable axis. If your display face is a static family, set it to a weight the face actually has.

## Contrast duty

Any replacement value must keep the guarantees the stock palette ships with: **4.5:1 for text (WCAG 1.4.3), 3:1 for non-text UI (WCAG 1.4.11)**, in both themes. The pairs that must hold:

- `--text-primary`, `--text-secondary`, `--text-muted` on `--surface-page`, `--surface-card`, and `--surface-sunken`: ≥ 4.5:1
- each status foreground (`--success-600`, `--warning-600`, `--danger-600`) on its `*-100` tint and on `--surface-card`: ≥ 4.5:1
- `--accent-contrast` on `--accent`: ≥ 4.5:1
- `--accent-edge` on `--surface-page`, `--surface-card`, `--surface-sunken`, `--surface-track` and `--border-default`: ≥ 3:1, in light, dark and both `prefers-contrast: more` tables (every component shape and fill edge paints it)
- `--focus-ring-color` on all three surfaces and on `--focus-ring-offset`: ≥ 3:1

The verifier is in the repo:

```
python3 scripts/check_contrast.py
```

It parses `tokens/colors.css`, follows every `var()` chain per theme, composites translucent colors before measuring, and hard-fails any pair it cannot resolve. It reads that file only: vendored installs just run it; if you theme via a separate override file, mirror your values into `tokens/colors.css` in a checkout of this repo and run it there. Don't ship a brand it hasn't passed.

## What not to touch

- **Component CSS.** Components read semantic tokens only; that contract is the entire reason retheming works. The moment a component gains a hardcoded hex or a per-brand edit, you own a fork and the next Meridian release stops being a drop-in. Restyle by remapping tokens, never by editing `components/`.
- **Ramp semantics.** 50 stays lightest, 950 darkest, steps evenly spaced. Derived tokens assume the ordering: `--brand-700` must be dark enough to hold 4.5:1 as text on light surfaces, `--brand-400` light enough to hold it on dark ones. Invert or skew the ramp and every derived guarantee fails at once.
- **Status trios.** `--success-*`, `--warning-*`, and `--danger-*` each ship a 600 foreground, 100 tint, and 300 border, with the 600 holding 4.5:1 on the tint and on white. Retune the hues if your brand demands it, but keep the trio shape and re-run the checker.
- **The code surface.** `--surface-code`, `--text-code`, and `--border-code` are fixed dark in both themes on purpose: terminals don't flip. Never remap them.

## Theme contract

Every Efolusi site follows this one contract, through `ThemeToggle` and `themeInitScript` from the marketing group. sso and each product adopt the component instead of their own toggle.

| Part | Rule |
|---|---|
| Choice | The switch offers two choices only, `light` and `dark`; there is no system option. localStorage `efolusi-theme` holds this origin's choice, written only when the person switches. A `system` value stored by an earlier release is read as no choice and removed once. |
| Cookie | `efolusi_theme` holds the person's choice, `light` or `dark`, so every product can parse it, and is written only when they switch. `Domain=.efolusi.com` when the host is `efolusi.com` or ends with `.efolusi.com`; `Path=/`; `Max-Age` one year; `SameSite=Lax`; `Secure` on https. |
| Precedence | Before paint and at runtime: the localStorage choice, then the cookie (`dark` or `light`), then the device's `prefers-color-scheme`. A first visit starts in the device's theme and stores nothing; a first visit to another Efolusi site inherits the cookie. |
| Before paint | `themeInitScript()` inlined in `<head>`. It paints the theme and stores nothing. |
| Markup | `data-theme` on `<html>` is always `light` or `dark`. Light never removes the attribute, so a dark device cannot turn a Light choice dark. The media rule in `tokens/colors.css` is only the no-JS fallback. |
| Control | One 44px button that shows the theme in use (sun for light, moon for dark) and flips to the other. Its `aria-label` names the action ("Switch to dark theme", "Ganti ke tema gelap"). With no stored choice it follows the device live and stores nothing. Labels in English and Indonesian. |

## Server layouts

`themeInitScript` and the rest of the theme contract are also exported from `@efolusi/meridian/theme`, a module with no React import and no `"use client"`, so a server layout can import it directly:

```jsx
// app/layout.jsx (a Server Component)
import { themeInitScript } from '@efolusi/meridian/theme';

<head><script dangerouslySetInnerHTML={{ __html: themeInitScript() }} /></head>
```

The script sets `data-theme` to `light` or `dark` before paint. If the server also renders `<html data-theme>` (from the `efolusi_theme` cookie, say), use the same two values, so the script changes nothing on the first frame.

Under a nonce-based CSP, pass the request's nonce, or the script is blocked and the first paint flashes the wrong theme:

```jsx
<script nonce={nonce} dangerouslySetInnerHTML={{ __html: themeInitScript() }} />
```

Under a hash-based CSP, allow the sha256 of the exact `themeInitScript()` output (hash the string the function returns, byte for byte, at build or start time). pay and komando.efolusi.com do this. A hash written by hand goes stale when the contract changes, so compute it from the function.

A hash site picks up a changed script on its next build. When `themeInitScript()`'s text changes between releases (1.31.0 rewrote it to drop System), a site that hard-codes the old hash blocks the script and flashes the wrong theme until it rebuilds. Nonce sites are not affected, and a versioned `browser/<version>/` pin keeps its old bytes.

## Plain HTML sites

Sites without React load two files from `browser/`. Self-host them from the npm package (`@efolusi/meridian/browser/…`), or load the versioned copy, which never changes once published, with its hash from `browser/hashes.json`:

```html
<head>
  <!-- before the CSS: no flash -->
  <script src="https://meridian.efolusi.com/browser/1.27.0/theme-init.js"
          integrity="sha256-…" crossorigin="anonymous"></script>
  <script type="module" src="https://meridian.efolusi.com/browser/1.27.0/marketing.js"
          integrity="sha256-…" crossorigin="anonymous"></script>
</head>
```

The unversioned `/browser/` files change with each release and serve meridian.efolusi.com itself; product sites do not load them.

Both files keep `data-theme` on `<html>` at the resolved `light` or `dark`, and `marketing.js` re-resolves it when the device changes while there is no stored choice. Code that reads the theme should compare `data-theme` with `"dark"`, not test whether the attribute exists.

`marketing.js` wires the markup the React components render, by `data-slot`: the theme toggle, the `SiteHeader` mobile menu and the `Marquee` pause button. It also wires markup added later. `init(root)` returns a cleanup function, for content you mount yourself.

```html
<button type="button" data-slot="theme-toggle" class="ef-theme-toggle">
  <svg data-theme-icon="light" aria-hidden="true">…</svg>
  <svg data-theme-icon="dark" aria-hidden="true">…</svg>
</button>
```

The labels follow the nearest `lang` (`en` or `id`). For a strict CSP, the files use no eval, no HTML strings and no style attributes. `browser/hashes.json` lists their `sha256-` hashes for `integrity=` or a `script-src` hash, and the hashes change only when a file changes.
