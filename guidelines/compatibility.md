# Meridian compatibility audit

Snapshot: 2026-08-11. This document tracks migration compatibility against the
public component-registry contract without importing another system's identity
into Meridian. A matching concept is not automatically a compatible API; every
claim needs source, type, interaction, registry, and browser proof.

## Current position

- Meridian publishes editable source through a root GitHub registry and a
  byte-identical hosted registry.
- The catalogue covers the common component responsibilities, but several are
  expressed under Meridian terminology or as compositions.
- Conceptual coverage is therefore not yet a 100% migration guarantee.
- The registry schema URL is a machine protocol identifier, not repository
  branding. It is the only allowed external product identifier in
  Meridian-authored content.

## Compatibility levels

| Level | Requirement |
| --- | --- |
| Concept | Meridian supports the same user need. |
| Source | A registry client installs every required source and style file. |
| API | Component names, props, defaults, events, refs, and composition contracts migrate without application rewrites. |
| Interaction | Keyboard, pointer, focus, dismissal, validation, and RTL behavior match the documented contract. |
| Visual | Meridian tokens apply without broken layout, clipping, or state loss. |
| Proven | Type fixtures, unit tests, full-demo smoke, and live-browser validation all pass. |

Only **Proven** items may count toward the migration percentage.

The machine-readable source of truth is `compatibility/catalog.json`. The
`scripts/check_compatibility.mjs` gate rejects missing families, duplicate
entries, unsupported statuses, missing exports, and missing proof files. This
keeps the percentage grounded in committed evidence rather than naming
similarity.

## Known gaps

1. Renamed equivalents still require an adapter or application rewrite.
2. Composed equivalents need canonical recipes and integration fixtures.
3. Registry installation is covered, but migration fixtures do not yet exercise
   the complete public API surface.
4. Cross-browser proof remains incomplete for Safari, Firefox, and Edge.
5. Blocks and starters need more realistic end-to-end product journeys, not
   isolated component collages.

## Proven adapters

- `Breadcrumb`, `BreadcrumbList`, `BreadcrumbItem`, `BreadcrumbLink`,
  `BreadcrumbPage`, `BreadcrumbSeparator`, and `BreadcrumbEllipsis` support
  semantic path composition, polymorphic links, current-page semantics,
  decorative default or custom separators, ellipsis output, native attributes,
  consumer classes and styles, ref forwarding, RTL, types, registry
  installation, demos, and tests. Meridian's array-based `Breadcrumbs`
  adapter remains available for existing surfaces.
- `Accordion`, `AccordionItem`, `AccordionTrigger`, and `AccordionContent`
  support single and multiple disclosure state, controlled and uncontrolled
  values, collapsible and disabled behavior, vertical and direction-aware
  horizontal keyboard navigation with configurable focus looping, polymorphic composition, force-mounted
  content, accessible trigger/content relationships, ref forwarding, state
  attributes, types, registry installation, demos, and tests. Meridian's
  data-array shorthand remains available for existing surfaces.
- `Alert`, `AlertTitle`, and `AlertDescription` support composable alert
  structure, default and destructive variants, alert semantics, native
  attributes, consumer classes and styles, ref forwarding, types, registry
  installation, demos, and tests. Meridian's semantic tones and content
  shorthands remain additive extensions.
- `Collapsible`, `CollapsibleTrigger`, and `CollapsibleContent` support
  controlled and uncontrolled disclosure state, native keyboard activation,
  disabled roots, polymorphic triggers, force-mounted content, accessible
  trigger/content relationships, ref forwarding, state attributes, types,
  registry installation, demos, and tests. Meridian's original `title`
  shorthand remains available for existing surfaces.
- `Checkbox` supports controlled and uncontrolled state, indeterminate state,
  pointer and keyboard interaction, accessible and invalid state data, disabled
  behavior, form submission, native button attributes, ref forwarding, types,
  registry installation, demos, and tests. Meridian's integrated label and
  description remain additive extensions.
- `Input` renders a native input and supports text, file, required, disabled,
  invalid, and native numeric-size attributes; native events; consumer classes
  and styles; ref forwarding; accessible labels and descriptions; types;
  registry installation; demos; and tests. Meridian's integrated field chrome,
  icons, password reveal, and visual sizes remain additive extensions.
