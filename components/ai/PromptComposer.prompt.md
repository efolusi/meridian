Agent input: auto textarea, optional attach + voice buttons, ink send. Enter sends, Shift+Enter breaks.

The attach and voice buttons only render when you pass `onAttach` / `onVoice` — the composer never shows a control it cannot action. While `busy`, the send button becomes a stop button that calls `onStop`.

```jsx
<PromptComposer onSend={run} hint="Agent can read your workspace"
  onAttach={pickFiles} busy={streaming} onStop={abort}
  attachments={<FileTile name="q3-plan.pdf" size="1.2 MB" onRemove={clear} />} />
```
