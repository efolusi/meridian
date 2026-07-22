# Theming

How to put your own brand on Meridian without forking component code. Components style against semantic tokens only, so a rebrand is a CSS override file, not a component edit.

Two ways to apply everything below:

- **Vendored folder** — edit `tokens/colors.css` (and `tokens/fonts.css`) in place. `scripts/check_contrast.py` verifies your edits directly.
- **CDN or npm** — leave the stylesheet untouched and load one override file after it:

```html
<link rel="stylesheet" href="https://meridian.efolusi.com/styles.css">
<link rel="stylesheet" href="brand.css">
```

## The three token layers

1. **Ramps** — raw scales in `tokens/colors.css`: `--sand-25…950` (warm neutrals), `--brand-50…950` (the identity color, cream→cocoa), and the status hexes. Physical constants: the same value in light and dark.
2. **Semantic aliases** — the vocabulary components actually use: `--surface-page`, `--text-primary`, `--accent`, `--focus-ring-color`, and friends. Each resolves to a ramp stop or a tuned hex. This is the only layer the dark theme remaps.
3. **Component styles** — every component reads semantic tokens only. No component knows a hex.

A rebrand touches layer 2, plus the `--brand-*` stops in layer 1 when the identity color itself changes: links (`--text-link`), focus (`--focus-ring-color`), and the light-theme text selection (`--brand-100`) all resolve through that ramp, so replacing the ramp carries them at once. The sand neutrals can stay — a brand usually lives in the accent, not the paper.

## The minimum viable rebrand

The brand rides on a small set of tokens: the accent group (`--accent`, `--accent-hover`, `--accent-active`, `--accent-contrast`, plus the `--accent-subtle` / `--accent-subtle-border` tint pair), the focus ring pair (`--focus-ring-color`, `--focus-ring-offset`), the link color (`--text-link`), and the `--brand-*` ramp they resolve through. Everything else is neutral.

Copy this block and swap in your values. The example is a deep teal; every pair in it passes the contrast duty below, in both themes.

```css
/* brand.css — load after styles.css */
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
  --accent-subtle: var(--brand-50);
  --accent-subtle-border: var(--brand-200);

  /* Focus ring + links. These three repeat the stylesheet defaults —
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
- **Your `:root` block outranks the stylesheet's dark block.** Both selectors have equal specificity and your file loads later, so any dark-remapped token you set in `:root` needs a dark value in the same file — otherwise dark mode inherits your light value.

From the block above, the dark-remapped tokens are the six accent tokens, `--text-link`, and `--focus-ring-color` (the ramp and `--focus-ring-offset` are not). So the dark half restores or retunes exactly those:

```css
/* brand.css, continued */
[data-theme="dark"] {
  /* The first four restore the stylesheet's own dark accent — near-white,
     so primary buttons stay the brightest thing on a dark page. */
  --accent: #F3EFE7;
  --accent-hover: #FFFFFF;
  --accent-active: #D5CFC0;
  --accent-contrast: #1E1A14;
  --accent-subtle: #12251E;        /* dark tint of your brand */
  --accent-subtle-border: #1E4033;
  --text-link: var(--brand-400);
  --focus-ring-color: var(--brand-400);
}
```

The invariant: **only semantic aliases ever appear inside `[data-theme="dark"]`.** If you catch yourself writing `--brand-500` in the dark block, stop and remap the alias that points at it instead. One ramp, two semantic mappings is what keeps a single source of color truth — and what lets `scripts/check_contrast.py` reason about both themes from one file.

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

The `--font-*` tokens are not dark-remapped, so `:root` alone is safe. Keep the fallback stacks. One tuning knob: `--weight-display` (680) is tuned to Bricolage Grotesque's variable axis — if your display face is a static family, set it to a weight the face actually has.

## Contrast duty

Any replacement value must keep the guarantees the stock palette ships with: **4.5:1 for text (WCAG 1.4.3), 3:1 for non-text UI (WCAG 1.4.11)**, in both themes. The pairs that must hold:

- `--text-primary`, `--text-secondary`, `--text-muted` on `--surface-page`, `--surface-card`, and `--surface-sunken` — ≥ 4.5:1
- each status foreground (`--success-600`, `--warning-600`, `--danger-600`) on its `*-100` tint and on `--surface-card` — ≥ 4.5:1
- `--accent-contrast` on `--accent` — ≥ 4.5:1
- `--focus-ring-color` on all three surfaces and on `--focus-ring-offset` — ≥ 3:1

The verifier is in the repo:

```
python3 scripts/check_contrast.py
```

It parses `tokens/colors.css`, follows every `var()` chain per theme, composites translucent colors before measuring, and hard-fails any pair it cannot resolve. It reads that file only — vendored installs just run it; if you theme via a separate override file, mirror your values into `tokens/colors.css` in a checkout of this repo and run it there. Don't ship a brand it hasn't passed.

## What not to touch

- **Component CSS.** Components read semantic tokens only; that contract is the entire reason retheming works. The moment a component gains a hardcoded hex or a per-brand edit, you own a fork and the next Meridian release stops being a drop-in. Restyle by remapping tokens, never by editing `components/`.
- **Ramp semantics.** 50 stays lightest, 950 darkest, steps evenly spaced. Derived tokens assume the ordering — `--brand-700` must be dark enough to hold 4.5:1 as text on light surfaces, `--brand-400` light enough to hold it on dark ones. Invert or skew the ramp and every derived guarantee fails at once.
- **Status trios.** `--success-*`, `--warning-*`, and `--danger-*` each ship a 600 foreground, 100 tint, and 300 border, with the 600 holding 4.5:1 on the tint and on white. Retune the hues if your brand demands it, but keep the trio shape and re-run the checker.
- **The code surface.** `--surface-code`, `--text-code`, and `--border-code` are fixed dark in both themes on purpose — terminals don't flip. Never remap them.
