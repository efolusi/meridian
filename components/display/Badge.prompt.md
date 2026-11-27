Compact status or category label.

```jsx
<Badge>Default</Badge>
<Badge variant="secondary">Secondary</Badge>
<Badge variant="danger">Danger</Badge>
<Badge variant="outline">Outline</Badge>
<Badge variant="ghost">Ghost</Badge>
<Badge variant="solid">Solid</Badge>
<Badge asChild variant="link"><a href="/updates">Updates</a></Badge>
<Badge className="ef-badge--success"><Icon name="circle-check" size={12} data-icon="inline-start" />Verified</Badge>
```

`default` is neutral: a sunken surface with a strong border and ink text, so a
normal status reads quieter than the primary button. Use `solid` for the filled
accent badge (the ember fill of the primary button) when one badge in a view
must stand out; keep it to one per view. A status that needs a colour (Verified,
Live, Degraded) takes the `ef-badge--success` or `ef-badge--warning` class, as
in the last example.

`badgeVariants` returns the root class names for semantic custom elements.
Compose icons as children with `data-icon="inline-start"` or
`data-icon="inline-end"`. Custom color classes can be supplied through
`className` without expanding the variant contract.
