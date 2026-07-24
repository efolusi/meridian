Full-width strip above the app chrome — trials, incidents, announcements. One per view, max.

```jsx
<Banner tone="warning" icon="triangle-alert" action="Add card" onAction={billing} onDismiss={hide}>
  <strong>Trial ends in 3 days.</strong> Your workspace pauses after that.
</Banner>
```

`action` takes a node (rendered as-is); a string label with `onAction` is the legacy form.
