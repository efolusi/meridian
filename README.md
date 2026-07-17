# Meridian — the Efolusi design system

Efolusi builds multiple SaaS products for both B2B and B2C. **Meridian** is the company's open-source design system — tokens, typography, components, and full UI kits — intended to scale the way shadcn / Google / Microsoft systems do. One visual language across every Efolusi product: the admin console, auth, marketing site, and docs.

## Products

- **Agent** — autonomous AI operator (Manus/Codex-class): plans, runs tools, ships reviewable work → ChatMessage, PromptComposer, Steps, Terminal.
- **Infra** — centralized infrastructure: clouds, SSH, databases, caches, SSL, domains, DNS → StatusDot, KeyValueList, CopyField, Table, Terminal.
- **Content** — node AI scaling content across text, image, audio, video → FileDrop, FileTile, Steps. (No dedicated kit yet — Tools shows the file patterns.)
- **Tools** — all-in-one file utilities: convert, encode/decode, scan → FileDrop, FileTile, Progress.
- **Trader** — trading robot AI → Sparkline, Stat, Table.
- **Social Finance** — shared portfolios, social signals → Avatar, Sparkline, mono money.

**Sources provided:** a single brand mark (`assets/logo.png`, an owl in cocoa/caramel/cream — uploaded by the team) and directional answers (bold & expressive personality; warm sand neutrals; a blue primary — later corrected: the palette now derives entirely from the logo; humanist sans type; subtle 4px radii; comfortable density; light mode only; Lucide icons; springy motion). No codebase, Figma, or existing product UI was provided — every component and screen here is an original authoring of the system, not a recreation.

## Brand identity

The owl mark is the anchor: wise, warm, a little playful. The palette pairs the owl's **warm browns** (cocoa `#482818`, caramel `#C08A5A`, peach `#EFCFAC`, cream `#F8F4E6` — sampled from the mark) with **sand neutrals**. Interaction color comes from the mark too: **espresso ink** (`--brand-950` `#2C1709`) for primary actions, caramel (`--brand-700`) for links and focus. Design stance: beautiful, fast, minimalist, powerful — warm paper, espresso ink, hairline structure, motion that never performs.

- **Wordmark:** "Efolusi" set in Bricolage Grotesque 650–700, tracking -0.02em, next to the owl. There is no separate logotype file; render the name in type.
- **Fonts (self-hosted, OFL):** Bricolage Grotesque (display), Figtree (UI/body), JetBrains Mono (code). Variable TTFs in `assets/fonts/`.

## Content fundamentals

- **Voice:** confident, direct, warm. Short declarative sentences. We speak as "we", address the user as "you". ("You're all set." / "We'll email you a receipt.")
- **Casing:** Sentence case everywhere — headings, buttons, labels, nav. Never Title Case, never ALL CAPS except tiny eyebrow labels (`letter-spacing: 0.06em`, 12px, semibold).
- **Buttons** are verbs: "Create workspace", "Send invite", "Save changes" — never "Submit", "OK", or "Click here".
- **Empty states** lead with the action, not the absence: "Create your first project" over "No projects found".
- **Errors** say what happened + how to fix, no blame, no jargon: "That email is already in use. Try signing in instead."
- **Numbers & data:** tabular figures in mono for tables/metrics; abbreviate at 10k+ ("12.4k", "$8.2M").
- **Emoji:** never in product UI. Playfulness comes from motion and the owl, not emoji.
- **Vibe check:** Stripe's precision with Notion's warmth. Marketing copy may be bolder ("Ship the boring parts faster.") but stays plain-spoken — no exclamation-mark enthusiasm.

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

## Blocks

Pre-composed sections in `blocks/` (Blocks group in the Design System tab): App shell, Login, Stats dashboard, Settings, Hero, Pricing, FAQ, 404 page, Activity feed. Copy a block's markup as the starting point for a page — they compose the primitives, so they inherit theme + density automatically.

## Theming & density

- **Dark theme:** set `data-theme="dark"` on `<html>` or any subtree. Only semantic aliases remap (espresso surfaces, cream text, caramel links, retuned status tints); ramps stay fixed. Components are theme-safe because they style against semantic tokens only.
- **Compact density:** set `data-density="compact"` for data-heavy ops views — control heights drop to 24/30/38px and table rows tighten via `--table-pad-y/x`.
- Both are attribute scopes, so a dark page can host a light card and vice versa. Specimen: Theming group in the Design System tab.

## Patterns

- `guidelines/forms.md` — validation timing (blur → change → submit), error copy, submit states, async checks
- `guidelines/accessibility.md` — focus rules, full keyboard map, contrast targets, per-component semantics
- `guidelines/governance.md` — semver rules, contribution contract, do/don't, deprecation policy

## Iconography

