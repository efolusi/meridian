# Design language

The visual and verbal rules behind Meridian: where the palette comes from, how the type and spacing scales are built, what the motion is allowed to do, and how the product should sound. The README covers what Meridian is and how to install it; this file covers how to design with it.

## Brand identity

The owl mark is the anchor: wise, warm, a little playful. The palette pairs the owl's **warm browns** (cocoa `#482818`, caramel `#C08A5A`, peach `#EFCFAC`, cream `#F8F4E6` — sampled from the mark) with **sand neutrals**. Interaction color comes from the mark too: **espresso ink** (`--brand-950` `#2C1709`) for primary actions, caramel (`--brand-700`) for links and focus. Design stance: beautiful, fast, minimalist, powerful — warm paper, espresso ink, hairline structure, motion that never performs.

- **Wordmark:** "Efolusi" set in Bricolage Grotesque 650–700, tracking -0.02em, next to the owl. There is no separate logotype file; render the name in type.
- **Fonts (self-hosted, OFL):** Bricolage Grotesque (display), Figtree (UI/body), JetBrains Mono (code). Variable WOFF2 in `assets/fonts/`.

## Content fundamentals

- **Voice:** confident, direct, warm. Short declarative sentences. We speak as "we", address the user as "you". ("You're all set." / "We'll email you a receipt.")
- **Casing:** Sentence case everywhere — headings, buttons, labels, nav. Never Title Case, never ALL CAPS except tiny eyebrow labels (`letter-spacing: 0.06em`, 12px, semibold).
- **Buttons** are verbs: "Create workspace", "Send invite", "Save changes" — never "Submit", "OK", or "Click here".
- **Empty states** lead with the action, not the absence: "Create your first project" over "No projects found".
- **Errors** say what happened + how to fix, no blame, no jargon: "That email is already in use. Try signing in instead."
- **Numbers & data:** tabular figures in mono for tables/metrics; abbreviate at 10k+ ("12.4k", "$8.2M").
- **Emoji:** never in product UI. Playfulness comes from motion and the owl, not emoji.
- **Vibe check:** precise, warm, unhurried. Marketing copy may be bolder ("Ship the boring parts faster.") but stays plain-spoken — no exclamation-mark enthusiasm.

## Visual foundations

- **Color:** warm sand neutral ramp (`--sand-25…950`) for surfaces/text; brand ramp (`--brand-50…950`, cream→peach→caramel→cocoa sampled from the mark): espresso `--brand-950` for primary actions, caramel `--brand-700` for links + focus, cream for selection; the deep end of the ramp (cocoa `#482818`) for brand moments — hero bands, inverse panels, the `brand` button variant. Status trios (success/warning/danger) each ship a 600 fg, 100 bg, 300 border.
- **Surfaces:** page is warm paper `--sand-50`, cards are pure white with a 1px `--sand-200` border. Max two background colors per view. Inverse/brand sections use `--sand-950` (espresso) or `--cocoa-700` full-bleed with cream text.
- **Type:** Bricolage Grotesque for h1–h4 and display moments (weight 500–700, tracking -0.02em, optical sizing carries the personality); Figtree 400/500/600 for everything else; JetBrains Mono for code, keys, and tabular numbers. UI base 14px, body prose 16px, minimum 12px.
- **Spacing:** 4px scale (`--space-1…32`). Comfortable density: 36px default control height (28 compact / 44 large), 16–24px card padding, 24px section gaps in-app, 96px+ between marketing bands.
- **Radii:** subtle and consistent — 4px controls (`--radius-sm`), 8px cards (`--radius-md`), 12px overlays (`--radius-lg`), 16px hero media (`--radius-xl`), pills `--radius-full`. Nothing blob-shaped.
- **Borders & shadows:** 1px warm hairlines do ALL the structural work; cards are border-only at rest. Shadows exist only where something floats — `--shadow-md` dropdowns, `--shadow-pop` modals. No inner shadows, no decorative elevation.
- **Motion:** fast and assured: 100/160/240ms. `--ease-spring` is a soft settle (no bounce) for entrances; `--ease-out` everywhere else. Buttons scale to .985 on press; cards darken their border on hover (no lift); overlays scale from .96 + fade. Nothing longer than 240ms; no parallax. Motion confirms — it never performs.
- **Hover:** darker fill for solid controls (`--accent-hover`), `--sand-100` wash for quiet ones, underline for links. **Press:** darker still + scale(.985). **Focus:** 2px caramel ring (`--focus-ring`), never removed.
- **Imagery:** warm-toned, natural light, cream/sand backgrounds preferred. No cool-blue stock. No gradients, period.
- **Transparency & blur:** sticky headers only (`rgba(250,249,246,.85)` + 12px blur). Nowhere else.

## Iconography

- **System:** [Lucide](https://lucide.dev) (ISC), 24px grid, 2px stroke assets, round caps/joins — 108 curated glyphs copied as raw SVG into `assets/icons/`. Render via the `Icon` component (inlines the SVG, inherits `currentColor`, and re-strokes to 1.5px at render).
- **Sizes:** 16px inline/buttons, 20px nav/list leading, 24px feature spots. Icon color follows text color; decorative feature icons may sit in a 40px `--sand-100` rounded square.
- **No icon font, no emoji-as-icons, no hand-drawn SVGs.** Unicode glyphs (→, ×) allowed only inside mono/code contexts. Need a glyph we don't ship? Copy it from Lucide and keep the 2px stroke — the `Icon` component only re-strokes assets authored at exactly `stroke-width="2"`.
- **Logo:** `assets/logo.png` (668×668, transparent). Don't redraw, recolor, or add effects. Minimum size 24px.
