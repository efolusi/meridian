// Meridian docs demos — overlay.

// @demo Command Composable palette
export function CommandDemo() {
  const { CommandDialog, CommandInput, CommandList, CommandEmpty, CommandGroup, CommandItem, CommandShortcut, Button, Kbd, Icon } = window.EfolusiDesignSystem_4ffc3d;
  const [open, setOpen] = React.useState(false);
  const run = () => setOpen(false);
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
      <Button variant="secondary" onClick={() => setOpen(true)}>Open palette</Button>
      <span style={{ fontSize: 13, color: 'var(--text-muted)' }}>or press <Kbd>⌘</Kbd> <Kbd>K</Kbd></span>
      <CommandDialog open={open} onOpenChange={setOpen} title="Workspace commands">
        <CommandInput placeholder="Type a command or search…" />
        <CommandList>
          <CommandEmpty>No matching commands.</CommandEmpty>
          <CommandGroup heading="Actions">
            <CommandItem value="new-agent" onSelect={run}><Icon name="plus" size={16} />New agent<CommandShortcut>⌘N</CommandShortcut></CommandItem>
            <CommandItem value="run-agent" onSelect={run}><Icon name="play" size={16} />Run current agent<CommandShortcut>⌘↵</CommandShortcut></CommandItem>
          </CommandGroup>
          <CommandGroup heading="Go to">
            <CommandItem value="runs" onSelect={run}><Icon name="bot" size={16} />Runs</CommandItem>
            <CommandItem value="billing" onSelect={run}><Icon name="credit-card" size={16} />Billing</CommandItem>
          </CommandGroup>
        </CommandList>
      </CommandDialog>
    </div>
  );
}

// @demo ContextMenu Right-click actions
export function ContextMenuDemo() {
  const { ContextMenu } = window.EfolusiDesignSystem_4ffc3d;
  return (
    <ContextMenu onSelect={() => {}} items={[
      { id: 'rename', label: 'Rename', icon: 'pencil' },
      { id: 'dup', label: 'Duplicate', icon: 'copy', kbd: '⌘D' },
      'separator',
      { id: 'del', label: 'Delete', icon: 'trash-2', danger: true },
    ]}>
      <div style={{ padding: '26px 44px', border: '1px dashed var(--border-strong)', borderRadius: 'var(--radius-md)', fontSize: 13.5, color: 'var(--text-secondary)', userSelect: 'none' }}>Right-click me</div>
    </ContextMenu>
  );
}

// @demo Drawer Side panel
export function DrawerDemo() {
  const { Drawer, Button, KeyValueList } = window.EfolusiDesignSystem_4ffc3d;
  const [open, setOpen] = React.useState(false);
  return (
    <div>
      <Button variant="secondary" onClick={() => setOpen(true)}>Customer details</Button>
      <Drawer open={open} onClose={() => setOpen(false)} title="Acme Corp" width={340}
        footer={<Button fullWidth onClick={() => setOpen(false)}>Done</Button>}>
        <KeyValueList labelWidth={110} items={[
          { label: 'Plan', value: 'Scale — $499/mo' },
          { label: 'Seats', value: '38 of 50' },
          { label: 'Owner', value: 'ada@acme.com', mono: true },
        ]} />
      </Drawer>
    </div>
  );
}

// @demo HoverCard Person preview
export function HoverCardDemo() {
  const { HoverCard, Button, Avatar } = window.EfolusiDesignSystem_4ffc3d;
  return (
    <HoverCard width={280} trigger={<Button variant="ghost">@ada</Button>}>
      <div style={{ display: 'flex', gap: 12 }}>
        <Avatar name="Ada Obi" size={40} />
        <div style={{ fontSize: 13.5 }}>
          <div style={{ fontWeight: 600 }}>Ada Obi</div>
          <div style={{ color: 'var(--text-muted)' }}>Owner · Acme Workspace</div>
          <div style={{ marginTop: 6, color: 'var(--text-secondary)' }}>Shipped 12 agent runs this week.</div>
        </div>
      </div>
    </HoverCard>
  );
}

// @demo Menu Dropdown actions
export function MenuDemo() {
  const { Menu, Button } = window.EfolusiDesignSystem_4ffc3d;
  return (
    <Menu trigger={<Button variant="secondary" iconRight="chevron-down">Actions</Button>} onSelect={() => {}} items={[
      { id: 'edit', label: 'Edit', icon: 'pencil', kbd: '⌘E' },
      { id: 'dup', label: 'Duplicate', icon: 'copy' },
      'separator',
      { id: 'archive', label: 'Archive', icon: 'inbox' },
      { id: 'del', label: 'Delete', icon: 'trash-2', danger: true },
    ]} />
  );
}

// @demo Popover Anchored panel
export function PopoverDemo() {
  const { Popover, PopoverTrigger, PopoverContent, PopoverHeader, PopoverTitle, PopoverDescription, Button, Checkbox } = window.EfolusiDesignSystem_4ffc3d;
  return (
    <Popover>
      <PopoverTrigger asChild><Button variant="secondary" iconLeft="funnel">Filter</Button></PopoverTrigger>
      <PopoverContent align="start" width={260}>
        <PopoverHeader>
          <PopoverTitle>Filter runs</PopoverTitle>
          <PopoverDescription>Choose which operational states appear.</PopoverDescription>
        </PopoverHeader>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        <span style={{ fontSize: 12, fontWeight: 600, letterSpacing: '0.05em', textTransform: 'uppercase', color: 'var(--text-muted)' }}>Status</span>
        <Checkbox defaultChecked label="Live" />
        <Checkbox defaultChecked label="Paused" />
        <Checkbox label="Archived" />
        </div>
      </PopoverContent>
    </Popover>
  );
}
