# Select

Use the composed Select for a custom popup list. Use `NativeSelect` when native `<select>` semantics are required.

```jsx
<Select defaultValue="member">
  <SelectTrigger><SelectValue placeholder="Choose a role" /></SelectTrigger>
  <SelectContent>
    <SelectGroup>
      <SelectLabel>Roles</SelectLabel>
      <SelectItem value="member">Member</SelectItem>
      <SelectItem value="admin">Admin</SelectItem>
    </SelectGroup>
  </SelectContent>
</Select>
```
