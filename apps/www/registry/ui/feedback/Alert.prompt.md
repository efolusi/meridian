Inline banner: white surface, hairline border, tone-colored icon. For page-level notices — use Toast for transient events.

```jsx
<Alert tone="warning" title="Trial ends in 3 days" description="Add a card to keep your workspace running." action={<Button size="sm" variant="secondary">Add card</Button>} />
```

Tones: `info | success | warning | danger` (danger also tints the border).