- `Progress` supports determinate, complete, and indeterminate states; clamped
  values; accessible range semantics; native attributes; consumer classes and
  styles; ref forwarding; RTL-safe motion; types; registry installation; demos;
  and tests. Meridian's integrated label, formatted value, and semantic tones
  remain additive extensions.
- `Avatar`, `AvatarImage`, `AvatarFallback`, `AvatarBadge`, `AvatarGroup`, and
  `AvatarGroupCount` support compositional identity images, three named sizes,
  failed-image fallback, status indicators, overlapping groups, native
  attributes, ref forwarding, RTL, types, registry installation, demos, and
  tests. Meridian's `name`, `src`, and numeric-size shortcuts remain additive
  extensions.
- `Toggle` and `toggleVariants` support default and outline variants, the
  complete size contract, controlled and uncontrolled pressed state, composed
  click handlers, disabled behavior, native button props, ref forwarding,
  types, registry installation, demos, and tests. Meridian's icon, `md`, and
  legacy grouping helpers remain additive extensions.
- `Textarea` renders a native textarea, forwards native attributes, events,
  styles, classes, and refs, and includes types, registry installation, demos,
  and tests. Meridian's integrated label, hint, error, and invalid helpers
  remain additive and use explicit accessible relationships.
- `Kbd` and `KbdGroup` support key and shortcut-group composition, native
  attributes, consumer classes, ref forwarding, types, registry installation,
  demos, and tests.
- `Badge` and `badgeVariants` support the complete six-variant contract,
  semantic link composition through `asChild`, native attributes, consumer
  classes, ref forwarding, types, registry installation, demos, and tests.
  Meridian's tone, size, and status-dot helpers remain additive extensions.
- `Spinner` renders an accessible SVG status indicator, accepts native SVG
  props and accessible-name overrides, forwards refs, and includes types,
  registry installation, demos, and tests. Meridian's numeric size and label
  aliases remain additive extensions.
- `Skeleton` renders a native div, forwards refs and HTML attributes, and
  includes types, registry installation, demos, and tests. Meridian's shape,
  dimension, and multi-line helpers remain additive extensions.
- `Label` preserves native label attributes and click-to-focus association,
  forwards refs, supports consumer classes/styles, and includes types, registry
  installation, demos, and tests. Meridian's required marker and hint remain
  additive extensions.
- `AspectRatio` requires an explicit numeric ratio and supports landscape,
  square, and portrait media, native wrapper props, consumer styles, ref
  forwarding, types, registry installation, demos, and tests.
- `Button` and `buttonVariants` support the complete public variant and size
  matrices, documented defaults, semantic-link styling, native button props,
  events, disabled behavior, ref forwarding, types, registry installation,
  demos, and tests. Meridian's older aliases remain available for existing
  consumers.
- `Attachment` and its eight compositional parts support upload states, sizes,
  orientations, icon/image media, independent actions, polymorphic full-card
  triggers, scrollable groups, ref forwarding, types, registry installation,
  demos, and tests.
- `Separator` supports horizontal/vertical orientation, decorative or semantic
  output, ref forwarding, types, registry installation, demos, and tests.
- `NativeSelect`, `NativeSelectOption`, and `NativeSelectOptGroup` support native
  option composition, disabled/invalid browser behavior, ref forwarding, types,
  registry installation, demos, and tests.
- `Marker`, `MarkerIcon`, `MarkerContent`, and `markerVariants` support inline,
  bordered, and labeled-divider layouts; decorative icons; semantic custom
  roots; ref forwarding; types; registry installation; demos; and tests.

- `AlertDialog` and its trigger, content, header, media, title, description,
  footer, cancel, and action parts support controlled and uncontrolled state,
  semantic child composition, portal rendering, default and small sizes, focus
  trapping and restoration, deliberate dismissal, native props, refs, types,
  registry installation, demos, and tests.

- `Card`, `CardHeader`, `CardTitle`, `CardDescription`, `CardAction`,
  `CardContent`, and `CardFooter` support complete section composition, default
  and small sizes, a shared spacing variable, edge-to-edge media, RTL-safe
  layout, native props, refs, types, registry installation, demos, and tests.
  Meridian's shorthand header, body-padding, footer, elevation, and interactive
  props remain additive adapters.

