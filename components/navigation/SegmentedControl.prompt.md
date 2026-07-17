Inline 2–5-way toggle on a sand track; active segment is a white hairline chip. For views/ranges — use Tabs for page sections.

```jsx
<SegmentedControl options={['7d', '30d', '90d']} value={range} onChange={setRange} />
<SegmentedControl options={[{ id: 'list', label: 'List', icon: 'menu' }, { id: 'board', label: 'Board', icon: 'layout-dashboard' }]} value={view} onChange={setView} />
```
