# Project rules

- Never name a local helper component the same as a design-system export (e.g. `Stat`, `Card`, `Divider`) in showcase screens, blocks, cards, or demos — the page runtime resolves JSX identifiers against the DS namespace first and silently hijacks the local. Prefix locals (`KpiCard`, `AuthDivider`, `SectionRow`).
- All icon references must exist in `assets/icons/` (Lucide, 24×24, stroke 2). Add the SVG before using a new name.
- Component source lives in `components/<group>/`; any `.jsx` change there (or in `showcases/`) requires recompiling `_ds_bundle.js` — never ship source-only component edits. Read `ARCHITECTURE.md` before moving or renaming anything.
- The docs site lives in `site/`; component demos in `site/examples/<group>.jsx` use `// @demo <Component> <Title>` markers — never put that literal marker in prose comments.
- `site/_smoke.html` renders every demo; run it after demo changes. `scripts/check_contrast.py` and `scripts/check_runtime_copies.py` must pass before a push.
- Site copy: system name is **Meridian** (by Efolusi); footer reads "Built by Efolusi. The source code is available on GitHub. MIT licensed."
