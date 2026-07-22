Live status dot with label; `pulse` radiates for running/connected states. The state is never colour-only: with a `label` the state text is prepended visually hidden ("Error: API"), without one the dot announces itself as an image named after the state. Override the announced text with `stateLabel`.

```jsx
<StatusDot state="ok" pulse label="Connected" />
<StatusDot state="busy" pulse label="Running" />
<StatusDot state="err" label="Failed" />
<StatusDot state="warn" stateLabel="Degraded" label="EU region" />
```
