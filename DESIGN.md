# Meridian design decisions

The one page an agent or a designer reads before touching Meridian, Glamor or a product built on them. It names the decisions. Values live in the tokens (`tokens.json`, vendored from [efolusi/design-tokens](https://github.com/efolusi/design-tokens)); this file repeats a value only where it is a measurement, and says when it was measured.

Every statement here is true of the code today, or it sits under Known gaps. A statement with a check names the check; a statement with no check is held by review only. Where `guidelines/brand.md` and the code disagree, this file says both and names the row; it does not pick. "Today" always means the code.

Longer rules: [guidelines/brand.md](guidelines/brand.md) (language), [guidelines/theming.md](guidelines/theming.md), [guidelines/motion.md](guidelines/motion.md), [guidelines/accessibility.md](guidelines/accessibility.md), [guidelines/patterns.md](guidelines/patterns.md), [guidelines/forms.md](guidelines/forms.md), [STYLEGUIDE.md](STYLEGUIDE.md).

## Overview

Meridian is warm, quiet and exact. Warm paper in light, warm charcoal in dark, one copper accent, structure drawn by hairlines, motion that confirms an action. It is a tool for people who work in it all day, so it says little and does what it says.

It is not led by glass or gradients, not a cool grey enterprise kit, and not decorative. Nothing in the product UI uses emoji, Title Case or a bounce.

Meridian is the web half. [Glamor](https://github.com/efolusi/glamor) is the native half. Both read [design-tokens](https://github.com/efolusi/design-tokens). Glamor keeps its own native scales for radius, control height and type size (see Known gaps).

## Colors

One neutral ramp (`--sand-25` to `--sand-950`), one brand ramp (`--brand-50` to `--brand-950`), one copper ramp (`--copper-300` to `--copper-600`), four status families (success, warning, danger, info) and five chart colors. Components never read a ramp stop. They read a role. Only roles are remapped in dark.

### Brand and accent

| Role | Token | Use |
|---|---|---|
| Accent | `--accent` (copper in both themes) | The fill of the one primary action per view. `--accent-hover`, `--accent-active` for its states, `--accent-contrast` for the label on it. brand.md says primary actions use espresso ink `--brand-950`, code says `--accent` (`Button.jsx:33`): see MD174, open. Today: copper. |
| Accent edge | `--accent-edge` | Every shape drawn in the accent: the edge of the primary button, a check mark, a switch that is on, a progress fill, a tab underline. The accent fill alone is under 3:1 on light surfaces. |
| Accent as text | `--text-link`, `--text-link-hover` | Links. A link in running text keeps its underline. |
| Quiet accent | `--accent-subtle`, `--accent-subtle-border`, `--accent-subtle-fg` | Selected rows, soft emphasis. |
| Decoration only | `--accent-warm`, `--accent-soft` | Never the edge of a control. |
| Focus | `--focus-ring`, `--focus-ring-danger` | Two-layer ring: a 2px gap in the surface colour, then a 2px band. |

### Surfaces

Hierarchy comes from surface steps and hairlines, not from shadows. Ratios are against `--surface-page`, measured 2026-11-29 in a real browser (picture in the research note).

| Token | Use | Light | Dark |
|---|---|---|---|
| `--surface-page` | The page. brand.md says `--sand-50`, tokens say `--sand-25`: see MD175, open. Today: `--sand-25`. | 1.00 | 1.00 |
| `--surface-subtle` | A quiet fill: a message bubble, a citation, a pressed card | 1.02 | 1.04 |
| `--surface-sunken` | A well inside a card; hover fill for quiet controls. brand.md says the quiet hover is `--sand-100`, code says `--surface-sunken`: see MD182, open. In dark it is lighter than the card: see MD165, open. | 1.06 | 1.22 |
| `--surface-card` | Cards, panels, fields (`--surface-panel` is the same value) | 1.03 | 1.10 |
| `--surface-elevated` | A raised card (`Card elevated`, the floating `Sidebar` panel) | 1.03 | 1.20 |
| `--surface-brand` | `Section tone="band"` and the `brand` Button. brand.md says cocoa `#482818`, tokens say a light peach in light and a deep brown in dark: see MD184, open. | 1.16 | 1.21 |
| `--surface-inverse` | An inverse panel, full bleed, with `--text-inverse` | 16.74 | 16.76 |
| `--surface-code`, `--surface-track` | Code blocks; the empty track of a progress bar or switch | not measured | not measured |

A card in a list keeps `--surface-card`. At most two background colours in one view.

### Text

| Token | Use |
|---|---|
| `--text-primary` | Headings and body |
| `--text-secondary` | Supporting text |
| `--text-muted` | Hints, captions, meta |
| `--text-disabled` | Disabled labels only |
| `--text-link` | Links and the accent as text |
| `--text-inverse`, `--text-inverse-muted` | On `--surface-inverse` |
| `--text-on-brand`, `--text-on-media` | On a brand band, on a photo |

Primary, secondary and muted pass 4.5:1 on page, card and sunken in both themes (check: `scripts/check_contrast.py`).

### Borders

| Token | Use |
|---|---|
| `--border-default` | A card, a divider. Decoration, exempt from contrast minimums. brand.md says `--sand-200`, tokens say a separate value (`#EDE9E1`): see MD176, open. Today: the token. |
| `--border-strong` | A stronger divider. Decoration. |
| `--border-control`, `--border-control-hover` | The outline of something you operate: a field, a checkbox. |
| `--border-hover` | A card or tile border on hover. `Card` reads a ramp stop instead, and in dark that is lighter, not darker: see MD181, open. |

A border that carries state alone (an error outline, a selected row) uses a colour of 3:1 or more: `--danger-600`, `--accent-edge`.

### Status

Each family has a tint (`*-100`), a border (`*-300`), a text and solid colour (`*-600`, danger text `-700`), a label colour on the solid (`*-contrast`) and a text colour for dark grounds (`*-on-dark`). The tokens carry four families (success, warning, danger, info); components read three. brand.md says three trios: see MD186, open. Meaning is fixed: success is done or healthy, warning needs attention, danger failed or destructive. Status is never colour alone: Badge has text, Alert an icon, Progress a value.

### Dark

Dark is a second mapping of the same roles, never a second set of ramp stops. `[data-theme="dark"]` re-points surfaces, text, borders, the accent group, status and the focus ring. With no `data-theme`, the OS decides. Both themes are measured by the visual baselines and axe runs.

## Typography

| Family | Token | Use |
|---|---|---|
| Bricolage Grotesque | `--font-display` | h1 to h4, page titles, display moments |
| Figtree | `--font-sans` | Everything else |
| JetBrains Mono | `--font-mono` | Code, keys, tabular figures |

All three are self-hosted and variable. Each token carries its fallback stack.

Sizes are `--text-4xs` (9px) to `--text-7xl` (76px), 14 steps. brand.md says the minimum is 12px: see MD179, open. Weights are `--weight-regular` 400, `-medium` 500, `-semibold` 600, `-bold` 700, `-display` 560; brand.md says display 500 to 700, wordmark 600 to 680, the docs say 600 to 700: see MD178, open. Leading: `--leading-tight` 1.1, `-snug` 1.25, `-normal` 1.5, `-relaxed` 1.65. Tracking: `--tracking-display` -0.025em, `-tight` -0.01em, `-wide` 0.06em; brand.md says display tracking is -0.02em: see MD177, open. Today: the tokens.

What is fixed today:

| Role | Rule |
|---|---|
| Body of the UI | `--text-md` (14px), `--leading-normal`, `--font-sans` |
| h1 to h4 | `--font-display`, `--tracking-display`, `--leading-snug`, no margin |
| Page title (`.ef-page-title`) | `clamp(--text-3xl, 4vw, --text-4xl)`, bold, `--leading-tight` |
| Hero title | `clamp(--text-5xl, 4.2vw, --text-6xl)`, bold |
| Fields on a phone | 16px at 767px and narrower, so iOS does not zoom on focus |
| Eyebrow | brand.md says 12px, semibold, 0.06em; code says `Section` eyebrow is 12px mono medium, other uppercase labels are 11px or 10.5px with 0.04em or 0.06em: see MD180, open |
| Numbers in metrics | `Stat` value is mono (`--font-mono`); brand.md asks tabular mono for tables too, held by review |

Sentence case everywhere. Weight before size for emphasis. The full role table (display, headings, lead, body, label, caption, code) is a known gap.

## Layout

- **Spacing:** a 4px scale, `--space-1` (4px) to `--space-32` (128px), plus `--space-0-5` (2px). Components never use a literal gap.
- **Container:** `--container-max` 1200px, `--container-text` 720px.
- **Controls:** `--control-h-xs` 24, `-sm` 28, `-sm-plus` 32, `-md` 36, `-md-plus` 40, `-lg` 44, `-xl` 52. `data-density="compact"` lowers them. On a coarse pointer every control up to `-lg` is 44px (`--tap-min`).
- **Label and icon:** the gap is `--gap-label-icon` (8px), or `--gap-label-icon-sm` (4px) in Badge, Button `xs` and Link (check: `scripts/check_label_icon_gap.mjs`).
- **Rhythm:** 16 to 24px inside a card, 24px between blocks in an app, 96px or more between marketing bands (stated in brand.md, held by review).
- **Sidebar:** `--sidebar-width` 256px, `--sidebar-width-icon` 48px.

## Elevation

| Level | Treatment | Use |
|---|---|---|
| 0 Flat | No border, no shadow | Page, text, footers |
| 1 Hairline | `--surface-card` and a 1px `--border-default` | Every card at rest |
| 2 Raised | `--surface-elevated` and `--shadow-elevated`; in dark a 1px ring and a lit top edge, in light a soft shadow | `Card elevated`, the floating `Sidebar` panel |
| 3 Floating | `--shadow-md` | Dropdowns, popovers, menus |
| 4 Overlay | `--shadow-xl` and `--overlay-scrim` | Dialog, AlertDialog, Drawer |
| Focus | `--focus-ring` | Any focused control |

In dark, `--shadow-sm`, `-md` and `-lg` add a 1px ring, because a black shadow cannot show on a near-black page. Under `prefers-contrast: more` the raised ring turns stronger and glass turns opaque.

Blur: brand.md says sticky headers only. Code says `backdrop-filter` in six overlays (`ContextMenu`, `Drawer`, `DropdownMenu`, `HoverCard`, `Popover`, `Sheet`), in the `ef-glass--blur` class (the sticky `TopNav`) and in the `GeneratedImage` actions; `prefers-reduced-transparency` and `prefers-contrast: more` turn it off: see MD183, open. Glass strength is `--glass-strength`.

Gradients: brand.md says none. Code has eight components with one (a fade, a scrim, a scroll edge, the `Decor` patterns, an opt-in `Skeleton` shimmer, `Loader` shimmer, an upload bar): see MD170, open. Inner shadows: brand.md says none; two components use a non-ring inset shadow (`SegmentedControl`, `Command`): see MD187, open.

## Shapes

| Token | Value | Takes |
|---|---|---|
| `--radius-xs` | 4px | Checkboxes and other small square controls |
| `--radius-xs-plus` | 6px | Compact inline parts |
| `--radius-sm` | 10px | Buttons and fields |
| `--radius-md` | 16px | Cards, and fields under `data-shape="pill"` |
| `--radius-lg` | 22px | Dialog, AlertDialog, Drawer. brand.md says 22px for all overlays; popovers, menus, hover cards and toasts take `--radius-md`: see MD185, open |
| `--radius-xl` | 28px | Hero media |
| `--radius-full` | 999px | Avatars, dots, pills |

`data-shape="pill"` on `<html>` or `<body>` makes everything you press a pill (`--press-radius`) and every field 16px (`--field-radius`). Do not force `.ef-btn { border-radius }`. A raw radius in a component is a test failure.

## Components

138 `.jsx` files in 14 folders under `components/`: ai, code, data, dates, display, feedback, files, finance, forms, icons, marketing, navigation, overlay, and the shared runtime. Each component ships `.jsx`, `.d.ts`, `.prompt.md` and a specimen in its group card.

**Variant axes:** `variant` (visual style), `size` (`sm | md | lg`; Button also takes `xs`, `xl` and the icon sizes), `tone` (semantic colour). Never `kind`, `type` or `color`. Button variants: `default`, `primary`, `secondary`, `ghost`, `link`, `danger`, `brand`, `band`. One primary action per view; never two ink buttons side by side.

**States every interactive component answers:**

| State | Rule |
|---|---|
| Rest | Role tokens only |
| Hover | A fill step (`--surface-sunken`) or a border step (`--border-hover`), only inside `@media (hover: hover)`, so a tap never leaves a fill. brand.md says cards darken their border: see MD181, open |
| Focus | `:focus-visible`, `--focus-ring`, never removed; forced-colors draws a 2px `Highlight` outline |
| Active | `transform: scale(var(--motion-press))`, 0.98 |
| Disabled | Dimmed and not clickable. The dimming value is not one value yet (Known gaps). |
| Loading | `Button loading`: the spinner replaces the icon, the label stays, the button disables |
| Error | A field shows `FieldError` under it; a region shows `Alert`; copy says what happened and how to fix it |
| Empty | `Empty` leads with the action, not the absence |

Which component for loading, empty, error and destructive moments: [guidelines/patterns.md](guidelines/patterns.md). Validation timing: [guidelines/forms.md](guidelines/forms.md).

**Motion:** 120, 200 and 250ms; 400ms (`--dur-modal`) only for a modal, drawer or panel arriving. `--ease-enter` for enters, exits and state changes; `--ease-emphasised` only on the Switch thumb (a test fails any other use). Nothing animates longer than 250ms in product UI. `prefers-reduced-motion` turns travel and scale off (check: `scripts/check_motion.mjs`, `scripts/check_reduced_motion.mjs`).

**Icons:** the curated Lucide set in `assets/icons/`, drawn by the `Icon` component. 16px inline, 20px in navigation and lists, 24px for features. No icon font, no emoji.

## Do and Don't

| Do | Held by |
|---|---|
| Read roles (`--surface-card`, `--text-muted`), never hex | `scripts/check_token_adherence.py` for colours |
| Draw structure with hairlines; give a shadow only to what floats | review |
| Keep one primary action per view | review |
| Put hover fills inside `@media (hover: hover)` | review |
| Pair every status colour with text or an icon | review, axe |
| Write buttons as verbs, sentence case: "Save changes" | review |
| Take every duration and curve from the motion tokens | `scripts/check_motion.mjs` |
| Set field text to 16px at 767px and narrower | `tests/md86-phone-control-text.test.mjs` |
| Rename cleanly and update every caller in the same change | review |

| Don't | Held by |
|---|---|
| Use a raw hex or a ramp stop (`--sand-400`) in a component | colours: check; ramp stops: review only (Known gaps) |
| Add a gradient as a surface or fill, an emoji, Title Case or ALL CAPS body text (gradient exceptions: MD170) | review |
| Remove the focus ring or set `outline: none` without a replacement | axe, review |
| Use `transition: all` or a bounce | `scripts/check_motion.mjs` |
| Force `.ef-btn { border-radius }`; use `data-shape` or `--press-radius` | review |
| Name a local helper like a DS export (`Card`, `Stat`) | `tests/apps-ds-name-collisions.test.mjs` |
| Keep an alias, a shim or a deprecation note for a renamed prop or token | review |

## Responsive behavior

Today's rules, from the code:

- **Touch:** on a coarse pointer every control up to `-lg` is 44px (`--tap-min`).
- **Phone:** fields are 16px at 767px and narrower. `TabBar` shows below 720px. `SiteHeader` collapses at 860px and narrower. `SiteFooter` goes to one column at 640px and narrower. `Alert` stacks its action at 559px and narrower. `Field` lays out in a row from 640px.
- **Type:** page and hero titles scale with `clamp()` between two `--text-*` steps.
- **Density:** `data-density="compact"` for dense tools; a coarse pointer overrides it.

Not yet written: a named breakpoint scale, what collapses at each step, and image behaviour. See Known gaps.

## Iteration guide

1. Open an RFC issue before a new component or an API change.
2. Put a new value in design-tokens first: change it there, tag it, then run `node scripts/sync_tokens.mjs <tag>`. Never edit `tokens/{colors,typography,spacing,effects}.css` here.
3. Style with roles. If no role fits, ask for a role; do not reach for a ramp stop.
4. Ship the four files: `.jsx`, `.d.ts` (every prop documented), `.prompt.md`, and a specimen showing every variant and state.
5. Recompile the bundle (`node scripts/build_bundle.mjs`). A source-only component edit ships stale behaviour.
6. Run `npm run check`, then open `site/_smoke.html`.
7. Look at a new component in place beside its siblings, in light and dark, before it merges.
8. A breaking change is a clean rename: update every caller, mark it Breaking in `CHANGELOG.md`, add before and after code to `guidelines/migration.md`.

## Known gaps

Tracked as issues; each title starts with its row ID.

Real defects, target 2.7.1:

- No named breakpoint scale; the code uses nine different widths (MD167).
- No type hierarchy table by role; raw font weights in components (MD166).
- `--surface-sunken` is lighter than `--surface-card` in dark (MD165).
- The disabled dimming is 0.45 on most controls, 0.5 on Input and flat on the primary Button; the token `--opacity-disabled` is 0.3 and unused (MD168).
- `Skeleton` and `Loader` have a shimmer in Meridian; Glamor has none (MD172).

Other gaps:

- brand.md disagrees with the code on the primary colour (MD174), page colour (MD175), card border (MD176), display tracking (MD177), display weight (MD178), smallest text (MD179), eyebrow (MD180), card hover (MD181), quiet hover fill (MD182), blur (MD183), brand band colour (MD184), overlay radius (MD185), status families (MD186), inner shadows (MD187) and gradients (MD170).
- 16 component files read a ramp stop instead of a role; no check catches it (MD171).
- No state matrix per component (MD169).
- The outline Button edge is 1.5:1 in light and 1.63:1 in dark (MD151).
- Visual baselines run at 1280px wide only (MD154).
- Overlays and menus are tested in jsdom only (MD153).
- Glamor keeps its own radius, control and type scales (GL91).
- No shared email layout (MD159).
