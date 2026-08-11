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

The `label` shorthand and deprecated `position` alias remain available for existing products.
