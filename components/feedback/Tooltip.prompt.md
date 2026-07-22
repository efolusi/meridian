Hover/focus tooltip with 200ms delay and spring pop. Wrap any trigger element.

```jsx
<Tooltip label="Copy to clipboard"><IconButton icon="copy" label="Copy" /></Tooltip>
```

`side`: `top` (default), `bottom`, `left`, or `right`; flips when there is no room. Keep labels short; no interactive content inside.

Vocabulary: state-carrying selection fires `onChange`; command menus fire `onSelect`; placement is `side` (top/bottom/left/right). `position` is a deprecated alias for `side` (one major); `side` wins when both are passed.
