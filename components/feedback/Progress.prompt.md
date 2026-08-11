Accessible progress bar for determinate, complete, and indeterminate tasks. Add a label externally with `aria-labelledby`, or use Meridian's integrated label helpers.

```jsx
<Progress label="Seats used" value={4} max={5} showValue format={(v, m) => v + ' of ' + m} />
<Progress value={92} tone="danger" label="API quota" showValue />
<Progress aria-label="Preparing export" />
```
