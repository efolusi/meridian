# Menubar

A composable application menu bar with roving top-level focus, arrow-key menu switching, typeahead, checkbox/radio items, nested submenus, and portal positioning.

```jsx
<Menubar>
  <MenubarMenu>
    <MenubarTrigger>File</MenubarTrigger>
    <MenubarContent>
      <MenubarItem>New document <MenubarShortcut>⌘N</MenubarShortcut></MenubarItem>
      <MenubarSeparator />
      <MenubarItem variant="danger">Delete draft</MenubarItem>
    </MenubarContent>
  </MenubarMenu>
</Menubar>
```

Use `MenubarCheckboxItem` for independent view settings, `MenubarRadioGroup` with `MenubarRadioItem` for a single choice, and `MenubarSub` for nested commands. Use a single dropdown when the commands do not form an application-level menu bar.

A menu opens from the trigger with ArrowDown or a click and takes focus on its first item; ArrowLeft and ArrowRight (mirrored in right-to-left) move to the neighbouring menu with focus on its first item, and Escape closes the menu and returns focus to its trigger. A checkbox or radio item draws its mark in the start gutter (`--space-8`), the selected radio mark is filled, and a checked item (`aria-checked="true"`) is semibold, so it is told apart from the highlighted one by more than the mark. The panel and its items are `DropdownMenu`'s, so these rules come from there.
