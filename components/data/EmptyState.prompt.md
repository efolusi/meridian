Compose `Empty`, `EmptyHeader`, `EmptyMedia`, `EmptyTitle`, `EmptyDescription`, and `EmptyContent` for a centered empty view that leads with the action, not the absence. `EmptyState` remains as a convenience adapter.

```jsx
<EmptyState bordered icon="folder" title="Create your first project"
  description="Projects group keys, environments, and usage."
  action={<Button iconLeft="plus">New project</Button>} />
```
