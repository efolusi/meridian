The product sidebar: brand row, grouped nav with icons/badges, pinned footer. 240px on `--surface-subtle`.

```jsx
<SideNav logoSrc="assets/logo.png" brandBadge="Console" value={nav} onChange={setNav}
  groups={[
    { items: [{ id: 'overview', label: 'Overview', icon: 'layout-dashboard' }, { id: 'customers', label: 'Customers', icon: 'users', badge: 128 }] },
{ label: 'Products', items: [{ id: 'agent', label: 'AI agents', icon: 'bot' }] },
  ]}
  footer={<Item size="sm"><ItemMedia><Avatar><AvatarFallback>AO</AvatarFallback></Avatar></ItemMedia><ItemContent><ItemTitle>Ada Obi</ItemTitle><ItemDescription>Acme Workspace</ItemDescription></ItemContent></Item>} />
```
