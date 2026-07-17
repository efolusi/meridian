# SelectionQuote

Select-to-quote affordance — wrap message content; selecting text floats a small toolbar above the selection (flips below near the top, clamped to the container). Actions receive the selected text.

```jsx
<SelectionQuote onAction={(id, text) => quote(text)}
  actions={[{ id: 'quote', label: 'Quote', icon: 'corner-up-left' }, { id: 'explain', label: 'Explain' }]}>
  <p>…assistant answer…</p>
</SelectionQuote>
```
