Anchored floating panel for filters, pickers, help. Closes on outside click / ESC.

```jsx
<Popover>
  <PopoverTrigger asChild><Button variant="secondary">Filter</Button></PopoverTrigger>
  <PopoverContent align="start">
    <PopoverHeader>
      <PopoverTitle>Filter runs</PopoverTitle>
      <PopoverDescription>Choose the states to show.</PopoverDescription>
    </PopoverHeader>
    …controls…
  </PopoverContent>
</Popover>
```

Control state with `open`/`onOpenChange` when needed; set panel width on `PopoverContent`.
