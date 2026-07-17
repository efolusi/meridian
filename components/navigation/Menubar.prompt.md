# Menubar

Desktop-app style menu bar (File / Edit / View). Click opens; hovering across bar switches menus while open. Items share the Menu item shape (icon, kbd, danger, separator).

`<Menubar menus={[{label:"File",items:[{id:"new",label:"New task",kbd:"⌘N"}]}]} onSelect={run} />`

For a single dropdown use Menu; for page navigation use TopNav/Tabs.