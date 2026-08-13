Compose `Empty`, `EmptyHeader`, `EmptyMedia`, `EmptyTitle`, `EmptyDescription`, and `EmptyContent` for a centered empty view that leads with the action, not the absence.

```jsx
<Empty className="ef-empty--bordered">
  <EmptyHeader>
    <EmptyMedia variant="icon"><Icon name="folder" size={24} /></EmptyMedia>
    <EmptyTitle>Create your first project</EmptyTitle>
    <EmptyDescription>Projects group keys, environments, and usage.</EmptyDescription>
  </EmptyHeader>
  <EmptyContent><Button iconLeft="plus">New project</Button></EmptyContent>
</Empty>
```
