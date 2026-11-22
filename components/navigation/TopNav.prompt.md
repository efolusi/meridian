Glass top bar: optional leading slot, display-font title, right-aligned actions. By default it is a full-width bar where the page puts it. The recommended look is `floating sticky`: a pill that stays at the top while content scrolls under it (then it blurs, and the page keeps `--ef-topnav-space` free at the top so focus is never hidden). Its banner landmark is named "Top bar" (`lang="id"`: "Bilah atas").

```jsx
<TopNav title="Customers">
  <Input size="sm" placeholder="Search… ⌘K" iconLeft="search" style={{ width: 300 }} />
  <IconButton icon="bell" label="Notifications" />
  <Avatar><AvatarFallback>AO</AvatarFallback></Avatar>
</TopNav>
```
