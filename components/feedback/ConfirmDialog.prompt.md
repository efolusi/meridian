Destructive-action preset of Dialog; optional type-to-confirm gate.

```jsx
<ConfirmDialog open={open} onOpenChange={setOpen} onConfirm={destroy}
  title="Delete workspace" description="Removes all projects, keys, and member access. This can't be undone."
  confirmLabel="Delete workspace" typeToConfirm="acme-workspace" />
```
