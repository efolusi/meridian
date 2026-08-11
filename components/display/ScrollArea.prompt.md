# ScrollArea

Scrollable viewport with thin, themed scrollbars.

```jsx
<ScrollArea maxHeight={320}>
  <ActivityLog />
  <ScrollBar orientation="vertical" />
</ScrollArea>
```

Add a horizontal `ScrollBar` when wide content can overflow. The scrollbar component declares the intended orientation while the native viewport preserves platform scrolling and accessibility.
