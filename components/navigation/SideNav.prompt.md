The product sidebar: brand row, grouped nav with icons/badges, pinned footer. 240px on `--surface-subtle`.

```jsx
<SideNav logoSrc="assets/logo.png" brandBadge="Console" value={nav} onChange={setNav}
  groups={[
    { items: [{ id: 'overview', label: 'Overview', icon: 'layout-dashboard' }, { id: 'customers', label: 'Customers', icon: 'users', badge: 128 }] },
    { label: 'Products', items: [{ id: 'agent', label: 'Agent', icon: 'bot' }] },
  ]}
  footer={<ListItem media={<Avatar name="Ada Obi" size={30} />} title="Ada Obi" description="Acme Workspace" />} />
```
