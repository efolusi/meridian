# Toast

Mount one `Toaster` near the application root, then publish succinct status updates through the manager.

```jsx
<Toaster position="bottom-right" />

const id = toast.add({
  title: 'Run completed',
  description: 'All checks passed.',
  type: 'success',
  actionProps: { children: 'View report', onClick: openReport },
})

toast.close(id)
```

Use `toast.promise` to update the same notification through loading, success, and error states.

Toasts follow the notice rules in design-tokens `docs/motion.md` (WCAG 2.2.1):

- A danger toast, a toast with `actionProps` and a loading toast never dismiss themselves, whatever `duration` says. `duration: 0` keeps any toast.
- Any other toast dismisses itself after the `--hold-notice` token (8000 ms), or after the `duration` you pass to `Toaster` or the toast. The timer pauses while the pointer is over the stack, while focus is inside it and while the window is hidden, and resumes with the time that was left.
- Every toast has a visible Dismiss button. Pass `closeButton={false}` to `Toaster`, or `closeButton: false` on one toast, to turn it off for a toast that expires; a toast that never expires keeps its button unless it passes `closeButton: false` itself.
- Each toast is announced through the stack's polite live region (`role="log"`, `aria-live="polite"`). The toasts carry no `role="status"` of their own on purpose: a status inside a polite log would be announced twice.
