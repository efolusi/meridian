# Meridian — vision

**Status:** living document · reflects 1.9.2 (2026-07-23)
**Scope:** what Meridian is for, who it serves, the bar that keeps it production-grade, and the protocol for running an autonomous loop against it.
**Execution detail lives in [ROADMAP.md](ROADMAP.md); this is the why plus the safe how, not the day-to-day plan.**

---

## What Meridian is

Meridian is a general-purpose, open-source design system by Efolusi: 109 accessible React components, 177 design tokens in light, dark and compact, 9 blocks, and full example apps. It ships two ways from one source. The flagship is zero-build: four tags, one global, no bundler, the way meridian.efolusi.com serves itself. The second is `@efolusi/meridian` on npm, real ES modules with types, for teams on Vite, Next and Remix. It is warm paper, espresso ink, hairline structure, derived entirely from the Efolusi owl mark, and it is the studio's own most demanding customer: Efolusi builds its products and its site on it.

## North star

> A design system a team can adopt in an afternoon and trust in production, whether they paste four tags or `npm install`, whether they render on a server or an edge, whether a human or an agent is writing the screen.

Meridian wins when the choice of Meridian is boring: it is fast, it is accessible, it renders correctly the first time, and nobody has to read the source to trust it. Reach is second to trust. A system people rely on for one real product beats a system people star and never ship.

## Who it is for

| Audience | What they need from Meridian |
|---|---|
| **Efolusi product teams** | One system across every product surface, so a screen looks and behaves like Efolusi without re-deciding anything. The dogfood loop: gaps found shipping ZOYYA, Komando, PaySwitch, Nova and the rest feed straight back here. |
| **External React teams** | An install that works on the first try, on their stack, with types that compile and CSS that is styled before hydration. No lock-in: vendor a single component, MIT, no attribution. |
| **AI agents and LLMs** | A system a model can read and write correctly. Flat source files, one prop grammar, per-component `.prompt.md`, `llms.txt` and a generated `llms-full.txt`, a machine-readable registry. A model that has seen three components can write the other 106. |
| **Contributors** | A contract that is one command (`npm run check`) and gates that explain themselves, so a second contributor can land a change without breaking the bundle, the types, or a keyboard path. |

## Principles

- **The zero-build path is sacred.** The four-tag CDN flow is the flagship and never regresses for the sake of the npm build. The two paths diverge only where they must (icons inlined for npm, static CSS for SSR), and each divergence is deliberate and documented.
- **One system, many surfaces.** The same source compiles to a CDN bundle and an ESM package, renders on a server and a client, and reads correctly to a human and a model. Correctness is proven for every surface, not assumed from one.
- **Accessible by default, not by opt-in.** WCAG 2.1 AA is the floor: visible focus everywhere, full keyboard operability, contrast in both themes, reduced-motion honoured including JS-driven motion, status never carried by colour alone. A component that names an ARIA role owns that role's whole keyboard contract.
- **Craft means correctness you can prove.** Every claim is gated. "Accessible", "reproducible", "the types compile", "the icons render" are not adjectives in a README, they are checks that fail the build when they stop being true.
- **Deprecate, never break.** An API changes by adding the new name and keeping the old one working for one major, marked `@deprecated`. Consumers upgrade on a minor without a rewrite.

## What "production-ready" means

This is Meridian's definition of done, applied to every release. Most of it is met and enforced in CI today; the honest status is marked. Nothing ships red.

### Correctness and reproducibility — met, gated
- The committed `_ds_bundle.js` is byte-reproducible from source; CI rebuilds and diffs rather than trusting a recorded hash.
- The manifest, registry, token exports, interfaces and `llms-full.txt` are generated, never hand-maintained, and a generator that leaves the tree dirty fails the run.
- No dead interactive controls, no raw colour literals (the token-adherence baseline is 0), no unresolved relative paths.

### Accessibility — met, gated
- Contrast verified for 40 token pairs against both themes (4.5:1 text, 3:1 non-text).
- Every documented keyboard contract has a test enforcing it; when three components silently broke theirs, the tests caught it before release.
- The published guideline in `guidelines/accessibility.md` is held true, not aspirational.

