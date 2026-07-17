Dark (espresso) notification card; wrap in `ToastStack` to pin bottom-right.

```jsx
<ToastStack>
  <Toast tone="success" title="Invite sent" description="Ada will get an email in a minute." onClose={dismiss} />
</ToastStack>
```

Tones: `info | success | warning | danger`. `actionLabel`/`onAction` adds an inline action link.
