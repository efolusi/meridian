# Message Scroller

A composable transcript scroller for saved threads and streamed responses. It preserves position when history is prepended, follows output only while the reader remains at the live edge, anchors new turns, and exposes scroll, visibility, and edge-state hooks.

```jsx
<MessageScrollerProvider autoScroll>
  <MessageScroller style={{ height: 420 }}>
    <MessageScrollerViewport>
      <MessageScrollerContent>
        {messages.map(message => (
          <MessageScrollerItem key={message.id} messageId={message.id} scrollAnchor={message.role === 'user'}>
            <Message>{message.content}</Message>
          </MessageScrollerItem>
        ))}
      </MessageScrollerContent>
    </MessageScrollerViewport>
    <MessageScrollerButton />
  </MessageScroller>
</MessageScrollerProvider>
```

Give every row a stable `messageId`. Enable `autoScroll` only when streamed output should follow the live edge; scrolling away releases it. The viewport is a labelled keyboard-focusable region and content is a polite additions-only log by default.

`MessageScrollerButton` defaults to `direction="end"`. Add a second button with `direction="start"` when the interface needs both edge controls; each becomes inert when there is no content in its direction.
