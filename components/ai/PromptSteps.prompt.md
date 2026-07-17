# PromptSteps

Keyboard-first inline question wizard — numbered options (1–9 keys), arrows to highlight, Enter to confirm, Esc dismisses, ←/Shift-Tab goes back; "Other" is an inline input. Calls `onComplete` with all answers.

```jsx
<PromptSteps onComplete={console.log} steps={[
  { name: 'tone', question: 'What tone should the draft use?', options: ['Formal', 'Friendly', 'Direct'], other: true },
  { name: 'length', question: 'How long?', options: ['One paragraph', 'One page'] },
]} />
```
