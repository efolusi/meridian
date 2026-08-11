# Sidebar

Composable application shell navigation with controlled or uncontrolled desktop and mobile state.

```jsx
<SidebarProvider>
  <Sidebar collapsible="icon">
    <SidebarHeader>Workspace</SidebarHeader>
    <SidebarContent>
      <SidebarGroup>
        <SidebarGroupLabel>Operations</SidebarGroupLabel>
        <SidebarGroupContent>
          <SidebarMenu>
            <SidebarMenuItem><SidebarMenuButton href="/runs" isActive>Runs</SidebarMenuButton></SidebarMenuItem>
          </SidebarMenu>
        </SidebarGroupContent>
      </SidebarGroup>
    </SidebarContent>
    <SidebarRail />
  </Sidebar>
  <SidebarInset><SidebarTrigger />…</SidebarInset>
</SidebarProvider>
```

- Use `offcanvas`, `icon`, or `none` for `collapsible`.
- `side="right"` and `dir="rtl"` use logical positioning.
- `Ctrl+B`/`Cmd+B` toggles the active desktop or mobile sidebar.
- `useSidebar()` exposes `state`, desktop/mobile open state, setters, breakpoint state, and `toggleSidebar`.
