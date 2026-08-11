# Menubar

A composable application menu bar with roving top-level focus, arrow-key menu switching, typeahead, checkbox/radio items, nested submenus, and portal positioning.

```jsx
<Menubar>
  <MenubarMenu>
    <MenubarTrigger>File</MenubarTrigger>
    <MenubarContent>
      <MenubarItem>New document <MenubarShortcut>⌘N</MenubarShortcut></MenubarItem>
      <MenubarSeparator />
      <MenubarItem variant="destructive">Delete draft</MenubarItem>
    </MenubarContent>
  </MenubarMenu>
</Menubar>
```

Use `MenubarCheckboxItem` for independent view settings, `MenubarRadioGroup` with `MenubarRadioItem` for a single choice, and `MenubarSub` for nested commands. Use a single dropdown when the commands do not form an application-level menu bar.
