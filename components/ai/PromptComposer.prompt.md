Agent input: auto textarea, attach + voice buttons, ink send. Enter sends, Shift+Enter breaks.

```jsx
<PromptComposer onSend={run} hint="Agent can read your workspace"
  attachments={<FileTile name="q3-plan.pdf" size="1.2 MB" onRemove={clear} />} />
```
