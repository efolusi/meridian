# Message

Composable conversation-row layout with optional avatar, header, footer, grouping, and start/end alignment. Message owns layout only; render a `Bubble` inside `MessageContent` for the visible surface.

```jsx
<Message align="start">
  <MessageAvatar><Avatar><AvatarFallback>JP</AvatarFallback></Avatar></MessageAvatar>
  <MessageContent>
    <MessageHeader>June · Support</MessageHeader>
    <Bubble><BubbleContent>The deployment is healthy.</BubbleContent></Bubble>
    <MessageFooter>Read 2m ago</MessageFooter>
  </MessageContent>
</Message>
```

Use `MessageGroup` for consecutive rows from one sender. Keep an empty `MessageAvatar` on earlier rows when the final row carries the visible avatar so every bubble stays aligned.
