# Console

Log viewer — level icons/colors, tabular timestamps, per-row collapsible stack traces, sticks to the bottom while streaming and shows a "Latest" pill when scrolled up.

```jsx
<Console entries={[
  { level: 'info', time: '14:02:11', text: 'Server started on :3000' },
  { level: 'error', time: '14:02:19', text: 'Unhandled rejection', stack: 'at fetchUser (api.js:32)', source: 'api.js:32' },
]} />
```
