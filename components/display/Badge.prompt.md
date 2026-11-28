Compact status or category label.

```jsx
<Badge>Default</Badge>
<Badge variant="secondary">Secondary</Badge>
<Badge variant="danger">Danger</Badge>
<Badge variant="outline">Outline</Badge>
<Badge variant="ghost">Ghost</Badge>
<Badge variant="solid">Solid</Badge>
<Badge variant="success"><Icon name="circle-check" size={12} data-icon="inline-start" />Verified</Badge>
<Badge variant="brand">Efolusi</Badge>
<Badge asChild variant="link"><a href="/updates">Updates</a></Badge>
```

`default` is neutral: a sunken surface with a strong border and ink text, so a
normal status reads quieter than the primary button. Use `solid` for the filled
accent badge (the copper fill of the primary button, with its 1px accent edge) when one badge in a view
must stand out; keep it to one per view. A status that is good news (Verified,
Live) takes `variant="success"`; a label that belongs to the brand takes
`variant="brand"`. Both hold 4.5:1 for their text in light, dark and both
increased-contrast tables. Do not write `ef-badge--success` or `ef-badge--brand`
on a default Badge by hand. A status with no variant (Degraded) takes the
`ef-badge--warning` class.

`badgeVariants` returns the root class names for semantic custom elements.
Compose icons as children with `data-icon="inline-start"` or
`data-icon="inline-end"`. Custom color classes can be supplied through
`className` without expanding the variant contract.
