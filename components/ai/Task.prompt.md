# Task

Rail-connected list of agent actions — icon rows joined by hairline connectors; last row's rail is hidden. `streaming` pulses the newest row.

```jsx
<Task streaming items={[
  { icon: 'search', label: 'Searched docs', detail: 'for "rate limits"' },
  { icon: 'file-text', label: 'Read', detail: <code>gateway.md</code> },
  { label: 'Drafting answer' },
]} />
```
