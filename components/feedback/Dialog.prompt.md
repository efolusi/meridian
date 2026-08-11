Compose `Dialog`, `DialogTrigger`, `DialogContent`, `DialogHeader`, `DialogTitle`, `DialogDescription`, `DialogFooter`, and `DialogClose` for a centered modal with focus containment, ESC/overlay/close dismissal, and focus restoration.

```jsx
<Dialog open={open} onOpenChange={setOpen}>
  <DialogContent>
    <DialogHeader><DialogTitle>Rename project</DialogTitle><DialogDescription>This updates the URL for everyone.</DialogDescription></DialogHeader>
    <div className="ef-dialog__body"><Input label="Project name" defaultValue="Q3 launch plan" /></div>
    <DialogFooter><DialogClose asChild><Button variant="ghost">Cancel</Button></DialogClose><Button onClick={save}>Save changes</Button></DialogFooter>
  </DialogContent>
</Dialog>
```

`width` caps max-width (default 440). Footer sits on a sunken sand strip.
