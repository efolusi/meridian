# Accessibility

Efolusi ships WCAG 2.1 AA. The rules, per concern:

## Focus
- Every focusable element shows the two-layer opaque ring (`--focus-ring`: a 2px `--focus-ring-offset` surface layer under a 2px `--focus-ring-color` band, brand-700 in light and brand-400 in dark) via `:focus-visible`. Never remove it; never replace it with color alone. Plain links get the ring from `tokens/base.css`.
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

## Component keyboard contracts (verified in-browser)
- Dialog, Drawer, ConfirmDialog: focus moves in on open, Tab and Shift+Tab wrap inside, Escape closes, focus returns to the invoker; panels carry `aria-labelledby`/`aria-describedby`.
- Menu, Popover: triggers are keyboard-operable with `aria-haspopup`/`aria-expanded`; Menu opens focused with `↑ ↓ Home End` navigation, Escape restores the trigger.
- CommandPalette: `role="combobox"` input with `aria-activedescendant` over a `listbox` of options; arrows scroll the active option into view.
- Calendar/DatePicker: `role="grid"` with labelled columnheaders, per-day full-date labels, `aria-selected`/`aria-current`, `← → ↑ ↓ Home End PageUp PageDown` navigation; DatePicker moves focus into the grid on open and back to its button on close.
- Tabs: roving tabindex, `← → Home End` move focus and selection together.
- Tooltip links to its trigger via `aria-describedby` and dismisses on Escape; HoverCard is a non-modal panel (no dialog role) and dismisses on Escape.

Full keyboard coverage across overlays: Menu, ContextMenu, and Menubar support arrow-key navigation, Home/End, and single-character typeahead; Menubar adds Left/Right between menus and Down to open.

## Browser support and RTL

**Supported:** the last two versions of Chrome, Edge, Safari and Firefox. The
system uses `color-mix()`, `:focus-visible`, CSS custom properties and
`position: fixed` overlays; all are available across that range. The zero-build
CDN path additionally depends on React 18 UMD builds — React 19 dropped UMD, so
that path is pinned to 18 while the npm build tracks `react >= 18`.

**RTL is not supported in 1.x, and the honest reason is that it has not been
done rather than that it is impossible.** Components use physical properties
(`left`, `right`, `margin-left`) in places, so a `dir="rtl"` document will render
with correct text direction but mirrored-wrong spacing and overlay alignment.
Moving to logical properties (`inset-inline-start`, `margin-inline`) is tracked
in ROADMAP.md. Do not claim RTL support until that lands and a mirrored screen
has been reviewed.

**Reduced motion** is honoured globally at `tokens/base.css:10`: under
`prefers-reduced-motion: reduce` every animation and transition is collapsed to
0.01ms with `!important` and scroll-behavior goes auto, so entrances land
instantly rather than being skipped. It applies to `*`, so a component cannot opt
out of it by accident.
