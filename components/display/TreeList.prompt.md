Collapsible tree for file/nav hierarchies. Rows take icons + mono counts; branches toggle on click.

```jsx
<TreeList value={sel} onSelect={setSel} nodes={[
  { id: 'src', label: 'src', icon: 'folder', children: [
    { id: 'app', label: 'app.ts', icon: 'code' },
  ]},
]} />
```
