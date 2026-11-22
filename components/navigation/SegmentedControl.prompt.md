Inline toggle for 2 to 5 options on a clear-glass track; the active segment is thick glass. Use it for views and ranges, and Tabs for page sections.

```jsx
<SegmentedControl options={['7d', '30d', '90d']} value={range} onChange={setRange} />
<SegmentedControl options={[{ id: 'list', label: 'List', icon: 'menu' }, { id: 'board', label: 'Board', icon: 'layout-dashboard' }]} value={view} onChange={setView} />
```
