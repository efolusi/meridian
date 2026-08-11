# Alert Dialog

Use Alert Dialog for an important decision that must be acknowledged before work continues. Compose the trigger, content, header, title, description, footer, cancel, and action parts. Add media only when it helps explain the decision.

```jsx
<AlertDialog>
  <AlertDialogTrigger asChild><Button variant="outline">Archive project</Button></AlertDialogTrigger>
  <AlertDialogContent>
    <AlertDialogHeader>
      <AlertDialogTitle>Archive this project?</AlertDialogTitle>
      <AlertDialogDescription>Scheduled runs pause until the project is restored.</AlertDialogDescription>
    </AlertDialogHeader>
    <AlertDialogFooter>
      <AlertDialogCancel>Cancel</AlertDialogCancel>
      <AlertDialogAction>Archive project</AlertDialogAction>
    </AlertDialogFooter>
  </AlertDialogContent>
</AlertDialog>
```
