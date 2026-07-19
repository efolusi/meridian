# Changelog

All notable changes to Meridian are documented here. Format follows [Keep a Changelog](https://keepachangelog.com); versioning follows the policy in `guidelines/governance.md`.

> **On the versions below 1.4.0:** Meridian was built in the open but released to nobody. Versions 1.0.0 through 1.3.0 are development milestones recorded as they happened; they were never tagged, published, or installable, so there is no artefact to go back to. They are kept because they are an accurate record of how the system was built, not because you can depend on them. The first tagged, publicly consumable release is 1.4.0.

## Unreleased

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
