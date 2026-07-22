Collapsible tree for file/nav hierarchies. Rows take icons + mono counts; branches toggle on click.

```jsx
<TreeList value={sel} onChange={setSel} nodes={[
  { id: 'src', label: 'src', icon: 'folder', children: [
    { id: 'app', label: 'app.ts', icon: 'code' },
  ]},
]} />
```

Vocabulary: state-carrying selection fires `onChange`; command menus fire `onSelect`; placement is `side` (top/bottom/left/right). `onSelect` here is a deprecated alias for `onChange` (one major); `onChange` wins when both are passed.
