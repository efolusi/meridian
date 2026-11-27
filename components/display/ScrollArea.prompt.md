# ScrollArea

Scrollable viewport with thin, themed scrollbars.

```jsx
<ScrollArea maxHeight={320}>
  <ActivityLog />
  <ScrollBar orientation="vertical" />
</ScrollArea>
```

Add a horizontal `ScrollBar` when wide content can overflow. The scrollbar component declares the intended orientation while the native viewport preserves platform scrolling and accessibility.

The viewport is a keyboard-focusable part so it can be scrolled with the arrow keys. Unnamed it is a `group` called `Scroll area` (set the words with `label`), which is no landmark, so several areas on a page stay quiet. Give it `aria-label` or `aria-labelledby` to make it a `region`; both name the viewport, not the wrapper, `aria-labelledby` wins, and `aria-label` replaces the whole name.
