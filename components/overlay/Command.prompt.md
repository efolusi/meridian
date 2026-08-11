# Command

Composable command menu for search and quick actions. Command handles filtering, active selection, and Arrow/Home/End/Enter keyboard navigation; CommandDialog composes it with the stable Dialog API.

```jsx
<Command>
  <CommandInput placeholder="Type a command or search…" />
  <CommandList>
    <CommandEmpty>No results found.</CommandEmpty>
    <CommandGroup heading="Suggestions">
      <CommandItem value="calendar">Calendar</CommandItem>
      <CommandItem value="settings">Settings<CommandShortcut>⌘S</CommandShortcut></CommandItem>
    </CommandGroup>
  </CommandList>
</Command>
```

Use `CommandDialog open={open} onOpenChange={setOpen}` for the modal palette. `value`/`onValueChange`, `shouldFilter`, `filter`, `loop`, item `keywords`, and disabled items follow the stable command contract.
