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
