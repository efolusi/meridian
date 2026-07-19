Agent-thread message: bot chip or user avatar, meta row, optional hover action row, streaming caret.

The copy and retry buttons only render when you pass `onCopy` / `onRetry`, so a message never shows a control it cannot action. Pass a node as `actions` to replace the row, or `false` to suppress it.

```jsx
<ChatMessage role="user" name="Ada Obi" time="14:02">Deploy the staging branch.</ChatMessage>
<ChatMessage time="14:02" onCopy={copy} onRetry={rerun}>Deployed to staging.</ChatMessage>
<ChatMessage time="14:02" streaming>Provisioning a runner…</ChatMessage>
```
