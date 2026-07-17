Grouped icon actions on a hairline chip — editors, chart controls, bulk bars. `value` marks active (ink).

```jsx
<Toolbar label="View" value={view} onChange={setView} items={[
  { id: 'list', icon: 'menu', tip: 'List' },
  { id: 'board', icon: 'layout-dashboard', tip: 'Board' },
  'separator',
  { id: 'export', icon: 'download', tip: 'Export' },
]} />
```
