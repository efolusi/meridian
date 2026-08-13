# Toast

Mount one `Toaster` near the application root, then publish succinct status updates through the manager.

```jsx
<Toaster position="bottom-right" closeButton />

const id = toast.add({
  title: 'Run completed',
  description: 'All checks passed.',
  type: 'success',
  actionProps: { children: 'View report', onClick: openReport },
})

toast.close(id)
```

Use `toast.promise` to update the same notification through loading, success, and error states. Hovering or focusing the stack pauses dismissal timers.