- `ButtonGroup`, `ButtonGroupText`, `ButtonGroupSeparator`, and
  `buttonGroupVariants` support horizontal and vertical attached controls,
  semantic child composition, orientation-aware separators, native props,
  refs, types, registry installation, demos, and tests.

- `BubbleGroup`, `Bubble`, `BubbleContent`, and `BubbleReactions` support all
  seven visual variants, start/end alignment, semantic child composition,
  logical reaction placement, native props, refs, types, registry installation,
  demos, and tests.

- `DirectionProvider` and `useDirection` support the standard `dir` contract,
  the additive `direction` alias, nested context, document fallback, mirrored
  keyboard behavior, types, registry installation, demos, and tests.

- `Dialog` and its trigger, portal, overlay, close, content, header, footer,
  title, and description parts support controlled and uncontrolled state,
  semantic child composition, focus containment and restoration, native props,
  refs, types, registry installation, demos, and tests. Meridian's shorthand
  modal props remain an additive adapter.

- `Empty`, `EmptyHeader`, `EmptyMedia`, `EmptyTitle`, `EmptyDescription`, and
  `EmptyContent` support compositional empty states, native props, refs, types,
  registry installation, demos, and tests. `EmptyState` remains an additive
  convenience adapter.

- `InputGroup`, `InputGroupAddon`, `InputGroupButton`, `InputGroupInput`,
  `InputGroupTextarea`, and `InputGroupText` support inline and block addons,
  unified focus and invalid states, native props, refs, types, registry
  installation, demos, and tests. Meridian's label/prefix/suffix shorthand
  remains an additive adapter.

- `Table` and its header, body, footer, row, head, cell, and caption parts
  provide semantic table composition, scroll containment, native props, refs,
  types, registry installation, demos, and tests. Meridian's sortable,
  selectable data-array adapter remains available for existing products.

- `Tabs`, `TabsList`, `TabsTrigger`, and `TabsContent` support controlled and
  uncontrolled state, horizontal and vertical orientation, line styling,
  disabled triggers, direction-aware keyboard navigation, native props, refs,
  types, registry installation, demos, and tests. Meridian's item-array adapter
  remains available for existing products.

- `Switch` supports controlled and uncontrolled checked state, native form
  participation, keyboard and pointer interaction, state attributes, refs,
  types, registry installation, demos, and tests. Meridian's integrated label
  and size helpers remain additive extensions.

- `TooltipProvider`, `Tooltip`, `TooltipTrigger`, and `TooltipContent` support
  composed triggers, controlled and uncontrolled state, configurable delay,
  four-sided collision-aware placement, keyboard dismissal, linked accessible
  descriptions, refs, types, registry installation, demos, and tests.
  Meridian's `label`, `delay`, and `position` shorthand remains available.

- `Popover`, `PopoverTrigger`, `PopoverContent`, `PopoverHeader`,
  `PopoverTitle`, and `PopoverDescription` support controlled and uncontrolled
  state, semantic child composition, aligned portal placement, outside and
  keyboard dismissal, focus restoration, refs, types, registry installation,
  demos, and tests. Meridian's `trigger`, `width`, and left/right alignment
  shorthand remains available.

- `ToggleGroup` and `ToggleGroupItem` support single and multiple selection,
  controlled and uncontrolled values, inherited variant and size, configurable
  spacing, horizontal and vertical orientation, RTL-aware keyboard movement,
  disabled state, refs, types, registry installation, demos, and tests.
  Meridian's `onChange` callback and direct `Toggle` children remain adapters.


## Release gate

Before claiming complete compatibility:

1. Generate a current external API inventory in CI without committing its brand
   name or copy into the repository.
2. Map every public component, subcomponent, prop, variant, and state to a
   Meridian implementation or adapter.
3. Install every registry item into a clean fixture and compile it.
4. Run keyboard, focus, RTL, visual, and responsive checks in supported
   browsers.
5. Validate representative migrations for dashboard, settings, authentication,
   data-table, chart, form, and conversational-product journeys.
