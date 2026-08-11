# Dropdown Menu

Composable action menu for a button or other trigger. Supports items, checkbox and radio choices, labels, groups, separators, shortcuts, and nested submenus.

```jsx
<DropdownMenu>
  <DropdownMenuTrigger asChild><Button>Actions</Button></DropdownMenuTrigger>
  <DropdownMenuContent align="end">
    <DropdownMenuItem>Duplicate<DropdownMenuShortcut>⌘D</DropdownMenuShortcut></DropdownMenuItem>
    <DropdownMenuSeparator />
    <DropdownMenuItem variant="destructive">Delete</DropdownMenuItem>
  </DropdownMenuContent>
</DropdownMenu>
```
