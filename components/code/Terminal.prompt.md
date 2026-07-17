Line-oriented console output: $ prompts, tinted ok/err/info lines, optional live caret.

```jsx
<Terminal host="deploy@efolusi-prod" live lines={[
  { type: 'cmd', text: 'efolusi infra connect aws' },
  { type: 'info', text: 'Handshake with eu-west-1…', time: '09:41:02' },
  { type: 'ok', text: '✓ Connected · 14 resources found', time: '09:41:04' },
]} />
```
