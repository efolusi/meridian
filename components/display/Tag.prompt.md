Chip for filters and labels; removable via `onRemove`, clickable via `onClick`.

```jsx
<Tag icon="funnel" onRemove={remove}>Billing</Tag>
<Tag icon="plus" onClick={add}>Add filter</Tag>
```

Under `data-shape="pill"` on an ancestor the Tag is a full pill (`--press-radius`); see `guidelines/theming.md`, section Shape.