### SSR and bundler compatibility — met, gated
- All public exports render under `renderToString` with parser-safe inline styles, so hydration never mismatches. Guarded for the whole surface, not a hand-picked few.
- Every module carries `"use client"`, so importing from a Next.js Server Component is not a build error.
- Component CSS is a static stylesheet, so server-rendered HTML is styled before hydration; the CDN path keeps runtime injection.

### Distribution integrity — met, gated
- The npm package imports cleanly through its `exports` map (not by file path), deep imports resolve with and without extension, no internal helpers leak, and every asset the CSS references is in the tarball.
- Fonts ship as WOFF2, licences travel with the fonts and icons, `LICENSE` and `THIRD_PARTY_NOTICES` are in the package.
- Types compile against `@types/react` 18 and 19.

### Testing and regression — met, growing
- 230+ tests across 22 files: keyboard contracts, wiring, SSR, alias compatibility, hydration.
- Visual regression: 26 group screenshots per theme, gated against baselines with pixelmatch, refreshed through a reviewable PR.
- **Open (ROADMAP Phase 3):** interaction tests for the last few stateful components; a per-release size budget.

### Release operations — met
- Published to npm with provenance via Trusted Publishing (OIDC): no token stored anywhere.
- Releasing is a version bump pushed to main; CI re-runs every gate, publishes, tags, and cuts the GitHub Release from the changelog. `main` is protected; the same gates that guard a PR guard a release.
- npm versions are immutable, so the rule is fix-forward, documented in [RELEASING.md](RELEASING.md).

### Documentation and discoverability — met, expanding
- Live docs with editable-in-place demos, a bring-your-own-brand theming guide, per-component prompt guides, `llms.txt` and `llms-full.txt`, a machine-readable registry.
- **Open (ROADMAP Phase 4):** versioned docs with a switcher, per-framework guides with maintained example repos, migration codemods, an MCP server exposing the registry to agents.

## What winning looks like

- Every Efolusi product surface is Meridian, and the studio finds its gaps before anyone outside does.
- An external team ships a real product on Meridian and never has to read the component source to trust it.
- An agent asked to build an Efolusi-branded screen gets it right from the prompt files and the registry, first try.
- A contributor who is not Efolusi lands a change, because the contract is one command and the gates are honest.

Reach follows from those. Stars do not.

## Non-goals

- Not a component for every possible need. Meridian covers the common path of a real product surface completely, and declines the speculative and the niche.
- Not a framework. It is components, tokens and patterns; it does not own routing, data, or state beyond a component's own.
- Not a break-for-cleanliness system. A nicer API is not worth a consumer's broken build; deprecate and keep the old name.
- Not a monorepo of split packages. One package, granular via subpath exports; revisit only if a consumer needs tokens on a different cadence than components (decision recorded in ROADMAP.md).
- Not Meridian's own analytics or telemetry in a consumer's page. What a team ships is theirs.

## Where the work is tracked

The phased plan, the open backlog, and the recorded decisions live in [ROADMAP.md](ROADMAP.md). Architecture and the compiler contract are in [ARCHITECTURE.md](ARCHITECTURE.md); the contribution and versioning rules are in [guidelines/governance.md](guidelines/governance.md). This document is the standard those three serve.

## Running an autonomous loop against this vision

This section makes the document safe to hand to an autonomous loop. Read it in full before the first iteration; it is the operating contract, not advice.

### Prime directive: this package auto-releases, and npm is forever

Meridian publishes automatically. A push to `main` carrying a version the registry does not have re-runs every gate and then publishes to npm, tags, and cuts a release. **npm versions are immutable: a bad publish cannot be taken back.** Therefore the loop, without exception:

- works only on the branch `loop/vision-dod` (create it from `main` if absent, check it out at the start of every iteration), never on `main` itself;
- never changes any version field: `_ds_manifest.json` `version`, `package.json` `version`, `CITATION.cff`, or the `softwareVersion` in `site/DsSite.dc.html`;
- never pushes to `main`, never tags, never creates a GitHub Release, never runs `npm publish`;
- leaves finished work as commits on its branch for a human to review, merge, and release per [RELEASING.md](RELEASING.md).

Releasing is a human act. The loop's output is reviewed diffs, never a shipped version.

### Invariants (never violate, verified against CLAUDE.md and the build)

