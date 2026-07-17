---
name: meridian-design
description: Use this skill to generate well-branded interfaces and assets with Meridian, the Efolusi design system, either for production or throwaway prototypes/mocks/etc. Contains essential design guidelines, colors, type, fonts, assets, and ready-made product screens for prototyping.
user-invocable: true
---

Read the repository README.md (at the repo root, one level up from this skill), and explore the other available files.
If creating visual artifacts (slides, mocks, throwaway prototypes, etc), copy assets out and create static HTML files for the user to view. If working on production code, you can copy assets and read the rules here to become an expert in designing with this brand.
If the user invokes this skill without any other guidance, ask them what they want to build or design, ask some questions, and act as an expert designer who outputs HTML artifacts _or_ production code, depending on the need.

Quick orientation:
- `styles.css` imports all tokens (`tokens/*.css`) — link it and you have the full system.
- Fonts: Bricolage Grotesque (display), Figtree (UI/body), JetBrains Mono (code) — variable TTFs in `assets/fonts/`, @font-face in `tokens/fonts.css`.
- Palette: everything derives from the owl mark — brand ramp cream→peach→caramel→cocoa (`--brand-50…950`), espresso ink (`--brand-950` `#2C1709`) for primary actions, caramel (`--brand-700`) for links and focus, warm sand neutrals for everything else. Hairline borders, near-zero shadows, no gradients.
- Components: React primitives in `components/{forms,display,navigation,feedback,data,overlay,ai,code,files,dates,finance,icons}/` — each has a `.prompt.md` with usage.
- Products: Agent (autonomous AI), Infra, Content, Tools, Trader, Social Finance — the `ai/`, `code/`, `files/`, `data/` groups exist for their surfaces.
- Icons: 107 Lucide SVGs in `assets/icons/`, 2px stroke, rendered via the Icon component or inlined.
- Full screens to copy from (showcases, plain JSX): `showcases/{console,auth,website,docs,agent,infra,trader,tools}/`; page-shell starter in `starters/app-page/`.
- Voice: sentence case, verbs on buttons, "we/you", no emoji. See README.md § Content fundamentals.
- Dark mode: `data-theme="dark"` on any subtree; compact density: `data-density="compact"`. Semantic tokens only — never raw ramp values — and both themes come free.
- Patterns: `guidelines/forms.md` (validation), `guidelines/accessibility.md` (keyboard map, contrast), `guidelines/governance.md` (versioning, contribution).
- Starters for new pages (copy the whole folder): `starters/{dashboard,auth-page,marketing-page,docs-page,app-page}/`.
- Pre-composed marketing/app sections in `blocks/` (hero, pricing, FAQ, 404, activity feed) — copy and adapt.
