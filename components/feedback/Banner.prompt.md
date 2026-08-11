Full-width strip above the app chrome — trials, incidents, announcements. One per view, max.

```jsx
<Banner tone="warning" icon="triangle-alert" action={<button className="ef-banner__action" onClick={billing}>Add card</button>} onDismiss={hide}>
  <strong>Trial ends in 3 days.</strong> Your workspace pauses after that.
</Banner>
```

`action` takes a node and renders it as-is, so the caller owns its interaction.
