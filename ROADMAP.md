# Meridian — open-source roadmap

Goal: take Meridian from a complete internal system (v1.x) to a professional, enterprise-adoptable open-source design system.

**Baseline today:** 104 components (source + `.d.ts` + `.prompt.md`), 158 tokens in light/dark/compact, 107 icons, 9 blocks, 8 product kits, 6 page templates, docs site with live demos and search, smoke page (121 demos), guidelines (accessibility, forms, governance), MIT license, llms.txt + agent skill.

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
- **Vendoring CLI / registry.json.** Components are already flat-file; publish a machine-readable registry so `npx meridian add button` copies source + types + prompt into a repo (shadcn-style — our model already fits).
- **Design tokens in DTCG format.** `tokens.json` alongside the CSS, so Style Dictionary / Figma Variables / Tailwind users can consume the same source of truth. Ship a small Tailwind preset.

**Exit:** three documented install paths (script tag, npm, vendor), each with a working starter repo.

## Phase 3 — Quality infrastructure

- **Visual regression.** Snapshot every demo from the smoke page per PR; light + dark.
- **Interaction tests** for the stateful ten (Combobox, CommandPalette, Dialog, Menu, DatePicker, Slider, RichComposer, Player, PromptSteps, Toast) — keyboard-driven, not click-only.
- **Token adherence lint** in CI (the adherence config already exists — enforce it).
- **Performance budget.** Bundle size tracked per release; per-component cost table in docs.

**Exit:** a PR can't merge if it breaks a demo, a keyboard path, or the size budget.

## Phase 4 — Documentation to enterprise grade

- **Versioned docs** with a version switcher; docs frozen per minor release.
- **Migration guides + codemods** for every breaking change; deprecation warnings one minor ahead.
- **Patterns section** (beyond components): forms + validation, empty states, error handling, loading, destructive flows, agent UX (our differentiator — the ai/ group deserves a written playbook).
- **Framework guides**: Next.js (RSC/`use client`), Vite, Remix, plain HTML — each with a maintained example repo.
- **Agent-native docs**: keep llms.txt + `.prompt.md` first-class; publish an MCP server exposing the registry so agents can query components directly.

## Phase 5 — Design assets

- **Figma library** with parity: tokens as Variables (light/dark/compact modes), components with matching prop names, auto-layout mirroring flex gaps. Publish to Community.
- **Icon set** published standalone (107 Lucide-derived SVGs, named identically to code).
- **Brand usage policy** for the owl mark and "Meridian" name (system is MIT; the mark is not).

## Phase 6 — Community & governance

- **CODE_OF_CONDUCT.md**, issue/PR templates, `good first issue` seeding.
- **RFC process** for API changes (extend guidelines/governance.md): proposal → comment window → accept/decline log.
- **Release cadence**: minor monthly, patch as needed; signed tags; human-written release notes; public roadmap board.
- **Support policy**: current major fully supported, previous major security-only for 12 months (LTS statement enterprises ask for). Extend SECURITY.md with supported-versions table.

---

## Decision points (need owner input)

1. npm scope/name — `@efolusi/meridian` vs unscoped `meridian-ds`.
2. Monorepo split on publish (tokens / icons / components as separate packages) or single package.
3. Figma: build in-house or recruit a community maintainer.
4. Docs hosting + domain (e.g. meridian.efolusi.com) and analytics stance (recommend: none, state it).
5. CLA vs DCO for contributions.

## First five actions

1. Write the API conventions doc and run the 104-component audit against it.
2. Script the contrast check; fix any failing token pair.
3. A11y pass on the priority-seven interactive components; publish per-component a11y notes.
4. Cut `tokens.json` (DTCG) from the CSS source.
5. Add CODE_OF_CONDUCT.md + issue/PR templates + supported-versions table in SECURITY.md.
