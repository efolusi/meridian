# Accessibility

Efolusi ships WCAG 2.1 AA. The rules, per concern:

## Focus
- Every focusable element shows the 2px brand ring (`--focus-ring`: brand-700 in light, brand-400 in dark) via `:focus-visible`. Never remove it; never replace it with color alone. Plain links get the ring from `tokens/base.css`.
- Focus order follows DOM order. The contract for Dialogs/Drawers: trap focus while open and return it to the trigger on close (see Known gaps).

## Keyboard map
- `Tab` / `Shift+Tab` — move between controls
- `Enter` / `Space` — activate buttons, toggle checkboxes/switches
- `Esc` — closes Dialog, Drawer, Menu, Popover, CommandPalette (all built in)
- `↑ ↓` — navigate Menu and CommandPalette items; `Enter` selects
- `← →` — Tabs and SegmentedControl options; Slider value (native)
- `⌘K` — CommandPalette (document the hint with `Kbd`)

## Contrast (light and dark)
- Body text ≥ 4.5:1: `--text-primary`, `--text-secondary`, and `--text-muted` all pass on page, card, and sunken surfaces in both themes; status `*-600` foregrounds pass on their `*-100` tints and on white.
- Hairline borders (`--border-default`, `--border-strong`) are decorative structure and are exempt from contrast minimums. Any border that conveys state on its own (an error outline, a selected row) must use a ≥3:1 color such as `--danger-600` or `--accent`; the hairline tokens do not qualify.
- Status is never color-only: Badge pairs color with text, Alert with an icon, Progress with a value.

## Semantics baked into components
- Icon: `aria-hidden` unless `title` given (then `role="img"`)
- IconButton: `label` prop is required → `aria-label` + `title`
- Dialog/Drawer: `role="dialog" aria-modal="true"`; Alert/Toast: `role="status"`
- Tabs: `role="tablist"/"tab"` + `aria-selected`; Switch: `role="switch"`
- Table: real `<table>` semantics; Pagination: `aria-current="page"`
- Skeleton is decorative — pair with visually-hidden "Loading…" when it replaces content

## Motion
- Durations cap at 240ms and convey state only. If you add larger motion, gate it behind `prefers-reduced-motion`.
- `tokens/base.css` ships a global `prefers-reduced-motion: reduce` guard that collapses all animation and transition durations, including component-injected CSS.

## Known gaps (tracked for the next component release)
- Dialog, Drawer, ConfirmDialog, and CommandPalette do not yet trap focus, move focus in on open, or restore it on close.
- Menu and Popover triggers open on click only (not yet keyboard-operable) and lack `aria-haspopup`/`aria-expanded`; Menu items have no arrow-key navigation yet.
- Calendar/DatePicker lack grid semantics, full-date labels, and arrow-key navigation.
- Tooltip is not linked to its trigger via `aria-describedby`.

These are defects against the contract above, not accepted behavior. Fixing them requires component source changes plus a bundle recompile, so they ship together as one release.
