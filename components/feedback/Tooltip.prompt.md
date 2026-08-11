Hover/focus tooltip with collision-aware placement. Prefer the compositional API.

```jsx
<TooltipProvider delayDuration={200}>
  <Tooltip>
    <TooltipTrigger asChild><IconButton icon="copy" label="Copy" /></TooltipTrigger>
    <TooltipContent>Copy to clipboard</TooltipContent>
  </Tooltip>
</TooltipProvider>
```

`side`: `top` (default), `bottom`, `left`, or `right`; flips when there is no room. Keep labels short; no interactive content inside.

Use `side` to place composed tooltip content on the top, bottom, left, or right.