- **System:** [Lucide](https://lucide.dev) (ISC), 24px grid, 2px stroke assets, round caps/joins — 107 curated glyphs copied as raw SVG into `assets/icons/`. Render via the `Icon` component (inlines the SVG, inherits `currentColor`, and re-strokes to 1.5px at render).
- **Sizes:** 16px inline/buttons, 20px nav/list leading, 24px feature spots. Icon color follows text color; decorative feature icons may sit in a 40px `--sand-100` rounded square.
- **No icon font, no emoji-as-icons, no hand-drawn SVGs.** Unicode glyphs (→, ×) allowed only inside mono/code contexts. Need a glyph we don't ship? Copy it from Lucide and keep the 2px stroke — the `Icon` component only re-strokes assets authored at exactly `stroke-width="2"`.
- **Logo:** `assets/logo.png` (668×668, transparent). Don't redraw, recolor, or add effects. Minimum size 24px.

## Component library

Authored from scratch (no source inventory existed). Namespace: `window.EfolusiDesignSystem_4ffc3d`.

- `components/forms/` — Button, IconButton, Input, Textarea, Select, Checkbox, Radio, Switch, Slider, Combobox, DigitEntry, ButtonTile (+Group), Toggle (+Group), ButtonGroup, InputGroup, Label
- `components/display/` — Card, Badge, Tag, Avatar (+AvatarGroup), Kbd, Divider, Accordion, Link, Toolbar, TreeList, ListItem, Collapsible, AspectRatio, ScrollArea, Carousel, Resizable
- `components/navigation/` — Tabs, Breadcrumbs, Pagination, SegmentedControl, PageControl, SideNav, TopNav, Steps, Menubar
- `components/feedback/` — Dialog, ConfirmDialog, Toast (+ToastStack), Tooltip, Alert, Banner, Progress, Spinner, Loader
- `components/data/` — Table, Stat, EmptyState, Skeleton, BarChart, LineChart, DonutChart, Sparkline, KeyValueList, StatusDot
- `components/overlay/` — Menu, Popover, Drawer, CommandPalette, ContextMenu, HoverCard
- `components/ai/` — ChatMessage, PromptComposer, RichComposer, Reasoning, ToolCall, AgentRun, Task, Todo, Confirmation, Conversation, Citation (+SourceList), SourceCard, Suggestions, PromptSteps, SelectionQuote, ModelSelector, UsageMeter, FeedbackBar, DocumentCard, GeneratedImage, Sandbox, WebPreview, Player, Transcript
- `components/code/` — CodeBlock, Terminal, CopyField, Diff, Console, Exception, EnvList
- `components/files/` — FileDrop, FileTile, FileTypeIcon
- `components/dates/` — Calendar, DatePicker
- `components/finance/` — PaymentCard
- `components/icons/` — Icon (Lucide loader)

**Intentional additions** beyond the classic starter set: `Icon` (required wrapper for the copied Lucide SVGs), plus the data/overlay tier (Table, Stat, Menu, Drawer, …) sized to what the console, docs, and marketing kits actually use — nothing speculative.

## Index

The layout is Meridian's own, organized by purpose: the system core stays at the root (that is the vendoring API and the compiler contract), the library and demo surfaces each get one shallow, self-describing directory, and the docs site consumes them all. Full rationale in `ARCHITECTURE.md`.

- `styles.css` — global entry; imports everything under `tokens/` (link this one file and the system is live)
- `tokens/` — fonts.css, colors.css, typography.css, spacing.css, effects.css, base.css
- `assets/` — logo.png, fonts/ (5 variable TTFs + OFL license texts), icons/ (107 Lucide SVGs + license)
- `_ds_bundle.js` + `_ds_manifest.json` — compiled component bundle and machine-readable manifest (generated by the DS compiler; see `ARCHITECTURE.md`)
- `components/<group>/` — the 104 components; each ships `.jsx` + `.d.ts` + `.prompt.md` + a group card HTML
- `blocks/` — 9 pre-composed sections to paste into a page
- `showcases/<product>/` — 8 product demos in plain JSX: agent, auth, console, docs, infra, tools, trader, website
- `starters/<journey>/` — 5 journeys to copy wholesale, one per category, linked pages sharing a consistent shell: marketing (home → pricing → contact), auth (sign in → sign up → onboarding, + password reset), dashboard (overview → customers → detail → settings), app (overview → projects → detail → new project → settings), docs (quickstart → authentication → errors)
- `site/` — the docs website (home, docs, components, blocks, charts, themes, colors), plus `examples/` (the live demos), `registry.json`, and generated `r/` install items
- `guidelines/` — foundation specimen cards + accessibility, forms, governance
- `skills/` — the agent skill entry point
- `scripts/` — registry generator, contrast check, runtime-copy drift check
- `ARCHITECTURE.md` — how the pieces fit · `STYLEGUIDE.md` — contributor conventions
- `LICENSE` — MIT · `THIRD_PARTY_NOTICES.md` · `CONTRIBUTING.md` — component contract + PR checklist

**Showcases vs starters:** showcases (`showcases/`) are one rich screen per product, written in plain JSX so you can lift code straight into a React app; starters (`starters/`) are self-contained multi-page journeys you copy wholesale to start a surface. Four pairs intentionally cover the same category in both forms (console/dashboard, auth, website/marketing, docs).

## Caveats

- No original font binaries were provided; Bricolage Grotesque, Figtree, and JetBrains Mono (all OFL, from google/fonts) are the chosen substitutes. Replace the files in `assets/fonts/` to swap.
- The logo is PNG only; an SVG master would improve crispness at large sizes.
- All UI kit screens are original demonstrations of the system, since no existing product UI was available to recreate.

## License

MIT — free for commercial and personal use, modification, and redistribution. See `LICENSE`. Bundled fonts (SIL OFL 1.1) and Lucide-derived icons (ISC/MIT) keep their own licenses: `THIRD_PARTY_NOTICES.md`. The Efolusi owl mark and the "Meridian"/"Efolusi" names are not covered by the MIT grant — don't use them to brand derived systems. Contributions welcome: `CONTRIBUTING.md`.
