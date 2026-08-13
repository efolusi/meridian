# Changelog

## Unreleased

## 1.21.1 — 2026-08-13

- Render `DialogTitle` as a semantic level-two heading while preserving its styling and accessible-name wiring.

## 1.21.0 — 2026-08-13

- **Deprecated Toast was removed completely.** Meridian now ships one notification system: canonical `Toaster` plus the imperative `toast` API. The old `Toast`, `ToastStack`, duplicate registry item, adapter documentation, and direct-render demos were deleted, and the implementation now lives under `Sonner`.

- **InputGroup and Toggle families are composition-only.** InputGroup's label/prefix/suffix/hint renderer was removed in favor of explicit `Field` and `InputGroup*` parts. Toggle's icon-name helper, `md` size alias, and implicit participation as a direct `ToggleGroup` child were removed; grouped controls now use `ToggleGroupItem` exclusively.

- **Empty and Breadcrumb are composition-only.** The `EmptyState` prop renderer and array-based `Breadcrumbs` export were removed; maintained blocks, cards, showcases, starters, prompts, patterns, tests, manifests, and Guard rules now use the canonical part families directly.
- **Alert is composition-only and includes the current action part.** `AlertAction` now ships beside `AlertTitle` and `AlertDescription`; the parallel `tone`, `icon`, `title`, `description`, and `action` shorthand renderer was removed, and maintained consumers now compose explicit children with canonical variants or custom status classes.
- **Tooltip is composition-only.** The parallel `label`, root `side`, and `delay` shorthand renderer was removed; maintained consumers now compose `TooltipTrigger` and `TooltipContent`, while canonical root/provider delay and hoverability options remain available.
- **Badge uses the canonical variant and composition contract.** The `tone`, `size`, and generated `dot` helpers were removed; maintained consumers now use official variants, custom color classes, and explicit `data-icon` children for status indicators.
- **Pagination is composition-only and current.** The generated `page`, `pageCount`, and `onChange` renderer was removed; maintained consumers now compose semantic links explicitly, and previous/next links support the current localizable `text` prop.
- **Slider uses the array-only root contract.** Scalar values, DOM-style `onChange`, and the built-in label/value renderer were removed; maintained consumers compose their labels, use canonical array callbacks, and refs now target the Slider root rather than its first thumb.
- **Skeleton is a single native div primitive.** The shape, width, height, and multi-line renderer aliases were removed; maintained consumers now express dimensions through native styles and repeated placeholders through explicit composition.
- **Spinner uses its native SVG contract.** The numeric `size` and `label` aliases were removed; dimensions now use `width`/`height`, accessible naming uses `aria-label`, and maintained demos and tests follow the same contract.
- **Avatar is composition-only.** Maintained consumers now render `AvatarImage`, `AvatarFallback`, and `AvatarBadge` explicitly, use named sizes, and compose groups with `AvatarGroupCount`; the parallel `name`, `src`, and numeric-size renderer has been removed from runtime and types.
- **Card is composition-only.** The parallel `title`, `subtitle`, `actions`, `footer`, and `padding` shorthand renderer has been removed. Maintained blocks, demos, showcases, docs, prompts, and tests now use the explicit Card part family and its shared spacing contract.
- **Hover never introduces an underline.** Base links, `Link`, link-style `Button` and `Badge`, and toast actions now keep text decoration stable while changing color on hover. A repository gate scans authored CSS/JSX/HTML so the behavior cannot regress in a new component or template.
- **Composition-only disclosure and overlay roots.** `Accordion`, `Collapsible`, `Dialog`, and `Popover` no longer maintain parallel prop-shorthand renderers. Every maintained block, showcase, demo, prompt, and test now uses their explicit item/trigger/content parts; `ConfirmDialog` follows the canonical `onOpenChange` state contract.
- **Canonical component contracts no longer carry the first alias wave.** Maintained consumers now use `status`, `defaultStatus`, `onStatusChange`, `onSelect`, `onChange`, `onValueChange`, `side`, `format`, `defaultOpen`, and explicit action nodes. The superseded prop and placement aliases were removed from runtime source, types, demos, prompts, generated registry items, and Guard's stable contract.
- **The current compatibility inventory is fully evidenced.** Chart now ships the Recharts 3 composition contract (`ChartContainer`, tooltip, legend, scoped theme variables, and `useChart`). Data Table and Typography are explicitly verified as upstream-style authored guides without fabricated runtime exports, and Sonner is the sole notification family.
- **Registry and package installs carry Chart's engine dependency.** The `chart` registry item declares Recharts 3, and the ESM package publishes it as a runtime dependency; the browser bundle resolves the optional Recharts UMD namespace only when chart composition is rendered.

