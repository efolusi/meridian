# ScrollArea

Scrollable viewport with thin, themed scrollbars.

```jsx
<ScrollArea maxHeight={320}>
  <ActivityLog />
  <ScrollBar orientation="vertical" />
</ScrollArea>
```

Add a horizontal `ScrollBar` when wide content can overflow. The scrollbar component declares the intended orientation while the native viewport preserves platform scrolling and accessibility.

The viewport is a keyboard-focusable `region` so it can be scrolled with the arrow keys. Name it with `aria-label` or `aria-labelledby` (both name the viewport, not the wrapper); without either it is named `Scroll area`. Give each `ScrollArea` on one page its own name.
