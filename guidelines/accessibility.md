# Accessibility

Efolusi ships WCAG 2.1 AA. The rules, per concern:

## Focus
- Every focusable element shows the 2px caramel ring (`--focus-ring`) via `:focus-visible`. Never remove it; never replace it with color alone.
- Focus order follows DOM order. Dialogs/Drawers trap focus while open and return it to the trigger on close.

## Keyboard map
- `Tab` / `Shift+Tab` — move between controls
- `Enter` / `Space` — activate buttons, toggle checkboxes/switches
- `Esc` — closes Dialog, Drawer, Menu, Popover, CommandPalette (all built in)
- `↑ ↓` — navigate Menu and CommandPalette items; `Enter` selects
- `← →` — Tabs and SegmentedControl options; Slider value (native)
- `⌘K` — CommandPalette (document the hint with `Kbd`)

## Contrast (light and dark)
- Body text ≥ 4.5:1 (`--text-primary`, `--text-secondary` pass on their surfaces; `--text-muted` is for ≥14px supporting text only)
- UI borders/icons that convey state ≥ 3:1 (`--border-strong` on cards)
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