- `npm run check` must exit green before any commit. It is the whole of CI's gate set in one command (four generators, then twelve gates). Use `npm run check:fix` to regenerate first. The Playwright smoke job is the only thing it does not cover.
- After any `components/**/*.jsx` or `showcases/**/*.jsx` edit, recompile the bundle: `node scripts/build_bundle.mjs`. Never ship a source-only component edit; the "bundle reproducible" gate will fail.
- Never hand-edit a generated file. Fix the source, then regenerate. Generated outputs are: `_ds_bundle.js`, `_ds_manifest.json`, `dist/`, `site/registry/`, `site/registry.json`, `site/interfaces.json`, `tokens.json`, `tailwind.preset.js`, `llms-full.txt`.
- Semantic tokens only in component CSS; no raw hex. The token-adherence baseline is 0 and is gated.
- Deprecate, never break. An API change adds the new name and keeps the old one working for one major, marked `@deprecated`. Prove canonical-and-alias with a test.
- Every icon used must already exist in `assets/icons/` (Lucide, 24x24, stroke 2). Add the SVG before referencing a new name.
- Never name a local helper after a design-system export (`Stat`, `Card`, `Divider`); the page runtime hijacks it. Prefix locals.
- The `// @demo <Component> <Title>` marker is load-bearing; never place that literal in prose.
- The zero-build CDN path is sacred. Never regress it for the sake of the npm build.

### One iteration

1. **Pick** the highest-priority unblocked item from the backlog below.
2. **Verify the gap is still real** first, by grep / read / run. The backlog and ROADMAP drift; several items that read as open are already shipped. If it is done, mark it and move to the next. Never redo shipped work.
3. **Implement on the branch.** Keep it additive; nothing in the published API breaks.
4. If a component or showcase source changed, **recompile the bundle**.
5. **Run `npm run check`.** If red, fix to green. If it cannot be made green, stop and report the failing output.
6. For any visual, render, or demo change, **run the smoke page** (`site/_smoke.html`) and confirm all demos render with a clean console.
7. **Commit to the branch** with a clear message. Do not push to `main`, bump a version, or release.
8. Log the item done. Next iteration.

### Stop conditions

- The item needs a human decision (see below). Stop and ask.
- A gate cannot be made green. Stop and report.
- The backlog is empty.
- Any change would touch a version field or `main`. Stop; that is a human release act.

### Backlog (loop-safe: additive, gated, no owner decision needed)

Ordered by value. Each is verifiable by the existing gates plus its own new test. Confirm the gap before starting each, per step 2.

1. **Size budget gate.** Add `scripts/check_size.mjs` that records the built bundle and npm `dist/` sizes and fails on a regression past a set threshold; wire it into `check_all.mjs` and prove it fails on synthetic bloat. (ROADMAP Phase 3.)
2. **Interaction tests for the still-uncovered stateful components.** Verify which of Slider, RichComposer, PromptSteps and Toast lack a keyboard test, then add one file each, matching `tests/keyboard-*.test.jsx`. (Phase 3.)
3. **Finish the API-conventions sweep, with aliases.** One action-prop shape across Alert / Banner / Toast; unify `status` vs `state`; `defaultVisible` to `defaultOpen`. Deprecated aliases, never a break, canonical-wins tests. (Phase 1 / appendix.)
4. **Remove the last hand-maintained lists.** If SiteSearch's `PAGES`/`DOCS` are still hand-authored, derive them from the registry the way the smoke `FILES` list already is; prove a new page appears without editing an array. (Appendix.)
5. **Patterns docs** (additive pages): forms and validation, empty states, error handling, loading, destructive flows, and an agent-UX playbook for the `ai/` group. Render plus smoke pass. (Phase 4.)
6. **Framework guide pages**: Next.js App Router (`use client`), Vite, Remix, plain HTML, each accurate against the real 1.9.x package. (Phase 4.)

**Excluded from the loop (a human must decide first):** versioned-docs tooling, an MCP server, the Figma library, a standalone icon package, CLA vs DCO, and the analytics stance. These are in ROADMAP.md under decision points; the loop does not touch them.

---

*MIT licensed. The Efolusi owl mark and the "Meridian" and "Efolusi" names are not part of the grant: do not use them to brand a derived system.*
