# Item

A compositional content row for lists and card-like collections. Use Field for form controls; use Item for media, title, description, and actions. Group related rows with ItemGroup and ItemSeparator.

```jsx
<Item variant="outline">
  <ItemMedia variant="icon"><Icon name="shield-alert" /></ItemMedia>
  <ItemContent>
    <ItemTitle>Security alert</ItemTitle>
    <ItemDescription>New login detected from an unknown device.</ItemDescription>
  </ItemContent>
  <ItemActions><Button variant="outline">Review</Button></ItemActions>
</Item>
```

`Item` supports `variant="default|outline|muted"`, `size="default|sm|xs"`, `asChild`, and the cross-primitive `render` prop. `ItemHeader` and `ItemFooter` span the full row.
