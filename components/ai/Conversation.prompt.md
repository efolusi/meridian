# Conversation

Stick-to-bottom thread viewport: keeps pinned to the latest message while streaming (ResizeObserver), shows a "Jump to latest" pill when the reader scrolls up.

`<Conversation height={480}>{messages.map(m => <ChatMessage …/>)}</Conversation>`

Wrap the message column of any chat surface; it owns scrolling, you own the messages. Set autoStick={false} for read-only transcripts.

The viewport is a keyboard-focusable part so the thread can be scrolled with the arrow keys. Unnamed it is a `group` called `Conversation` (set the words with `label`), which is no landmark. `aria-label` or `aria-labelledby` makes it a `region` with that name; `aria-labelledby` wins.
