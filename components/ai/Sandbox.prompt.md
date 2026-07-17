# Sandbox

Collapsible code-run panel — mono title, soft ring while running / on error, tabbed Output & Code panes. Opens itself on error by default.

```jsx
<Sandbox title="python analyze.py" state="running" tabs={[
  { id: 'out', label: 'Output', content: <pre>Loading rows…</pre> },
  { id: 'code', label: 'Code', content: <pre>import pandas as pd</pre> },
]} />
```
