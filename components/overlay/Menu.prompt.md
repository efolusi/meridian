Dropdown action menu on any trigger. Items take icons, shortcut hints, separators, and a danger style.

```jsx
<Menu align="right" onSelect={handle} trigger={<IconButton icon="ellipsis" label="More" />}
  items={[
    { id: 'edit', label: 'Edit', icon: 'pencil' },
    { id: 'copy', label: 'Duplicate', icon: 'copy', kbd: '⌘D' },
    'separator',
    { id: 'delete', label: 'Delete', icon: 'trash-2', danger: true },
  ]} />
```
