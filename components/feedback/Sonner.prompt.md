# Sonner

Mount one `Toaster` near the application root, then call the imperative `toast` API from any event handler.

```jsx
<Toaster position="bottom-right" closeButton />

toast.success('Run completed', {
  description: 'All production regions are healthy.',
  action: { label: 'View run', onClick: openRun },
})
```

Use `toast.info`, `toast.warning`, `toast.error`, `toast.loading`, `toast.promise`, `toast.custom`, and `toast.dismiss` for the corresponding lifecycle. Hovering or focusing the stack pauses dismissal timers.
