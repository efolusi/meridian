# Project rules

- Never name a local helper component the same as a design-system export (e.g. `Stat`, `Card`, `Divider`) in kit screens, blocks, cards, or demos — the page runtime resolves JSX identifiers against the DS namespace first and silently hijacks the local. Prefix locals (`KpiCard`, `AuthDivider`, `SectionRow`).
- All icon references must exist in `assets/icons/` (Lucide, 24×24, stroke 2). Add the SVG before using a new name.
- The docs site lives in `apps/www/`; component demos in `apps/www/registry/examples/<group>.jsx` use `// @demo <Component> <Title>` markers — never put that literal marker in prose comments.
- `apps/www/_smoke.html` renders every demo; run it after demo changes.
- Component source lives in `apps/www/registry/ui/<group>/`; any `.jsx` change there (or in `registry/kits/`) requires recompiling `_ds_bundle.js` — never ship source-only component edits.
- Site copy: system name is **Meridian** (by Efolusi); footer reads "Built by Efolusi. The source code is available on GitHub. MIT licensed."
