# Meridian — open-source roadmap

Goal: take Meridian from a complete internal system (v1.x) to a professional, enterprise-adoptable open-source design system.

**Baseline today:** 106 components (source + `.d.ts` + `.prompt.md`), 177 tokens in light/dark/compact, 108 icons, 9 blocks, 8 example apps, 5 starter journeys, docs site with live demos and search, smoke page (121 demos), guidelines (accessibility, forms, governance), MIT license, llms.txt + agent skill.

---

## Phase 1 — Foundation hardening

The credibility layer: nothing markets a system like correctness.

- **Accessibility conformance.** Audit every interactive component against WCAG 2.2 AA: keyboard map, focus order, ARIA roles, `prefers-reduced-motion`. Publish a per-component a11y note on its docs page ("Keyboard", "Screen reader", "Known limits"). Priority: Combobox, CommandPalette, Dialog/Drawer, Menu, DatePicker, RichComposer, Player.
- **Contrast verification.** Scripted check of every semantic token pair (text-on-surface, accent-contrast, states) in light *and* dark; publish results on the Colors page.
- **API consistency audit.** One conventions doc (naming: `variant/size/tone`, `defaultX` for uncontrolled, `onX` for events); sweep all 104 props tables against it; deprecate outliers rather than break.
- **Browser support matrix + RTL statement.** Test on last 2 versions of evergreen browsers; document logical-properties status and what RTL support is (or isn't) in v1.

**Exit:** an ACCESSIBILITY.md conformance statement an enterprise buyer can hand to their compliance team.

## Phase 2 — Distribution

Meet developers where they are; keep the zero-build path as the flagship.

- **npm package** (`@efolusi/meridian`): ESM exports per component, existing `.d.ts` shipped, `styles.css` as export, semver from day one.
- **CDN + pinned releases.** Tagged, immutable `_ds_bundle.js` builds with integrity hashes.
- **Vendoring CLI / registry.json.** Components are already flat-file; publish a machine-readable registry so `npx meridian add button` copies source + types + prompt into a repo (our flat-file model already fits).
- **Design tokens in DTCG format.** `tokens.json` alongside the CSS, so Style Dictionary / Figma Variables / Tailwind users can consume the same source of truth. Ship a small Tailwind preset.

**Exit:** three documented install paths (script tag, npm, vendor), each with a working starter repo.

## Phase 3 — Quality infrastructure

- ~~Visual regression.~~ Landed 2026-07-22: the smoke run captures one PNG per example group per theme (26 shots), `scripts/check_visual.mjs` gates every push/PR against `tests/__shots__` baselines with pixelmatch, and the `update-visual-baselines` workflow refreshes them via a reviewable PR (baselines are CI-born; local rasterisation differs by platform).
- ~~**Interaction tests** for the stateful ten.~~ Landed 2026-07-24: keyboard/interaction tests now cover all ten. The four that lacked one (Slider, RichComposer, PromptSteps, and Player's keyboard seek) shipped in `tests/interaction-stateful.test.jsx`; the rest have `tests/keyboard-*.test.jsx` or `wave1.test.jsx` (Combobox). Suite at 246 tests.
- **Token adherence lint** in CI (the adherence config already exists — enforce it).
- ~~**Performance budget** (the size-regression gate).~~ Landed 2026-07-24: `scripts/check_size.mjs` gates `_ds_bundle.js`, `dist/components.css` and the npm `dist/` total against `scripts/size_budget.json` inside `npm run check`; the budget grows only through a committed `--update`, so every size increase is a reviewed act. Still open: a per-component cost table in the docs.

**Exit:** a PR can't merge if it breaks a demo, a keyboard path, or the size budget.

## Phase 4 — Documentation to enterprise grade

- **Versioned docs** with a version switcher; docs frozen per minor release.
- **Migration guides + codemods** for every breaking change; deprecation warnings one minor ahead.
- **Patterns section** (beyond components). Started 2026-07-24: `guidelines/patterns.md` covers loading, empty, error, destructive flows and agent surfaces (forms already had `guidelines/forms.md`). Still open: worked examples on the docs site, and a deeper agent-UX playbook for the ai/ group.
- **Framework guides**: Next.js (RSC/`use client`), Vite, Remix, plain HTML. Landed 2026-07-24: `guidelines/frameworks.md` documents all four with the real gotchas (the styles import location, the built-in `"use client"`, React 18 UMD pinning for the CDN path, vendoring). Still open (needs an owner decision): a *maintained example repo* per framework.
- **Agent-native docs**: keep llms.txt + `.prompt.md` first-class; publish an MCP server exposing the registry so agents can query components directly.

## Phase 5 — Design assets

- **Figma library** with parity: tokens as Variables (light/dark/compact modes), components with matching prop names, auto-layout mirroring flex gaps. Publish to Community.
- **Icon set** published standalone (108 Lucide-derived SVGs, named identically to code).
- **Brand usage policy** for the owl mark and "Meridian" name (system is MIT; the mark is not).

## Phase 6 — Community & governance

- **CODE_OF_CONDUCT.md**, issue/PR templates, `good first issue` seeding.
- **RFC process** for API changes (extend guidelines/governance.md): proposal → comment window → accept/decline log.
- **Release cadence**: minor monthly, patch as needed; signed tags; human-written release notes; public roadmap board.
- **Support policy**: current major fully supported, previous major security-only for 12 months (LTS statement enterprises ask for). Extend SECURITY.md with supported-versions table.

---

## Decision points (need owner input)

1. ~~npm scope/name~~ Decided 2026-07-20: `@efolusi/meridian`, published from 1.5.0.
2. ~~Monorepo~~ Decided 2026-07-24: **monorepo, Option A (umbrella, non-breaking).** Reverses the earlier single-package call. The repo is a workspace of lockstep packages: `@efolusi/meridian` stays the umbrella that ships everything (existing consumers unaffected, still 1.x), and standalone sub-packages are carved from the same flat sources for one-layer consumers — `@efolusi/meridian-tokens` (shipped), `@efolusi/meridian-icons` (next). The flat component sources and the zero-build CDN bundle are not moved; the monorepo is an npm-side structure only. Versions move in lockstep from `_ds_manifest.json`. A per-package split of the components themselves (Option B, breaking, 2.0) was declined.
3. Figma: build in-house or recruit a community maintainer.
4. ~~Docs hosting~~ Decided: live at meridian.efolusi.com on Cloudflare Pages; no analytics.
5. CLA vs DCO for contributions.

## First five actions

1. Write the API conventions doc and run the 106-component audit against it.
2. ~~Script the contrast check; fix any failing token pair.~~ Done 2026-07-17: `--text-muted`, `--success-600`, `--danger-600` retuned to ≥4.5:1 in both themes (see CHANGELOG § 1.4.0).
3. ~~A11y pass on the priority-seven interactive components.~~ Done 2026-07-18: keyboard and focus contracts shipped and verified for Menu, Popover, Dialog, Drawer, ConfirmDialog, CommandPalette, Calendar/DatePicker, Tabs, Tooltip, HoverCard — see `guidelines/accessibility.md` § component keyboard contracts. Per-component notes on docs pages still open.
4. ~~Cut `tokens.json` (DTCG) from the CSS source.~~ Done 2026-07-18: `scripts/build_tokens.py` generates `tokens.json` and `tailwind.preset.js` from `tokens/*.css`; CI regenerates and diffs both on every push.
5. ~~Add supported-versions table in SECURITY.md + issue-template gaps.~~ Done 2026-07-17 (CODE_OF_CONDUCT.md and bug/proposal templates already existed; added config.yml, docs-issue template, SUPPORT.md, THIRD_PARTY_NOTICES.md).

---

## Appendix — engineering backlog from the 2026-07-17 full audit

Concrete items surfaced by the five-area audit (components, tokens, docs site, kits/blocks/templates, repo meta). Each slots into a phase above. Note the standing constraint: any `components/**/*.jsx` (or `showcases/`) change requires recompiling `_ds_bundle.js` with the DS compiler — component fixes below ship together as bundled releases, never as source-only edits.

**Adopted 2026-07-18 — Meridian's own layout:** system core at the root (`styles.css`, `tokens/`, `assets/`, compiler artifacts — the vendoring API), `components/` + `blocks/` as the shallow library, `showcases/` (example apps) + `starters/` (copyable journeys), and `site/` as the docs website that consumes everything and owns nothing. `site/registry.json` + `site/registry/` are generated by `scripts/build_registry.py` in an open registry schema for CLI compatibility. Rationale and the generated-vs-authored inventory live in `ARCHITECTURE.md`; contributor conventions in `STYLEGUIDE.md`. Still missing, add when the work actually exists (not as empty scaffolding):
- `packages/meridian` — the vendoring CLI (`npx meridian add button`); until then the generated registry follows an open registry schema, so compatible CLIs can install items directly from the hosted `site/registry/*.json`.
- pnpm workspace + turbo + changesets — introduce together with the first real package, not before. (The vitest chassis already landed: `vitest.config.js`, `tests/`, and `npm test` gated in CI.)
- Custom domain for the docs host (decision point 4) — the repo ships the hosting config (`_headers`, `_redirects`, `404.html`, `robots.txt`, `sitemap.xml`, `wrangler.jsonc`) and OG cards on every docs page; what remains is connecting the repo in the Cloudflare dashboard.
- npm publishing (decision point 1/2).

**Phase 1 — components (a11y release shipped 2026-07-18; contracts in `guidelines/accessibility.md`)**
- ~~Focus trap, focus-in, restore, labelling for Dialog, Drawer, ConfirmDialog, CommandPalette; keyboard Menu/Popover triggers with arrow navigation; Calendar/DatePicker grid + keyboard; Tabs roving tabindex; Tooltip `aria-describedby`; HoverCard role fix.~~ Done and verified in-browser.
- ~~Menu typeahead; arrow-key navigation for ContextMenu and Menubar.~~ Done 2026-07-18: full arrow/Home/End/typeahead keyboard support across Menu, ContextMenu, and Menubar (verified in-browser).
- ~~Specimen-card coverage for the 7 uncarded components.~~ Done 2026-07-18: Confirmation, Conversation, BarChart, KeyValueList, StatusDot, Loader, Steps added to their group cards (verified in-browser). Every public component now appears in a card.

**Phase 1 — tokens (additive, wire in the same bundled release)**
- `--z-*` elevation scale replacing the 15 raw z-indexes (today: five overlays tie at 80; Tooltip at 60 loses to Drawer at 100).
- `--overlay-scrim` for the repeated `rgba(31,26,20,.45)` scrims; `--text-on-brand-muted` for the 6 hard-coded `rgba(248,244,230,.75)` sites; `--text-2xs` (or similar) so the 134 raw px font sizes can snap to the scale; route raw hex in Toast/Terminal/CodeBlock/Badge through semantic tokens; rename `--shadow-pop` → `--shadow-xl` (alias kept one major).
- API conventions sweep, partially landed 2026-07-22 (choose-an-item events unified on onChange/onSelect, placement unified on `side`, `formatValue`→`format`, WebPreview controlled-capable + `defaultOpen` — all with one-major deprecated aliases). Still open: one action-prop shape across Alert/Banner/Toast, `status` vs `state`, `defaultVisible`, `size` enum-vs-pixel doc.

**Phase 3 — quality infrastructure**
- CI on every PR: manifest↔source sync check (the committed bundle's one real risk is silent staleness), oxlint adherence run (first fix the config: empty `forbid-elements` rule, and the `no-restricted-imports` message assumes an `index.js` barrel that doesn't exist), dead-link check, headless smoke run.
- ~~Make `_smoke.html` assert: count real successes (not attempts) and expose a machine-readable pass/fail (e.g. `document.title`), so CI can gate on it.~~ Done: `_smoke.html` sets `html[data-smoke]`, a `SMOKE PASS/FAIL — n/m` title, and `window.__SMOKE__`; CI gates on it headlessly in the `smoke` job via `scripts/smoke_headless.mjs`.
- Derive SiteSearch's PAGES/DOCS lists and `_smoke.html`'s FILES list from the registry instead of hand-maintained arrays (today a new page or example file is silently unindexed/untested).
- Add SRI integrity hashes to the CDN install snippets (`README.md`, `site/Docs.dc.html`, `site/Components.dc.html` and `hello.html` still emit bare `<script>` tags with no `integrity`/`crossorigin`). Production React builds landed in 3ef49b6 for the blocks, showcase indexes and specimen cards; `site/_smoke.html` and `guidelines/patterns-form.html` stay on the development build for readable error messages.

**Phase 4 — docs site**
- ~~Expand nested interface types (`TableColumn`, `TabItem`, …) in generated prop tables.~~ Done 2026-07-18: `scripts/build_interfaces.py` emits `site/interfaces.json` (35 interfaces) and the Components page renders them as nested field tables, with a CI sync gate.
- ~~`sitemap.xml`, `robots.txt`, and a wired 404 page when the docs get a public host.~~ Done: all three ship at the repo root.

**Needs owner input (in addition to the decision points above)**
- ~~FUNDING.yml~~ Decided 2026-07-22: omitted — there are no sponsor accounts to point at, and an empty funding banner is worse than none. Reversible in one commit when accounts exist.
- Whether `.thumbnail` preview files ship in the public repo (`thumbnail.html` is referenced by the manifest; the WebP files are unreferenced).
- Same-day 1.1.0/1.2.0/1.3.0 release dates in CHANGELOG — backfill real dates if they exist.
