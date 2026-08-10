# Meridian compared with shadcn/ui

Snapshot: 2026-08-11. This is an engineering comparison, not a claim that the
two systems should expose identical APIs. shadcn/ui is the reference because it
combines open component source, a registry protocol, a CLI and a large public
ecosystem. Meridian keeps its own visual language and browser-native path.

Primary references:

- [shadcn/ui introduction](https://ui.shadcn.com/docs)
- [official component catalogue](https://ui.shadcn.com/docs/components)
- [React Aria base announcement](https://ui.shadcn.com/docs/changelog)
- [registry overview](https://ui.shadcn.com/docs/registry/getting-started)
- [GitHub registries](https://ui.shadcn.com/docs/registry/github)
- [CLI](https://ui.shadcn.com/docs/cli)
- [blocks](https://ui.shadcn.com/blocks)
- [registry directory](https://ui.shadcn.com/docs/directory)

## Conclusions

1. Meridian has functional coverage for every item in the current 64-item
   shadcn catalogue. Fifty-eight are direct or singular equivalents and six are
   documented compositions. `Data Table` is intentionally a
   pattern around `Table`, matching shadcn's own guide-not-universal-component
   position.
2. Meridian is broader in AI, code, dates, finance and zero-build delivery.
   shadcn remains broader in community registries, framework starters, block
   variants and CLI configuration workflows.
3. The component-level RTL gap is closed: `DirectionProvider`, mirrored
   horizontal behavior, logical CSS, a physical-coordinate exception gate and
   bidirectional 128-demo browser smoke are in place. The broader support claim
   remains provisional until the cross-browser matrix is exercised.
4. Distribution parity improved materially: root `registry.json` now supports
   `npx shadcn@latest view/add efolusi/meridian/<item>`, while the byte-identical
   hosted registry remains available under `site/registry.json`.

## Component catalogue mapping

Status meanings:

- **Direct** — same component and responsibility.
- **Renamed** — singular equivalent under Meridian terminology.
- **Composition** — capability exists through two or more Meridian pieces or a
  documented pattern; adding a duplicate wrapper would make the system worse.

| shadcn/ui | Meridian | Status | Notes |
| --- | --- | --- | --- |
| Accordion | Accordion | Direct | Disclosure list with keyboard semantics. |
| Alert | Alert | Direct | Status message with tone and icon. |
| Alert Dialog | ConfirmDialog | Renamed | Modal confirmation contract. |
| Aspect Ratio | AspectRatio | Direct | Fixed-ratio media container. |
| Attachment | FileTile + Progress + GeneratedImage | Composition | File metadata, actions, upload/error state and image output are already separate primitives. |
| Avatar | Avatar, AvatarGroup | Direct | Meridian also includes grouped avatars. |
| Badge | Badge | Direct | Tone and optional status dot. |
| Breadcrumb | Breadcrumbs | Renamed | Same navigation landmark responsibility. |
| Bubble | ChatMessage body + SelectionQuote | Composition | Conversational surface and quoted-reply action stay composable. |
| Button | Button, IconButton | Direct | Meridian separates labelled and icon-only actions. |
| Button Group | ButtonGroup | Direct | Grouped action controls. |
| Calendar | Calendar | Direct | Single/range selection and grid keyboard model. |
| Card | Card | Direct | Header, body, actions and footer slots. |
| Carousel | Carousel | Direct | Manual scroll-snap strip. |
| Chart | BarChart, LineChart, DonutChart, Sparkline | Composition | Purpose-built charts avoid one overloaded chart API. |
| Checkbox | Checkbox | Direct | Native checkbox semantics. |
| Collapsible | Collapsible | Direct | Expand/collapse region. |
| Combobox | Combobox | Direct | APG combobox/listbox behavior. |
| Command | CommandPalette | Renamed | Searchable command surface with active descendant. |
| Context Menu | ContextMenu | Direct | Pointer and keyboard context menu. |
| Data Table | Table + Pagination + Input | Composition | Sorting, selection, loading, empty and sticky states are built into Table; filtering and paging compose around it. |
| Date Picker | DatePicker, DateRangePicker | Direct | Meridian includes both single and range pickers. |
| Dialog | Dialog | Direct | Focus trap, Escape and focus restoration. |
| Direction | DirectionProvider, useDirection | Direct | Keyboard, pointer and layout mirroring are implemented and gated. |
| Drawer | Drawer | Direct | Side panel with modal semantics. |
| Dropdown Menu | Menu | Renamed | Triggered menu with typeahead and keyboard navigation. |
| Empty | EmptyState | Renamed | Empty-result or first-use surface. |
| Field | FormField | Renamed | Label, hint, error and control wiring. |
| Hover Card | HoverCard | Direct | Non-modal contextual panel. |
| Input | Input | Direct | Labelled input and validation states. |
| Input Group | InputGroup | Direct | Prefix/suffix/add-on composition. |
| Input OTP | DigitEntry | Renamed | Multi-cell one-time-code input. |
| Item | ListItem | Renamed | Structured row with leading/trailing content. |
| Kbd | Kbd | Direct | Keyboard hint. |
| Label | Label | Direct | Standalone form label. |
| Marker | Banner + Divider + StatusDot | Composition | System notes, labelled separators and inline statuses remain distinct primitives. |
| Menubar | Menubar | Direct | Horizontal application menu. |
| Message | ChatMessage | Renamed | Avatar, alignment, metadata, body and actions. |
| Message Scroller | Conversation | Renamed | Auto-stick, scroll preservation and jump-to-latest. |
| Native Select | Select | Renamed | Meridian Select is the native-select path; Combobox is the richer searchable path. |
| Navigation Menu | TopNav | Renamed | Primary application navigation. |
| Pagination | Pagination, PageControl | Direct | Page-number and compact previous/next variants. |
| Popover | Popover | Direct | Anchored non-modal content. |
| Progress | Progress | Direct | Determinate progress. |
| Radio Group | Radio | Renamed | Native radio-group behavior. |
| Resizable | Resizable | Direct | Pointer and keyboard split panes. |
| Scroll Area | ScrollArea | Direct | Bounded overflow region. |
| Select | Combobox | Renamed | Rich searchable selection; native selection stays in Select. |
| Separator | Divider | Renamed | Horizontal/labelled separation. |
| Sheet | Drawer | Renamed | Same side-panel pattern; no duplicate alias needed. |
| Sidebar | SideNav | Renamed | Application side navigation. |
| Skeleton | Skeleton | Direct | Loading placeholder. |
| Slider | Slider | Direct | Native range control. |
| Sonner | Toast, Toaster | Renamed | Meridian's queue and viewport own the same application-toast responsibility. |
| Spinner | Spinner, Loader | Direct | Inline and labelled loading indicators. |
| Switch | Switch | Direct | Binary switch semantics. |
| Table | Table | Direct | Semantic table foundation. |
| Tabs | Tabs | Direct | Roving tab stop and selection. |
| Textarea | Textarea | Direct | Multiline form control. |
| Toast | Toast, Toaster | Direct | Queue, viewport stack and actions. |
| Toggle | Toggle | Direct | Pressed-state button. |
| Toggle Group | ToggleGroup | Direct | Single/multiple grouped toggles. |
| Tooltip | Tooltip | Direct | Focus-immediate and hover-delayed description. |
| Typography | tokens/typography.css + STYLEGUIDE.md | Composition | Typography is a system contract rather than a React wrapper. |

## System and ecosystem comparison

| Concern | shadcn/ui | Meridian | Assessment |
| --- | --- | --- | --- |
| Source ownership | Components are copied into the application. | Components are vendorable flat source with types and prompts. | Equivalent principle. |
| Registry | General registry schema with components, pages, hooks, config and rules. | Root GitHub registry plus byte-identical hosted registry; components, blocks and starters are installable. | Core path closed; shadcn schema breadth remains larger. |
| CLI | Mature init/add/view/search/config workflows. | Uses the official shadcn CLI for registry items; no separate Meridian CLI. | Intentional reuse; avoid maintaining a redundant CLI. |
| Zero-build use | Not a primary distribution mode. | React 18 UMD bundle + CSS remains first-class. | Meridian advantage. |
| npm | Registry dependencies are installed into an app. | `@efolusi/meridian`, tokens and icons packages ship in lockstep. | Different but complete paths. |
| Framework reach | Official setup guides and starters across several React frameworks. | React source works broadly; guides exist, maintained example repositories do not. | Open gap. |
| Primitive bases | Radix, Base UI and React Aria variants behind a shared shadcn API. | Browser-native React components with no interchangeable primitive layer. | Intentional architecture difference; Meridian favors one inspectable implementation. |
| Blocks | Large catalogue with many variants per use case. | Nine curated blocks and nine professional starter journeys. | Open breadth gap; add only evidence-backed use cases. |
| Ecosystem | Public directory contains many third-party registries. | First-party registry and MCP/agent surfaces; no community directory. | Open ecosystem gap, not a component defect. |
| AI surfaces | New conversational primitives in the core catalogue. | Dedicated AI group covers messages, conversation scrolling, prompts, tools, reasoning, citations and agent runs. | Meridian is broader. |
| RTL | Direction provider plus RTL examples across component docs. | Direction provider, logical CSS gate, mirrored behavior tests and LTR/RTL full-demo smoke. | Component-level parity; cross-browser matrix remains. |

## Prioritized work

### Closed in this comparison

- Root GitHub registry and current shadcn CLI validation.
- Public inventory facts derived and gated against source inventories.
- DirectionProvider plus RTL keyboard/pointer behavior for Tabs, Menubar,
  DigitEntry, Calendar and Resizable.
- Semantic logical-CSS migration, documented physical-coordinate exceptions,
  representative mirrored visual review and a 128-demo RTL browser smoke pass.
- Two completed one-time codemods removed after a zero-change dry run and
  repository-wide reference check.

### Still open

1. **Cross-browser RTL proof:** exercise the last two Safari, Firefox and Edge
   releases before promoting the provisional browser-matrix claim.
2. **Framework proof:** maintained minimal example repositories for the
   frameworks already covered by `guidelines/frameworks.md`.
3. **Block breadth:** add variants only from recurring product needs; do not
   copy shadcn's volume as a vanity metric.
4. **Community distribution:** decide whether a public third-party registry
   directory is worth its moderation and compatibility cost.

## Dead-code decisions

Deleted:

- `scripts/codemod_forward_ref.mjs`
- `scripts/codemod_rest_spread.mjs`

Both scripts referenced only themselves and reported zero changes against all
component sources. Their migration results remain covered by component, bundle,
type and smoke gates.

Retained because they are public or build contracts, not dead code:

- `hello.html`, `thumbnail.html` and root `.thumbnail`
- generated bundle, manifest and registry artifacts
- ignored local files such as `.claude/launch.json` and uploaded assets
