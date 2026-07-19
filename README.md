# Meridian

**A general-purpose open-source design system by [Efolusi](https://efolusi.com).** 104 accessible React components, 177 design tokens in light, dark and compact, 9 blocks, and 8 full example apps — served browser-native with **no build step**.

[![License: MIT](https://img.shields.io/badge/License-MIT-7A4E2B.svg)](LICENSE)
[![Docs](https://img.shields.io/badge/docs-meridian.efolusi.com-2C1709.svg)](https://meridian.efolusi.com)
[![Components](https://img.shields.io/badge/components-104-A0693C.svg)](https://meridian.efolusi.com/site/Components.dc.html)
[![Zero dependencies](https://img.shields.io/badge/runtime%20deps-react%20only-5C3A1F.svg)](#quickstart)

**[Live docs](https://meridian.efolusi.com)** · [Components](https://meridian.efolusi.com/site/Components.dc.html) · [Blocks](https://meridian.efolusi.com/site/Blocks.dc.html) · [Example apps](https://meridian.efolusi.com/site/Examples.dc.html) · [Themes](https://meridian.efolusi.com/site/Themes.dc.html)

Warm paper, espresso ink, hairline structure. Copy it, theme it, ship it.

## Quickstart

Four tags. No install, no bundler, no config — every component lands on one global.

```html
<link rel="stylesheet" href="https://meridian.efolusi.com/styles.css">
<script src="https://unpkg.com/react@18.3.1/umd/react.production.min.js"></script>
<script src="https://unpkg.com/react-dom@18.3.1/umd/react-dom.production.min.js"></script>
<script src="https://meridian.efolusi.com/_ds_bundle.js"></script>
```

```jsx
const { Button, Card, Stat } = window.EfolusiDesignSystem_4ffc3d;

<Card title="Revenue" padding={20}>
  <Stat label="MRR" value="$48.2k" delta="12.4%" direction="up" />
  <Button onClick={save}>Save changes</Button>
</Card>
```

A complete runnable page is in [`hello.html`](hello.html) — open it in a browser, nothing else required.

Dark mode and compact density are attribute scopes, not rebuilds:

```html
<html data-theme="dark" data-density="compact">
```

### Other ways to install

| Path | When to use it | How |
|---|---|---|
| **CDN** (above) | prototypes, demos, a single-file artifact | point the two tags at `meridian.efolusi.com` |
| **Vendor the folder** | you want to own and edit the source | copy the repo; link `styles.css` and `_ds_bundle.js` |
| **Vendor one component** | you need Button, not 104 | copy `components/<group>/<Name>.jsx` + `.d.ts` — MIT, no attribution required |

> **Note:** there is no npm package yet — packaging is the next milestone (see [ROADMAP.md](ROADMAP.md)). The CDN and vendoring paths above are the supported ones today.

## Design language

Palette, type, spacing, motion, and the voice rules live in **[guidelines/brand.md](guidelines/brand.md)**. Accessibility, forms, and governance are in [`guidelines/`](guidelines/).

## What it covers

Meridian is general-purpose: the primitives and the patterns for an entire product surface, not just a component grab-bag. The example apps in `showcases/` put them to work across the archetypes most teams reach for:

- **AI workspace** — chat threads, tool calls, run steps, an inline terminal → ChatMessage, PromptComposer, AgentRun, Terminal.
- **Infrastructure console** — clouds, databases, SSL, DNS, health at a glance → StatusDot, KeyValueList, CopyField, Table, Terminal.
- **File tools** — upload, convert, encode/decode, scan → FileDrop, FileTile, Progress.
- **Trading & finance** — portfolios, positions, P&L, live signals → Sparkline, Stat, Table, PaymentCard.
- **Admin & marketing** — dashboards, settings, pricing, docs → the full display, navigation, and data tiers.

Every component and screen here is original. The system was authored from a single brand mark (`assets/logo.png`, an owl in cocoa/caramel/cream) and a short brief: warm sand neutrals with a palette sampled entirely from the mark, humanist sans type, subtle 4px radii, comfortable density, light and dark themes, Lucide icons, springy motion. No prior codebase or product UI was recreated.

## Blocks

Pre-composed sections in `blocks/` (Blocks group in the Design System tab): App shell, Login, Stats dashboard, Settings, Hero, Pricing, FAQ, 404 page, Activity feed. Copy a block's markup as the starting point for a page — they compose the primitives, so they inherit theme + density automatically.

## Theming & density

- **Dark theme:** set `data-theme="dark"` on `<html>` or any subtree. Only semantic aliases remap (espresso surfaces, cream text, caramel links, retuned status tints); ramps stay fixed. Components are theme-safe because they style against semantic tokens only.
- **Compact density:** set `data-density="compact"` for data-heavy ops views — control heights drop to 24/30/38px and table rows tighten via `--table-pad-y/x`.
- Both are attribute scopes, so a dark page can host a light card and vice versa. Specimen: Theming group in the Design System tab.

## Patterns

- `guidelines/brand.md` — palette derivation, type and spacing scales, motion, iconography, voice and copy rules
- `guidelines/forms.md` — validation timing (blur → change → submit), error copy, submit states, async checks
- `guidelines/accessibility.md` — focus rules, full keyboard map, contrast targets, per-component semantics
- `guidelines/governance.md` — semver rules, contribution contract, do/don't, deprecation policy

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
- `assets/` — logo.png, fonts/ (5 variable TTFs + OFL license texts), icons/ (108 Lucide SVGs + license)
- `_ds_bundle.js` + `_ds_manifest.json` — compiled component bundle and machine-readable manifest (generated by the DS compiler; see `ARCHITECTURE.md`)
- `components/<group>/` — the 104 components; each ships `.jsx` + `.d.ts` + `.prompt.md` + a group card HTML
- `blocks/` — 9 pre-composed sections to paste into a page
- `showcases/<app>/` — 8 example apps in plain JSX: agent, auth, console, docs, infra, tools, trader, website
- `starters/<journey>/` — 5 journeys to copy wholesale, one per category, linked pages sharing a consistent shell: marketing (home → pricing → contact), auth (sign in → sign up → onboarding, + password reset), dashboard (overview → customers → detail → settings), app (overview → projects → detail → new project → settings), docs (quickstart → authentication → errors)
- `site/` — the docs website (home, docs, components, blocks, charts, themes, colors), plus `examples/` (the live demos), `registry.json`, and generated `registry/` install items
- `guidelines/` — foundation specimen cards + brand (design language), accessibility, forms, governance
- `hello.html` — a complete runnable page; open it in a browser to see the system working with nothing installed
- `skills/` — the agent skill entry point
- `scripts/` — registry generator, contrast check, runtime-copy drift check
- `tokens.json` (DTCG) + `tailwind.preset.js` — design tokens for Style Dictionary, Figma Variables, and Tailwind (generated by `scripts/build_tokens.py`)
- `ARCHITECTURE.md` — how the pieces fit · `STYLEGUIDE.md` — contributor conventions
- `LICENSE` — MIT · `THIRD_PARTY_NOTICES.md` · `CONTRIBUTING.md` — component contract + PR checklist

**Showcases vs starters:** showcases (`showcases/`) are one rich screen per example app, written in plain JSX so you can lift code straight into a React app; starters (`starters/`) are self-contained multi-page journeys you copy wholesale to start a surface. Four pairs intentionally cover the same category in both forms (console/dashboard, auth, website/marketing, docs).

## Caveats

- No original font binaries were provided; Bricolage Grotesque, Figtree, and JetBrains Mono (all OFL, from google/fonts) are the chosen substitutes. Replace the files in `assets/fonts/` to swap.
- The logo is PNG only; an SVG master would improve crispness at large sizes.
- All showcase screens are original demonstrations of the system, since no existing product UI was available to recreate.

## License

MIT — free for commercial and personal use, modification, and redistribution. See `LICENSE`. Bundled fonts (SIL OFL 1.1) and Lucide-derived icons (ISC/MIT) keep their own licenses: `THIRD_PARTY_NOTICES.md`. The Efolusi owl mark and the "Meridian"/"Efolusi" names are not covered by the MIT grant — don't use them to brand derived systems. Contributions welcome: `CONTRIBUTING.md`.
