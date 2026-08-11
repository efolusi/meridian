# Context Menu

Composable right-click menu with items, checkbox and radio choices, groups, labels, shortcuts, separators, and nested submenus.

```jsx
<ContextMenu>
  <ContextMenuTrigger asChild><FileTile /></ContextMenuTrigger>
  <ContextMenuContent>
    <ContextMenuItem>Rename<ContextMenuShortcut>F2</ContextMenuShortcut></ContextMenuItem>
    <ContextMenuSeparator />
    <ContextMenuItem variant="destructive">Delete</ContextMenuItem>
  </ContextMenuContent>
</ContextMenu>
```

Every action must also exist somewhere visible. Right-click is a shortcut, never the only path.
