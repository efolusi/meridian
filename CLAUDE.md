# Project rules

- Never name a local helper component the same as a design-system export (e.g. `Stat`, `Card`, `Divider`) in kit screens, blocks, cards, or demos — the page runtime resolves JSX identifiers against the DS namespace first and silently hijacks the local. Prefix locals (`KpiCard`, `AuthDivider`, `SectionRow`).
- All icon references must exist in `assets/icons/` (Lucide, 24×24, stroke 2). Add the SVG before using a new name.
- The docs site lives in `templates/ds-site/`; component demos in `templates/ds-site/examples/<group>.jsx` use `// @demo <Component> <Title>` markers — never put that literal marker in prose comments.
- `templates/ds-site/_smoke.html` renders every demo; run it after demo changes.
- Site copy: system name is **Meridian** (by Efolusi); footer reads "Built by Efolusi. The source code is available on GitHub. MIT licensed."
