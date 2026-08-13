# Accessibility

Efolusi ships WCAG 2.1 AA. The rules, per concern:

## Focus
- Every focusable element shows the two-layer opaque ring (`--focus-ring`: a 2px `--focus-ring-offset` surface layer under a 2px `--focus-ring-color` band, brand-700 in light and brand-400 in dark) via `:focus-visible`. Never remove it; never replace it with color alone. Plain links get the ring from `tokens/base.css`.
- Focus order follows DOM order. Dialogs and Drawers trap focus while open and return it to the trigger on close.

## Keyboard map
- `Tab` / `Shift+Tab` — move between controls
- `Enter` / `Space` — activate buttons, toggle checkboxes/switches
- `Esc` — closes Dialog, Drawer, Menu, Popover, and CommandDialog (all built in)
- `↑ ↓` — navigate Menu and Command items; `Enter` selects
- `← →` — Tabs and SegmentedControl options; Slider value (native)
- `⌘K` — a common trigger for CommandDialog (document the hint with `Kbd`)

## Contrast (light and dark)
- Body text ≥ 4.5:1: `--text-primary`, `--text-secondary`, and `--text-muted` all pass on page, card, and sunken surfaces in both themes; status `*-600` foregrounds pass on their `*-100` tints and on white.
- Hairline borders (`--border-default`, `--border-strong`) are decorative structure and are exempt from contrast minimums. Any border that conveys state on its own (an error outline, a selected row) must use a ≥3:1 color such as `--danger-600` or `--accent`; the hairline tokens do not qualify.
- Status is never color-only: Badge pairs color with text, Alert with an icon, Progress with a value. StatusDot always carries its state as text — visually hidden ahead of the label when one is present ("Error: API"), or as the accessible name of the dot itself when there is none; override the wording with `stateLabel`.

## Semantics baked into components
- Icon: `aria-hidden` unless `title` given (then `role="img"`)
- IconButton: `label` prop is required → `aria-label` + `title`
- Dialog/Drawer: `role="dialog" aria-modal="true"`; Alert: `role="status"`; Toast uses one polite live region on `Toaster`.
- Tabs: `role="tablist"/"tab"` + `aria-selected`; Switch: `role="switch"`
- Table: real `<table>` semantics; Pagination: `aria-current="page"`
- Skeleton is decorative — pair with visually-hidden "Loading…" when it replaces content

## Motion
- Durations cap at 240ms and convey state only. If you add larger motion, gate it behind `prefers-reduced-motion`.
- `tokens/base.css` ships a global `prefers-reduced-motion: reduce` guard that collapses all animation and transition durations, including component-injected CSS.

## Component keyboard contracts (verified in-browser)
- Dialog, Drawer, ConfirmDialog: focus moves in on open, Tab and Shift+Tab wrap inside, Escape closes, focus returns to the invoker; panels carry `aria-labelledby`/`aria-describedby`.
- Menu, Popover: triggers are keyboard-operable with `aria-haspopup`/`aria-expanded`; Menu opens focused with `↑ ↓ Home End` navigation, Escape restores the trigger.
- Command: `role="combobox"` input with `aria-controls` and `aria-activedescendant` over a `listbox` of options; arrows scroll the active option into view. CommandDialog adds modal focus trapping, Escape dismissal, and focus restoration.
- Calendar: `role="grid"` with labelled columnheaders, per-day full-date labels, `aria-selected`/`aria-current`, and `← → ↑ ↓ Home End PageUp PageDown` navigation. When composed inside Popover as a date picker, opening moves focus into the grid and closing restores the trigger.
- Tabs: roving tabindex, `← → Home End` move focus and selection together.
- Tooltip links to its trigger via `aria-describedby` and dismisses on Escape; HoverCard is a non-modal panel (no dialog role) and dismisses on Escape.
- **NumberInput** — native-adjacent spinbutton: a text input with `inputmode="decimal"` (no `role="spinbutton"`) plus two stepper buttons labelled "Increase" / "Decrease". **ArrowUp/ArrowDown** step by `step`, **Shift+Arrow** by 10× `step`, **Home/End** jump to `min`/`max` when finite. Blur commits: parse → clamp to the rails → snap to the step grid; an emptied field commits `null`. Steppers sit outside the tab order (`tabindex="-1"`, arrows are the keyboard path) and disable at the rails.
- **Calendar (range mode)** — identical `role="grid"` keyboard contract as single mode (arrows move a day/week, Home/End week edges, PageUp/PageDown months); both range ends carry `aria-selected="true"`, in-between days `aria-selected="false"` with a visual band only.
- **Calendar (range picker composition)** — pair `mode="range"` with Popover and a labelled trigger. Opening moves focus into the grid on the open end of the range; the pick that completes the range may close the popover and restore the trigger; Escape closes without selecting.
- **TimePicker** — APG combobox-with-listbox: input is `role="combobox"` with `aria-expanded`, `aria-controls`, `aria-autocomplete="list"`, and `aria-activedescendant` tracking the highlighted `role="option"`; ArrowDown/ArrowUp move the highlight (ArrowDown opens when closed), Enter picks the highlighted slot, Escape closes and reverts typing; a typed valid time commits on blur.

Full keyboard coverage across overlays: DropdownMenu, ContextMenu, and Menubar support arrow-key navigation, Home/End, and single-character typeahead; Menubar adds Left/Right between menus and Down to open.

## Browser support and RTL

**Supported:** the last two versions of Chrome, Edge, Safari and Firefox. The
system uses `color-mix()`, `:focus-visible`, CSS custom properties and
`position: fixed` overlays; all are available across that range. The zero-build
CDN path additionally depends on React 18 UMD builds — React 19 dropped UMD, so
that path is pinned to 18 while the npm build tracks `react >= 18`.

**RTL layout is implemented, but the cross-browser support claim remains
provisional in 1.x.** Set `dir="rtl"` on the document and wrap the app in
`<DirectionProvider direction="rtl">`. Tabs, Menubar, Calendar,
Resizable, PromptSteps and Carousel mirror their horizontal behavior. Semantic
component spacing, alignment, borders and insets use logical properties; a
static gate admits physical coordinates only for reviewed geometry such as
viewport-positioned overlays, chart points and explicitly left/right drawers.
The browser smoke renders all 128 demos in both directions, and representative
forms, navigation, display and overlay screens have been visually reviewed in
light and dark themes. Do not call RTL fully supported across the browser matrix
until the last-two-version Safari, Firefox and Edge pass in ROADMAP.md is done.

**Reduced motion** is honoured globally at `tokens/base.css:10`: under
`prefers-reduced-motion: reduce` every animation and transition is collapsed to
0.01ms with `!important` and scroll-behavior goes auto, so entrances land
instantly rather than being skipped. It applies to `*`, so a component cannot opt
out of it by accident.
