Sticky glass bar, floating as a pill by default (`floating={false}` for a full-width bar): optional leading slot, display-font title, right-aligned actions. Content scrolls under it, so it is the chrome glass of design-tokens `docs/glass.md`.

```jsx
<TopNav title="Customers">
  <Input size="sm" placeholder="Search… ⌘K" iconLeft="search" style={{ width: 300 }} />
  <IconButton icon="bell" label="Notifications" />
  <Avatar><AvatarFallback>AO</AvatarFallback></Avatar>
</TopNav>
```
