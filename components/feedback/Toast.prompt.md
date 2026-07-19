Dark (espresso) notification card. Reach for `Toaster` first — it owns the queue, so you do not hand-roll ids, timers and a stack in every screen.

Put one `Toaster` at the root, then call the hook anywhere below it. The hook is a static on `Toaster` because only capitalised exports reach the namespace:

```jsx
const { Toaster } = window.EfolusiDesignSystem_4ffc3d;
const useToast = Toaster.useToast;

function App() {
  return <Toaster><Page /></Toaster>;
}

function Page() {
  const { notify } = useToast();
  return <Button onClick={() => notify({ tone: 'success', title: 'Invite sent',
    description: 'Ada will get an email in a minute.' })}>Send invite</Button>;
}
```

`notify` returns an id; `dismiss(id)` and `dismissAll()` are on the same object. Tones: `info | success | warning | danger`, defaulting to `info` — pick `success` deliberately rather than making every notification green.

Timing is an accessibility contract, not a preference. Timers pause while the stack is hovered or focused, and **a toast with `actionLabel` never auto-dismisses**, because a control that disappears on a timer the user cannot adjust fails WCAG 2.2.1. Override per call with `duration` (`0` for persistent). The stack owns one live region, so a queue announces once instead of as several competing regions.

Use `Toast` and `ToastStack` directly only when you are rendering a fixed, non-queued notification — a specimen, or a message whose lifecycle something else already owns:

```jsx
<ToastStack>
  <Toast tone="success" title="Invite sent" onClose={dismiss} />
</ToastStack>
```
