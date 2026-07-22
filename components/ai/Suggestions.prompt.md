# Suggestions

Prompt-suggestion chip row for empty chats and follow-ups.

`<Suggestions items={[{ icon: 'sparkles', label: 'Summarize this thread' }, 'Draft a reply']} onSelect={send} />`

3–5 chips max, verb-first labels. Picking a chip should send it, not just fill the composer.

Vocabulary: state-carrying selection fires `onChange`; command menus fire `onSelect`; placement is `side` (top/bottom/left/right). `onPick` is a deprecated alias for `onSelect` (one major); `onSelect` wins when both are passed.
