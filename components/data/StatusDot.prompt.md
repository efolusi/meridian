Live status dot with label; `pulse` radiates for running/connected states. The state is never colour-only: with a `label` the state text is prepended visually hidden ("Error: API"), without one the dot announces itself as an image named after the state. Override the announced text with `statusLabel`.

```jsx
<StatusDot status="ok" pulse label="Connected" />
<StatusDot status="busy" pulse label="Running" />
<StatusDot status="err" label="Failed" />
<StatusDot status="warn" statusLabel="Degraded" label="EU region" />
```
