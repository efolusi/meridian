# Marker

Use `Marker` for compact status notes, system events, bordered rows, and labeled
dividers inside a timeline or conversation. Compose visible text with
`MarkerContent`; place decorative graphics inside `MarkerIcon`.

## API

- `variant`: `default`, `border`, or `separator`.
- `render`: an element or render function when the marker must be a real link or
  button.
- `MarkerIcon`: always decorative and hidden from assistive technology.
- `markerVariants`: returns the root class names for custom compositions.

The root is presentational by default. Add `role="status"` only when dynamic
updates should be announced. Do not add `role="separator"` to a labeled divider;
its visible text should remain ordinary content.
