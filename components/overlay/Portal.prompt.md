Escape hatch for floating content: renders children into `document.body` so no ancestor's `overflow` can clip them. Menu, Popover, Tooltip, HoverCard, ContextMenu, Combobox and DatePicker all sit on it.

Reach for it when you build your own floating surface. If you are placing that surface against a trigger, position it in viewport coordinates rather than `position:absolute`, or it will drift when an ancestor scrolls.

```jsx
<Portal>
  <div style={{ position: 'fixed', top: 120, left: 80, zIndex: 'var(--z-popover)' }}>
    Floating, and never clipped.
  </div>
</Portal>
```
