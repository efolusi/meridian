# Drawer

A composable, gesture-dismissable surface for mobile details and short workflows. It supports top, right, bottom, and left directions; controlled or uncontrolled state; focus trapping; Escape/overlay dismissal; and focus return.

```jsx
<Drawer>
  <DrawerTrigger asChild><Button>Review order</Button></DrawerTrigger>
  <DrawerContent>
    <DrawerHeader>
      <DrawerTitle>Order review</DrawerTitle>
      <DrawerDescription>Confirm the shipment before dispatch.</DrawerDescription>
    </DrawerHeader>
    <div style={{ padding: 24 }}>…</div>
    <DrawerFooter>
      <DrawerClose asChild><Button variant="secondary">Cancel</Button></DrawerClose>
      <Button>Dispatch</Button>
    </DrawerFooter>
  </DrawerContent>
</Drawer>
```

Set `direction` on `Drawer`; bottom is the default and displays a drag handle. Set `dismissible={false}` for a decision that must be completed explicitly. Use Sheet for a non-gesture desktop side panel.