All notable changes to Meridian are documented here. Format follows [Keep a Changelog](https://keepachangelog.com); versioning follows the policy in `guidelines/governance.md`.

> **On the versions below 1.4.0:** Meridian was built in the open but released to nobody. Versions 1.0.0 through 1.3.0 are development milestones recorded as they happened; they were never tagged, published, or installable, so there is no artefact to go back to. They are kept because they are an accurate record of how the system was built, not because you can depend on them. The first tagged, publicly consumable release is 1.4.0.

## 1.20.0 — 2026-08-12

### Added
- **Stable compositional migration surface.** Modern application primitives now include the complete Sidebar composition, conversation Message and Message Scroller families, and the current imperative Sonner contract alongside the existing accessible component catalog.
- **Meridian Guard.** The workspace package validates public exports, tokens, icons, deprecated usage, and authored consumer code against the generated Meridian rule pack.

### Changed
- **Notifications now use `Toaster` plus `toast`.** The provider-bound `Toaster.useToast()` queue was removed from current source and every bundled showcase migrated to the stable imperative lifecycle, including typed status, promise, action, position, timer pause, and dismiss behavior.
- **Compatibility inventory follows the current upstream surface.** The removed Questionnaire entry was replaced by Sonner; deprecated Toast remains tracked separately for migration audits.

## 1.19.1 — 2026-08-03

### Changed
- **`linkedin` is now the tile, not the letters.** The 1.18.0 glyph drew only the "in" letterforms, which is not how anyone recognises the logo — the mark people know is the rounded square with the letters knocked out. Redrawn as the tile with even-odd cutouts; same name, same box, so nothing changes at call sites except looking right.

## 1.19.0 — 2026-08-03

### Added
- **`github-brand`.** 1.18.0 shipped `linkedin` and `x-brand` filled, which made the one social glyph already in the set — the Lucide outline `github` — the odd one out in any follow-us row: two solid marks and one wireframe. The filled GitHub mark joins under the same naming rule (`-brand` when a Lucide name is taken); the outline `github` stays for whoever prefers it.

## 1.18.0 — 2026-08-03

### Added
- **Brand marks: `linkedin` and `x-brand`.** The set is Lucide-derived, and Lucide dropped its brand logos — so any product that wanted a "follow us" row had to inline its own SVGs, which efolusi.com promptly did (a smell: the design system existing so products don't hand-roll visuals). Two filled 24×24 marks join the set: `linkedin`, and `x-brand` for the X platform logo — named that way because `x` is already the close mark, and a close button that renders a social logo is the kind of bug you only catch in production. They are trademarks reproduced for linking to official profiles, noted as such in THIRD_PARTY_NOTICES.md, and they follow `currentColor` like every other glyph.

## 1.17.0 — 2026-07-31

### Added
- **`closeLabel` on `Dialog` and `Drawer`.** The ✕ carried an accessible name written in English in the source, so an app that had translated every other string still shipped a dialog whose only unlabelled-by-sight control announced itself as "Close" — and that is the one control a screen-reader user needs to get out of a modal. Both components now take `closeLabel`, defaulting to `Close`, alongside the `revealLabel`/`hideLabel` added in 1.16.0. A dialog with no `onClose` still has no ✕ at all: passing a label does not conjure one.

## 1.16.0 — 2026-07-31

### Added
- **`revealable` on `Input`.** A password field nobody can read back is a password field people mistype, and every product was about to hand-roll the same eye button — the Efolusi accounts sign-in did. Set `revealable` on a `type="password"` field and it gains a show/hide toggle: a real button, so it is reachable by keyboard, carrying `aria-pressed` and a label that says what pressing it will do (`revealLabel` / `hideLabel` for other languages). It is ignored on fields that are not passwords.

## 1.15.0 — 2026-07-30

### Fixed
- **Anchored panels aligned to the right opened against the wrong edge.** A `Menu` with `align="right"` near the right of the viewport dropped its panel at the far LEFT instead of under its trigger — reported from the Efolusi accounts console, where every row's action menu did it. Two halves caused it: the panel class pinned `right: 0` while `useAnchoredStyle`'s first-frame inline style pinned `left: 0`, so the panel was laid out with both edges pinned, stretched to the full viewport width, and was then measured at that width — after which the edge clamp had nowhere to put it and fell back to the left edge. The placement now pins `right`/`bottom` to `auto` from the first frame, and the panel classes for `Menu`, `Popover` and `HoverCard` no longer pin an edge the placement already sets. `HoverCard` had the same shape vertically (`top`/`bottom`).

## 1.14.0 — 2026-07-30

### Fixed
- **Link hover no longer turns the link near-black.** `.ef-link:hover` used `--accent-hover`, which is `#1D0E04` in the light theme — a warm brown link jumping to near-black on hover reads as broken rather than emphasised. Hover now deepens the link's own hue through a new `--text-link-hover` token (`--brand-900` light, `--brand-300` dark). The hover underline stays: colour alone is not a safe affordance (WCAG 1.4.1).

### Added
- **`--text-link-hover`.** The link ramp had a resting colour but no hover companion, which is why consumers inherited the accent ramp by default.

## 1.13.0 — 2026-07-30

### Added
- **`sun` and `moon`.** The system documents a dark theme via `data-theme` but shipped no icon for switching between them, so consumers hand-inlined Lucide glyphs to build a theme toggle — the Efolusi site did exactly that. Both now come from the set.

## 1.12.0 — 2026-07-30

### Added
- **Four icons the account and security surfaces needed.** `shield`, `laptop`, `monitor` and `log-in` join the Lucide-derived set. The gap showed up building a sign-in and account console: there was no icon for a security section, a desktop session, or a sign-in affordance — the set shipped `log-out` without `log-in`, and `shield-check` without the plain `shield`.

### Changed
- **`Divider` carries default vertical spacing** (one step on the space scale) instead of `margin: 0`. A separator flush against its neighbours is never what a caller wants, and the papercut was visible in this repo: the tools and console showcases each patched it inline with a different magic number (`20px` and `10px`). An explicit `style` or `className` still overrides, and those two showcase patches are gone.

## 1.11.1 — 2026-07-30

### Fixed
- **`::selection` sets an explicit text color.** The selection rules set only a background (`--brand-100` light, `#453728` dark), so selected text kept its own color — light text on a dark section in the light theme disappeared into the cream highlight when selected. Each selection background now pairs with a matching ink (`--cocoa-900` light, `#F3EFE7` dark).

## 1.11.0 — 2026-07-29

Locale-aware inputs and one more prop aligned to the house convention. Every
change is additive: without a `locale` the components format exactly as before.

### Added
- **`locale` on the numeric and date inputs.** NumberInput, Calendar, DatePicker and DateRangePicker take a BCP 47 `locale` and format (and parse) through `Intl` — `id` shows `1.234,5` and "Januari", "Sen", "15 Jan 2026"; `en` shows `1,234.5` and the English names. NumberInput parses the locale's own separators back to a number, so a displayed value round-trips exactly; an explicit `format`/`parse` still wins. The calendar grid stays Monday-first for every locale (week-start localisation depends on non-portable `Intl.Locale` weekInfo).

### Changed
- **`defaultOpen` is canonical on EnvList**, matching the `defaultOpen` used across the other disclosure-style components. The old `defaultVisible` keeps working as a `@deprecated` alias (canonical wins), pinned by a test — no break.

## 1.10.0 — 2026-07-29

A monorepo of three lockstep packages, one prop vocabulary aligned to the common
standard, and a size-regression budget in CI. Every change is additive: old prop
names keep working for one more major, marked `@deprecated`.

### Added
- **Two standalone sub-packages, carved from the same sources.** `@efolusi/meridian-tokens` (design tokens, CSS, fonts, Tailwind preset) and `@efolusi/meridian-icons` (the Lucide-derived SVGs plus a name-to-svg index) publish at the same version as the umbrella. The flat component sources and the CDN bundle do not move; the umbrella `@efolusi/meridian` still ships everything. The release pipeline publishes all three idempotently on one version bump.
- **Size-regression budget gate.** `scripts/check_size.mjs` ratchets `_ds_bundle.js`, `dist/components.css`, and the npm package total against `scripts/size_budget.json`; a silent size creep now fails CI instead of shipping.
- **Interaction coverage** for Slider, RichComposer, PromptSteps, and Player (keyboard seek included).
- **`guidelines/patterns.md`** (product-state playbook) and **`guidelines/frameworks.md`** (Next.js / Vite / Remix / CDN integration), linked from the README.

### Changed
- **Prop vocabulary aligned to the common standard, non-breaking.** `status` is now the canonical prop for state-like values (StatusDot, Sandbox, GeneratedImage, Confirmation); `state` stays as a `@deprecated` alias. `action` is canonically a `ReactNode` across Alert, Banner, and Toast; the old `onAction` / `actionLabel` remain as `@deprecated` aliases. Canonical wins when both are passed. No prop was removed; 18 alias tests pin the old call sites still working.

## 1.9.2 — 2026-07-23

### Fixed
- **Icon's missing-glyph warning now reaches npm consumers too.** 1.9.1 added the warning to `components/icons/Icon.jsx`, which is the CDN bundle's implementation; the npm build replaces that file with an inlined-SVG version generated by `scripts/build_npm.mjs`, so installs kept failing in silence. The generated component warns as well, once per name so a bad icon inside a list does not flood the console.
- **The warning no longer fires on valid icons.** In the bundle, 1.9.1 warned on any failed fetch, so a jsdom test run — where a relative icon URL cannot resolve at all — logged a missing-glyph warning for every icon on the page. Only a served 404 means the name is wrong; transport failures are the environment and stay quiet.

## 1.9.1 — 2026-07-23

Three fixes for bugs that read as mistakes at the call site rather than as component faults, which is what made them expensive to track down.

### Fixed
- **CopyField widened its container instead of truncating.** The value is a flex child with `overflow:hidden` and an ellipsis, but flex children default to `min-width:auto`, so a long value — a contract address, an API key — pushed the row past its parent and broke the page layout on narrow screens. The value and the box now pin `min-width:0`, and the box caps at `max-width:100%`.
- **CopyField dropped its extra props when used without a label.** The unlabelled branch rebuilt the box through `cloneElement` and never passed `...rest`, so `id`, `data-*` and `aria-*` set at the call site silently vanished. Its copied-state timeout also outlived unmount.
- **Icon failed silently on an unknown name.** A missing glyph rendered an empty span with nothing in the console, which reads as a CSS bug and sends you looking in the wrong place. It now warns with the name and how to fix it. The failure is also cached, so a name that 404s is no longer refetched by every later mount.

## 1.9.0 — 2026-07-22

Editable demos, one prop vocabulary (with one-major deprecated aliases, per governance), zero raw colour literals, and visual regression in CI.

### Added
- **Every demo is now a playground.** Components and Charts pages gain an Edit tab beside Preview/Code: edit the source, Run recompiles it through the exact pipeline the pristine demos use, errors land in the same boundary and clear on the next Run, Reset restores the original. Edits survive navigating within the session; nothing persists beyond it.
- **Visual regression in CI.** The smoke run captures one screenshot per example group per theme (26 shots); `scripts/check_visual.mjs` compares them against `tests/__shots__` baselines with pixelmatch on every push and PR. Baselines are born in CI — the `update-visual-baselines` workflow opens a PR whose image diff is the approval step — because font rasterisation differs across platforms.
- `--success-contrast` and `--warning-contrast` tokens, completing the family `--danger-contrast` started.

### Changed
- **One vocabulary for the drifted props, nothing broken.** State-carrying selection fires `onChange` (TreeList; `onSelect` aliased), command menus fire `onSelect` (Suggestions; `onPick` aliased), placement is `side` with top/bottom/left/right (Tooltip; `position` aliased — and Tooltip newly implements left/right with flip-and-clamp), charts format with `format` (BarChart; `formatValue` aliased), ModelSelector's side takes top/bottom (up/down mapped), WebPreview's `url` is controlled-capable and `defaultOpen` replaces `defaultConsoleOpen`. Every alias keeps working for one major and is marked `@deprecated` in its types.
- **Zero raw colour literals** — the token-adherence baseline hit 0, from 48. Theme-fixed surfaces (code ink ladder, ANSI-ish status colours, media scrims and checkerboard) got honestly named fixed tokens; exact-value duplicates became the token they duplicated; stale var() fallbacks that had drifted from their token's real value were removed.

### Fixed
- **FileTypeIcon's extension chip was white-on-everything.** No single label colour passes on all eight chip fills in both themes (white fails brand-500/sand-500 in light; dark ink fails the fixed dark fills in dark), so every fill now pairs with a label that measures ≥4.5:1 in both — flip tokens on status fills, fixed white or ink elsewhere. All nine pairs verified numerically.

### Decided (recorded in ROADMAP.md)
- Single npm package, no monorepo split; FUNDING.yml omitted until sponsor accounts exist; docs hosting and npm scope marked resolved.

## 1.8.0 — 2026-07-22

Three new components, range selection for Calendar, form-level state, a bring-your-own-brand theming guide, and a single-file AI corpus. 109 components, 115 public exports.

### Added
- **NumberInput** — a spinbutton done the native-adjacent way: text input with `inputmode="decimal"` plus steppers. Arrows step, Shift×10, Home/End to the rails, blur commits (parse → clamp → snap to the step grid, floating point handled), empty commits `null`. Controlled and uncontrolled.
- **TimePicker** — combobox-with-listbox of time slots (`stepMinutes`, `minTime`/`maxTime`, 12/24h display over a fixed `'HH:MM'` value), full `aria-activedescendant` wiring, typed off-grid times commit on blur.
- **Calendar range mode + DateRangePicker** — `range` puts `{from,to}` selection on the existing grid (keyboard contract untouched, both ends `aria-selected`, tinted band between); DateRangePicker composes it behind an input with the DatePicker focus contract, min/max windowing and a labelled clear button.
- **`FormField.useFormState`** — zero-dependency form state published the `Toaster.useToast` way: `values`/`errors`/`touched`, per-field wiring via `field(name)`, and `handleSubmit` that validates everything and only calls through when clean. Error timing follows `guidelines/forms.md`: nothing surfaces until blur or submit.
- **`guidelines/theming.md`** — the bring-your-own-brand guide: the three token layers, the minimum semantic override set, dark-mode invariants, font swaps, and the contrast duties that come with new colours. Every token name in it is grep-verified against `tokens/*.css`.
- **`llms-full.txt`** — a generated single-file corpus (per-component prompt guides + typed interfaces + token names), wired into the generator gates so it can never silently drift from the sources it aggregates.

### Changed
- The docs' AI-consumption claim scales with the library: a model that has seen three Meridian components can now write the other 106.

## 1.7.0 — 2026-07-22

The keyboard contracts the docs called "verified in-browser" are now verified by tests — which promptly found three components breaking them — plus live-region announcements, reduced-motion coverage for JS-driven animation, and a server-render sweep of all 112 exports.

### Added
- **39 keyboard-contract tests** across Drawer, ConfirmDialog, Popover, CommandPalette, DatePicker, Tooltip, HoverCard, ContextMenu and Menubar — every contract `guidelines/accessibility.md` documents now has a test enforcing it (194 tests total, from 30).
- **An SSR sweep** renders all 112 public exports with `renderToString` in a real node environment and fails on any inline-style float a CSS parser would truncate — the hydration-mismatch class, guarded for the whole surface instead of four hand-picked components. It caught AspectRatio serialising 16 decimals on its very first run.
- Dynamic content announces itself: FormField errors are `role="alert"`, Terminal and Console bodies are `role="log"` live regions, and Progress is finally named by its visible label.
- `tokens.json` (DTCG) and `tailwind.preset.cjs` now ship in the npm package with explicit `exports` entries — the README advertised both for a package that contained neither.

### Fixed
- **Calendar `PageUp`/`PageDown` dropped keyboard focus to `<body>`** — the month re-render unmounted the focused day and the refocus effect refused to reclaim focus. They now move focus a month (same day, clamped to month length) and the effect reclaims focus from `<body>`.
- **HoverCard ignored Escape when focus was outside it** — the only handler was on the trigger span. A document-level listener now dismisses an open card from anywhere.
- **Menubar Escape closed the menu but stranded focus** — it now returns focus to the top-level button, as the contract states.
- **Player's seek slider was announced but inoperable** — `role="slider"` with no tabIndex and no key handling. It is now focusable with Arrow ±5s, Home/End, a human-readable `aria-valuetext`, and a focus ring.
- **A clickable Tag was mouse-only** — a span with onClick. It renders as a real button now (or an inner label-button when `onRemove` needs to coexist, since interactive content must not nest).
- Avatar falls back to initials when its image URL dies, instead of a broken image forever.
- JS-driven motion now honours `prefers-reduced-motion`: UsageMeter's count-up snaps, and the smooth scrolls in Conversation, Transcript, Console and Carousel jump instantly. The CSS kill-switch never could reach `scrollTo({behavior:'smooth'})`.
- The `useLayoutEffect` SSR warning is gone from all 13 components that fired it (one isomorphic helper, downgrade-to-`useEffect` on the server — behaviour-identical, positioning work only means anything with a DOM).
- `publish.yml` runs `npm run check` instead of its own hand-maintained gate list, which had already drifted from CI's.

## 1.6.0 — 2026-07-22

The npm package grows a static CSS story, and an audit of eight dimensions fixed the accessibility and forwarding bugs it confirmed.

### Added
- **`components.css`** — all 102 component CSS literals extracted into one static stylesheet that the package's `styles.css` imports. Server-rendered HTML is styled before hydration; previously every SSR consumer saw unstyled markup until JS ran. The compiled modules no longer inject CSS at runtime (extraction fails the build if a literal ever gains an interpolation, so the static file cannot silently diverge), which drops the shipped JS from 405 kB to 272 kB. The CDN bundle keeps runtime injection; `injectEfCss` stays exported for compatibility. Consumers who imported `styles.css` see no change in setup and gain styled SSR; anyone relying on injection without importing the stylesheet must add the documented import.
- `StatusDot` carries its state as text: visually hidden ahead of the label ("Error: API"), or as the dot's accessible name when there is no label; `stateLabel` overrides the wording. Screen readers previously got nothing from an unlabelled dot, contradicting the shipped guideline that status is never colour-only.
- `RELEASING.md`, and the publish workflow now refuses a non-dry manual publish whose version tag does not exist at HEAD.

### Fixed
- **Dialog, ConfirmDialog, Drawer and CommandPalette silently dropped a caller's `className` and `style`** — the only 4 of 106 components that wrote a literal `className=` after the rest spread, clobbering whatever the caller passed.
- **Combobox now implements the combobox pattern it declared**: `aria-controls`, `aria-autocomplete`, `aria-activedescendant` on the highlighted option, real option ids, and the highlight scrolls into view — the wiring CommandPalette already had.
- **Touch targets meet WCAG 2.5.8 (24×24)**: Carousel and PageControl dots are 24px hit areas (the 7px dot is drawn inside, so dot spacing grows), Tag's remove button grows from 16px, Slider's input from 16px tall.
- The headless smoke run now fails on any console error; the array was collected from day one and then ignored.
- The site's JSON-LD `softwareVersion` had lagged at 1.5.1 through the 1.5.2 release; version locations are now listed in RELEASING.md.

### Changed
- **Fonts ship as WOFF2 instead of TTF** — a lossless repack (same glyphs, same variation axes, verified with fonttools): 912 kB → 409 kB, shrinking both the npm package (620 → 520 kB) and every CDN page load.
- The docs site, `llms.txt`, `SKILL.md` and CONTRIBUTING now document the npm install path; CONTRIBUTING's check list is `npm run check`.
- `main` is protected by a ruleset: PRs plus green `gates` and `smoke` checks required, repository admins bypass.

## 1.5.2 — 2026-07-20

### Fixed
- **Server rendering any component with a proportional inline style mismatched on hydration.** Percentages were built as `value + '%'`, which writes every digit JavaScript has: `1/3 * 100` becomes `33.33333333333333%`. Browsers keep about six significant figures when parsing an inline style, so the DOM reads back `33.3333%`, React compares its own string against the browser's truncated one, and reports a mismatch. React does not patch these up, so the affected elements keep the server's values and any client-side recalculation is silently dropped.

  `Player` hit it on every one of its 72 waveform bars, `UsageMeter` on any ratio that does not divide evenly, `BarChart` on essentially all real data, `Resizable` on a non-half split, and `LineChart` on its hover tooltip. Reported from a downstream Next.js App Router build.

  Percentages now go through a shared internal `cssPct` helper that rounds to three decimals, comfortably inside what every parser preserves and far below one pixel at any realistic size. Rounding alone is not sufficient: a fixed-decimal format would emit `33.300%`, which browsers normalise to `33.3%` and which mismatches for the same reason, so the helper relies on number-to-string dropping trailing zeros.

  Regression coverage renders the five components with `renderToString` and asserts no serialised style carries more decimals than the parser keeps. Note for future work: jsdom preserves full float precision where browsers truncate, so a round-trip assertion through jsdom passes even with the fix reverted. The test asserts the precision bound directly for that reason.

## 1.5.1 — 2026-07-20

### Fixed
- **Every icon in the npm package was blank.** 68 of the 106 components render an `Icon`, and the tarball shipped none of the 108 SVGs. Even had it shipped them, `Icon` derives its base URL from the `<script src="..._ds_bundle.js">` tag, which exists only on the zero-build site: in an npm consumer that lookup returns `''` and the request goes out page-relative. Copying the files in would not have fixed the URL, so the npm build now inlines the SVG sources (~38 kB raw, ~5 kB gzipped) and drops the fetch entirely. Icons render in server output instead of one effect late, with no request per icon per route.
- **`styles.css` used bare `@import "tokens/…"` specifiers.** A browser reads those as relative URLs, which is why the CDN path never noticed, but a bundler CSS pipeline can read a non-relative specifier as a module request into `node_modules`. Reported from a real downstream build. Now `./tokens/…`, which is correct everywhere.
- **No `"use client"` directive**, so importing the package from a Next.js App Router Server Component was a build error. Every component calls hooks; the directive is now emitted on each module and is inert outside RSC.
- **`LICENSE` and `THIRD_PARTY_NOTICES.md` did not ship.** A `"license": "MIT"` field is metadata, not the grant; MIT requires the text to travel with the code. The Lucide licence ships with the inlined icons for the same reason.
- `sideEffects` was `*.css`, a glob that does not cross a directory boundary and so missed `tokens/*.css`. Now `**/*.css`.
- `assets/*` was unreachable through `exports`: the `./*` pattern rewrote every non-JS subpath to a `.js` that does not exist.
- **Deep imports were broken in the published 1.5.0.** The `exports` map used a single `./*` pattern, which appends the extension, so `@efolusi/meridian/forms/Button.js` resolved to `forms/Button.js.js` and threw for every consumer — and that is the exact spelling the package README documents. `@efolusi/meridian/package.json` failed the same way, which breaks tools that read it. Both spellings now resolve, with or without `.js`.
- `check_npm_package.mjs` imported `dist/` by file path, which bypasses `exports` entirely; that is why the broken map shipped green. It now symlinks the build into a temp `node_modules` and resolves every specifier by package name, the way Node does after an install.

## 1.5.0 — 2026-07-20

The runtime layer the 1.4.0 release was missing: a toast owner, field wiring, a portal for every floating surface, a real test suite, and an npm package whose types and assets actually work for consumers.

### Added
- **Toaster + `Toaster.useToast()`** — one owner for the toast queue: ids, timers, the live region and the portal. A toast carrying an action never auto-dismisses (WCAG 2.2.1), timers pause on hover and focus, and the stack holds a single live region instead of one per toast.
- **FormField + the field wiring** — label / hint / error / required chrome and the id that links them. All eleven form controls inherit `id`, `aria-describedby`, `aria-invalid` and `aria-required` from an enclosing field; `group` mode uses `role="group"` for control sets; a render prop wires non-Meridian controls.
- **Table** gains sorting (applied by the table, with `sortAccessor`), selection with an indeterminate select-all, sticky header, and empty/loading states.
- **Portal + `useAnchoredStyle`**, and all eight floating surfaces routed through them: they flip when there is no room, shift to stay on screen, and can no longer be clipped by a scrolling ancestor.
- **A test suite** — 22 vitest + testing-library tests over the keyboard and wiring contracts that were previously only claimed in prose. Run with `npm test`.
- **An ESM npm build** (`npm run build:npm` → `@efolusi/meridian` in `dist/`), verified in CI by importing it. Not published to the registry yet.
- **The compiler**, vendored in as `scripts/build_bundle.mjs`; it reproduces the historical bundle byte for byte, and CI now rebuilds and diffs rather than trusting a recorded hash.
- Browser-support and RTL statements in `guidelines/accessibility.md` — including the honest note that RTL is *not* supported in 1.x.
- **A types gate** (`npm run check:types`, `scripts/check_types.mjs`). The `.d.ts` layer is hand-maintained, so nothing forced it to stay valid; it now compiles in CI, along with the emitted package's type barrel imported the way a consumer would.

### Changed
- Every component forwards unknown props to its root (104 of 106), and the nine you most often need a handle on forward refs.
- The six hand-rolled toast queues in the showcases are gone; tones are chosen per call instead of everything being green.

### Fixed
- The manifest's `components` and `tokens` inventories are generated rather than hand-maintained. They had drifted, which silently produced no registry item for Portal and dropped it from the dependency list of all eight overlays that import it.
- `Portal` imported `react-dom` explicitly instead of relying on a window global, which only worked inside the bundle.
- **The published types now compile for consumers.** `JSX.Element` was written against the global `JSX` namespace that `@types/react` 19 removed, so every declaration broke for anyone on React 19 — which `peerDependencies: react >=18` invites. All 102 uses are now `React.JSX.Element`, valid on both majors. Six interfaces also contradicted the DOM attributes they extended (`Card.title` as a node vs `string`; `size` as a scale vs `number` on Input, InputGroup, Select and Switch; `InputGroup.prefix` as a node), and the package's type barrel re-exported `.d.ts` paths, which TypeScript rejects outright (TS2846).
- **The npm package shipped CSS that pointed at fonts it did not contain.** `tokens/fonts.css` `@font-face`s five families from `../assets/fonts/`, but the build only copied components and token CSS. An unresolvable `url()` is a hard build failure in Vite and webpack, so the package would have broken every bundler consumer on first import. The fonts now ship (with their OFL texts, as the licence requires), and `check_npm_package.mjs` fails on any CSS asset missing from the tarball.
- **Repo-wide factual drift.** An audit of every surface against measured counts fixed 83 confirmed items: component inventories that listed 104 of 106 (README omitted `FormField` and `Portal` from their groups), a stale icon count of 65 against the 108 that ship, `unexposedExports` documented as three helpers when the bundle carries seven, `kits`/`templates` named in the license scope years after they became `showcases`/`starters`, ROADMAP entries still listing shipped work as missing, docs-site meta and JSON-LD counts, `.prompt.md` examples referencing an icon that does not exist, and the last of the internal-product naming. Released changelog entries were deliberately left alone: they record what was true at the time.

## 1.4.0 — 2026-07-19 — first public release

The first tagged, installable version. Meridian is repositioned as a general-purpose design system, the accessibility claims it was making are now true, and the documented install path actually runs.

### Fixed
- **Focus indicator now meets WCAG 1.4.11.** The ring was translucent and measured 2.02–2.11:1 (light) and 2.61–2.77:1 (dark) against every surface, failing the 3:1 non-text minimum on every focusable element. It is now opaque and two-layer — a surface-coloured offset plus `--focus-ring-color` — measuring 6.20–7.41:1 in both themes, and it holds over green and red control fills, which no single-ring colour could. Token-only fix; all 58 consuming components inherit it.
- **Eight pairs that were invisible in dark mode** (1.02–1.09:1), each caused by a semantic token that inverts being set against a fixed ramp value: ChatMessage bot avatar, Steps done and active markers, Calendar selected day, PromptComposer and FileDrop focus borders, Sparkline neutral trend, Toast icon hover. All now 14.7–17:1 in both themes.
- **Controls that did nothing no longer render.** PromptComposer shipped a paperclip and a mic button, and ChatMessage shipped copy and retry on every assistant message, all with no handler and no prop to attach one — visible, labelled and focusable, but inert. They now render only when given `onAttach` / `onVoice` / `onCopy` / `onRetry`.
- **The install snippets now work.** The per-component snippet on all 104 component pages omitted React, so pasting it rendered nothing; the hosted snippet still said `YOUR-DEPLOYMENT`. Both now load react, react-dom and the bundle from `meridian.efolusi.com`.
- **Registry items declare their dependencies.** All 113 items previously declared none, so a CLI install wrote an orphan file with unresolvable imports and no tokens. Items now carry `dependencies: ["react"]` and real `registryDependencies` (297 edges), rooted at a new `meridian-base` item that ships `styles.css` and the whole token layer.
- `starters/dashboard/Customers.dc.html` referenced the non-existent `filter` icon; now `funnel`.
- Removed the dead `--shadow-color` token (defined only in dark, referenced nowhere).
- Dark mode: code blocks and the terminal used `--surface-inverse`, which flips to a light surface in dark theme while their text stayed light — unreadable. Added fixed `--surface-code`/`--text-code`/`--border-code` tokens (dark in both themes) and repointed CodeBlock and Terminal.

### Added
- `--focus-ring-color`, `--focus-ring-offset`, `--focus-ring-danger` and `--danger-contrast` tokens (177 total). `--danger-contrast` fixes a white label on a solid danger fill that measured 3.45:1 in dark.
- `PromptComposer` gains `onAttach`, `onVoice`, `busy` and `onStop` (send becomes stop while streaming); `ChatMessage` gains `onCopy`, `onRetry`, and `actions` widens to `boolean | ReactNode`.
- [`hello.html`](hello.html) — a complete runnable page proving the documented install path with nothing installed.
- [`guidelines/brand.md`](guidelines/brand.md) — the design language (palette, type, spacing, motion, iconography, voice) moved out of the README so the README can be a landing page.
- Four new CI gates: `check_dead_controls.py` (no inert buttons), `sync_manifest_tokens.py --check` (manifest token inventory matches the CSS; it had drifted on four values), `check_bundle_hashes.py` (strict on push, advisory for fork PRs that cannot recompile), and non-text contrast pairs in `check_contrast.py`.
- Keyboard and focus contracts for the interactive components: Dialog/Drawer/ConfirmDialog focus trap and restore with panel labelling; keyboard-operable Menu and Popover triggers with arrow-key menu navigation; CommandPalette combobox semantics with focus restore; Calendar/DatePicker `role="grid"` with full keyboard navigation; Tabs roving tabindex; Tooltip `aria-describedby`; HoverCard role fix. See `guidelines/accessibility.md`.
- Machine-readable registry: `site/registry.json` plus per-component install files in `site/registry/` (open registry schema, generated by `scripts/build_registry.py`).
- CI (`.github/workflows/checks.yml`): contrast, runtime-copy drift, relative-path resolution, registry sync, and bundle hash gates on every push.
- Cloudflare Pages deployment config: `_headers`, `_redirects`, `404.html`, `robots.txt`.
- `github` icon (Lucide) added to `assets/icons/`; the docs-site header GitHub link is now a bordered icon button matching the theme toggle (108 icons total).
- `ARCHITECTURE.md` and `STYLEGUIDE.md`; CODEOWNERS and an RFC issue template.
- `THIRD_PARTY_NOTICES.md` plus the SIL OFL 1.1 license texts for Bricolage Grotesque, Figtree, and JetBrains Mono (`assets/fonts/OFL-*.txt`) and the Lucide ISC/MIT license (`assets/icons/LICENSE-Lucide.txt`) — required for compliant redistribution of the bundled fonts and icons.
- Global `prefers-reduced-motion` guard and an `a:focus-visible` ring in `tokens/base.css`.
- Dark-theme remap for `--success-600` (previously the only status foreground left at its light value in dark).

### Changed
- Repository reorganized into Meridian's own layout: `components/`, `blocks/`, `showcases/` (was `ui_kits/`), `starters/` (was `templates/`), `site/` (the docs website), with the system core (styles, tokens, assets, compiled bundle) unchanged at the root. See `ARCHITECTURE.md`.
- Contrast: `--text-muted` (#948A74 → #746A55 light, #8F8574 → #9C9280 dark), `--success-600` (#3E8E4E → #2F7A40 light, #5FB86E dark), `--danger-600` (#DC2626 → #C81E1E) now meet WCAG AA (≥4.5:1) on page, card, and their status tints in both themes.
- Docs corrected: icon count (65 → 107) and stroke width (assets are 2px; `Icon` renders 1.5px), deduplicated README data-component list, docs-site component counts (88/77 → 104).

## 1.3.0 — 2026-07-17 — AI-native component expansion

### Added
- 16 components closing the AI-chat/agent surface:
  - ai/: Task, Todo, DocumentCard, GeneratedImage, Sandbox, WebPreview, SourceCard, PromptSteps, SelectionQuote, RichComposer, Player, Transcript
  - code/: Console, Exception, EnvList
  - feedback/: Loader (pulse / shimmer / dots text treatment)
- Icons: at-sign, bug, corner-up-left, list-todo, skip-back, skip-forward, volume-2, volume-x.
- Specimen cards: "AI · Agent artifacts" and "AI · Input & media"; Code card now covers Console, Exception, EnvList.

### Changed
- Diff: accepts `from`/`to` strings (word-level change marks, context collapsing) and `files` for multi-file review; legacy `lines` prop unchanged.
- CodeBlock: `clip` prop clips tall code with a fade + Show all / Collapse.

## 1.2.0 — 2026-07-17
### Added
- AI-native components (inspired by the agentic-UI ecosystem): Reasoning, ToolCall, AgentRun, Confirmation, Conversation, Citation + SourceList, Suggestions, ModelSelector, UsageMeter, FeedbackBar (ai); Diff (code). Total: 88.
- Native behaviors ported from the ecosystem: tool approval gates (approve/reject), streaming key-value args, stick-to-bottom conversation viewport with jump-to-latest, citation hover previews with a source pager, animated count-up usage figures, collapsible run-step detail.
- 4 new icons: brain, wrench, thumbs-up, thumbs-down.

## 1.1.0 — 2026-07-17
### Added
- 12 components completing the primitive set: Toggle + ToggleGroup, ButtonGroup, InputGroup, Label (forms); Collapsible, AspectRatio, ScrollArea, Carousel, Resizable (display); Menubar (navigation); ContextMenu, HoverCard (overlay). Total: 77.
- Documentation site (`templates/ds-site/`): Home, Docs, Components, Blocks, Examples, Charts, Themes, Colors — with client-side page transitions.
- Per-component docs: live Preview/Code examples (90 demos), install + usage snippets, generated API tables, prev/next, deep links.
- Site search (⌘K) across pages, docs sections, and all 77 components.
- Theme customizer: accent × radius × mode × density with live preview and copyable CSS overrides.
- Blocks: Preview/Code tabs with responsive width toggle; 4 new blocks (App shell, Login, Stats dashboard, Settings). Total: 9.
- Examples page surfacing the 8 product UI kits; chart recipes section on Charts.
- Docs manual: 9 sections incl. Monorepo, AI & skills, framework recipes; `llms.txt` at the root.
- Root `index.html` redirect → docs site.
- Repo governance: `SECURITY.md`, `CHANGELOG.md`, uppercase `README.md`.

### Changed
- System renamed **Efolusi DS → Meridian** (by Efolusi). Install paths now `meridian/…`.

## 1.0.0 — 2026-07
### Added
- 65 components across 12 groups, each with `.jsx`, typed `.d.ts`, and `.prompt.md` usage guide.
- 158 design tokens (light, dark, compact) derived from the Efolusi brand mark.
- 8 product UI kits with connected user journeys; 5 blocks; 5 page templates.
- Guidelines: accessibility, forms, governance; 46 specimen cards.
- MIT license.
