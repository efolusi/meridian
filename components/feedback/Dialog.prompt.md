Compose `Dialog`, `DialogTrigger`, `DialogContent`, `DialogHeader`, `DialogTitle`, `DialogDescription`, `DialogFooter`, and `DialogClose` for a centered modal with focus containment, ESC/overlay/close dismissal, and focus restoration.

```jsx
<Dialog open={open} onClose={close} title="Rename project" description="This updates the URL for everyone."
  footer={<><Button variant="ghost" onClick={close}>Cancel</Button><Button onClick={save}>Save changes</Button></>}>
  <Input label="Project name" defaultValue="Q3 launch plan" />
</Dialog>
```

`width` caps max-width (default 440). Footer sits on a sunken sand strip.
