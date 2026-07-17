# Conversation

Stick-to-bottom thread viewport: keeps pinned to the latest message while streaming (ResizeObserver), shows a "Jump to latest" pill when the reader scrolls up.

`<Conversation height={480}>{messages.map(m => <ChatMessage …/>)}</Conversation>`

Wrap the message column of any chat surface; it owns scrolling, you own the messages. Set autoStick={false} for read-only transcripts.