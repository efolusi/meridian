Compact status or category label.

```jsx
<Badge>Default</Badge>
<Badge variant="secondary">Secondary</Badge>
<Badge variant="destructive">Destructive</Badge>
<Badge variant="outline">Outline</Badge>
<Badge variant="ghost">Ghost</Badge>
<Badge asChild variant="link"><a href="/updates">Updates</a></Badge>
<Badge className="ef-badge--success"><Icon name="circle-check" size={12} data-icon="inline-start" />Verified</Badge>
```

`badgeVariants` returns the root class names for semantic custom elements.
Compose icons as children with `data-icon="inline-start"` or
`data-icon="inline-end"`. Custom color classes can be supplied through
`className` without expanding the variant contract.
