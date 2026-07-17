4px ink progress bar for usage meters and multi-step flows.

```jsx
<Progress label="Seats used" value={4} max={5} showValue format={(v, m) => v + ' of ' + m} />
<Progress value={92} tone="danger" label="API quota" showValue />
```
