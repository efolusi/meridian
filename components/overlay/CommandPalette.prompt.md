⌘K palette: search, grouped commands, full keyboard nav (↑↓, ↵, Esc), Kbd-hinted footer.

```jsx
<CommandPalette open={open} onClose={close} onSelect={run} groups={[
  { group: 'Actions', items: [
    { id: 'new', label: 'New project', icon: 'plus' },
    { id: 'invite', label: 'Invite teammate', icon: 'mail', hint: 'Settings' },
  ]},
  { group: 'Go to', items: [{ id: 'infra', label: 'Infrastructure', icon: 'server' }] },
]} />
```
