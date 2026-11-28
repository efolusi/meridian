# Context Menu

Composable right-click menu with items, checkbox and radio choices, groups, labels, shortcuts, separators, and nested submenus.

```jsx
<ContextMenu>
  <ContextMenuTrigger asChild><FileTile /></ContextMenuTrigger>
  <ContextMenuContent>
    <ContextMenuItem>Rename<ContextMenuShortcut>F2</ContextMenuShortcut></ContextMenuItem>
    <ContextMenuSeparator />
    <ContextMenuItem variant="danger">Delete</ContextMenuItem>
  </ContextMenuContent>
</ContextMenu>
```

Every action must also exist somewhere visible. Right-click is a shortcut, never the only path.

A `ContextMenuCheckboxItem` or `ContextMenuRadioItem` draws its mark in the start gutter (`--space-8`), so the text never sits under it. The selected radio mark is filled, and a checked item (`aria-checked="true"`) is semibold: the highlighted item is a fill, a ring from the keyboard, and the checked one is told apart from it by weight as well as by the mark. The menu takes focus on its first item when it opens, from the pointer or the context-menu key (`ContextMenu`, `Shift+F10`); ArrowDown, ArrowUp, Home, End and Escape work from there, and Escape returns focus to the trigger.
