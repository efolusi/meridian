Side panel for details and multi-field edits that shouldn't leave the page.

```jsx
<Drawer open={open} onClose={close} title="Customer details"
  footer={<><Button variant="ghost" onClick={close}>Cancel</Button><Button onClick={save}>Save changes</Button></>}>
  …content…
</Drawer>
```

`width` (default 400), `side` left/right.
