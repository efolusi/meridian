# RichComposer

Composer with @-mention chips and /-commands — typing a trigger opens a filtered list above the composer (arrows + Enter, groups supported); mentions insert as atomic chips that delete as one unit; Enter submits, Shift+Enter breaks.

```jsx
<RichComposer hint="@ files · / commands"
  mentions={[{ id: 'f1', label: 'gateway.md', icon: 'file-text', group: 'Files' }]}
  commands={[{ id: 'clear', label: 'clear', description: 'Reset the thread' }]}
  onSubmit={({ text, mentions }) => send(text, mentions)} />
```
