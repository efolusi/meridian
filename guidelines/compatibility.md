# Migration compatibility

Meridian's components follow the public component-registry contract, so a team
moving from another registry-based component set can install Meridian items with
the same client and keep most of its composition. A matching concept is not
automatically a compatible API: a family counts as compatible only when its
source, types, interaction and registry install are all proven.

## Compatibility levels

| Level | Requirement |
| --- | --- |
| Concept | Meridian supports the same user need. |
| Source | A registry client installs every required source and style file. |
| API | Component names, props, defaults, events, refs, and composition contracts migrate without application rewrites. |
| Interaction | Keyboard, pointer, focus, dismissal, validation, and RTL behavior match the documented contract. |
| Visual | Meridian tokens apply without broken layout, clipping, or state loss. |
| Proven | Type fixtures, unit tests, full-demo smoke, and live-browser validation all pass. |

Only **Proven** families count as compatible.

## Where the status lives

[`compatibility/catalog.json`](../compatibility/catalog.json) is the source of
truth: one entry per component family with its status, the exports it must
provide, its source files, registry items and the tests that prove it. The
`scripts/check_compatibility.mjs` gate, part of `npm run check`, rejects missing
families, duplicate entries, unsupported statuses, missing exports and missing
proof files, so a claim cannot outlive its evidence.

The registry schema URL in the catalog and registry files is a machine protocol
identifier, not branding.

## Known gaps

- Cross-browser proof for Safari, Firefox and Edge is not complete
  ([#75](https://github.com/efolusi/meridian/issues/75)).
- Migration fixtures exercise representative contracts per family, not yet every
  public prop and state.
