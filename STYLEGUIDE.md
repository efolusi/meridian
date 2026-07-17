# Style guide

The conventions that keep many hands producing one system. CONTRIBUTING.md says what to ship; this says how it must look. Reviewers block on violations; none of this is advisory.

## Files and naming

- Components: `PascalCase.jsx` + `PascalCase.d.ts` + `PascalCase.prompt.md` in `components/<group>/` (groups are lowercase). Every component appears in its group's `<group>.card.html`.
- Blocks, showcases, starters: `kebab-case` directories and files.
- Never name a local helper after a DS export (`Stat`, `Card`, `Divider`, …) — the runtime namespace wins and silently replaces your local. Prefix locals: `KpiCard`, `AuthDivider`, `SectionRow`.
- One component per file. Compound parts live with their parent (`Toggle` + `ToggleGroup` in `Toggle.jsx`) and are exported from it.

## Props

- Variant axes: `variant` (visual style), `size` (`sm | md | lg`), `tone` (semantic color). Never `kind`, `type`, or `color` for these.
- Uncontrolled defaults: `defaultOpen`, `defaultValue`. Events: `onChange`, `onOpenChange`, `onX`. Booleans are bare (`open`, `disabled`), never `isOpen`.
- Numeric `size` (Avatar, Icon, Spinner) is a documented exception: it means pixels. Do not add new dual-meaning props.
- Every prop appears in the `.d.ts` with JSDoc and `@default` where applicable. The registry generates docs from it; an undocumented prop is unfinished work.

## Styling

- Semantic tokens only: `var(--surface-card)`, never raw hex, never raw ramp values (`--sand-300`) in components. New values go into `tokens/` first.
- Type sizes from `--text-*`; spacing from `--space-*`; motion from `--dur-fast/med/slow` + `--ease-out/spring`; nothing animates longer than 240ms.
- One `CSS` template string per component, injected via `injectEfCss(id, css)`. Class prefix `ef-<component>`.
- No new dependencies. React and the DS namespace are the entire import surface.

## Copy

Sentence case everywhere. Buttons are verbs ("Save changes", never "Submit"). Voice is we/you, warm and direct. No emoji in product UI. Errors say what happened and how to fix it.

## Accessibility

Keyboard path, visible `--focus-ring`, and correct ARIA per `guidelines/accessibility.md` are entry criteria, not polish. A component with a `role` must implement that role's full keyboard contract.

## Process

- API changes and new components start as an RFC issue (template in `.github/ISSUE_TEMPLATE/rfc.md`) before code.
- Component `.jsx` changes ship with a bundle recompile (see ARCHITECTURE.md § invariants).
- Before pushing: `site/_smoke.html` renders clean; `scripts/check_contrast.py` and `scripts/check_runtime_copies.py` pass.
- Deprecate, don't break: old prop aliases live one major version with a console warning, per `guidelines/governance.md`.
