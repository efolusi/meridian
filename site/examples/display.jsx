// Meridian docs demos — display.

// @demo Accordion Disclosure list
export function AccordionDemo() {
  const { Accordion } = window.EfolusiDesignSystem_4ffc3d;
  return (
    <div style={{ width: '100%', maxWidth: 520 }}>
      <Accordion items={[
        { id: 'limits', title: 'What are the run limits?', content: 'Free workspaces get 100 agent runs per month. Paid plans are metered per run.' },
        { id: 'data', title: 'Where does my data live?', content: 'In your region. Artifacts are encrypted at rest and never used for training.' },
        { id: 'cancel', title: 'Can I cancel anytime?', content: 'Yes — your workspace stays readable forever.' },
      ]} />
    </div>
  );
}

// @demo AspectRatio Fixed-ratio media box
export function AspectRatioDemo() {
  const { AspectRatio } = window.EfolusiDesignSystem_4ffc3d;
  return (
    <div style={{ width: 340 }}>
      <AspectRatio ratio={16 / 9}>
        <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--brand-950)', color: 'var(--brand-100)', borderRadius: 'var(--radius-md)', fontFamily: 'var(--font-mono)', fontSize: 13 }}>16 : 9</div>
      </AspectRatio>
    </div>
  );
}

// @demo Avatar Initials and sizes
export function AvatarDemo() {
  const { Avatar } = window.EfolusiDesignSystem_4ffc3d;
  return (
    <div style={{ display: 'flex', gap: 14, alignItems: 'center' }}>
      <Avatar name="Ada Obi" size={24} />
      <Avatar name="Ada Obi" size={32} />
      <Avatar name="Kofi Mensah" size={40} />
      <Avatar name="June Park" size={48} />
    </div>
  );
}

// @demo Badge Tones
export function BadgeDemo() {
  const { Badge } = window.EfolusiDesignSystem_4ffc3d;
  return (
    <div style={{ display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap' }}>
      <Badge tone="neutral">Draft</Badge>
      <Badge tone="accent">Beta</Badge>
      <Badge tone="success" dot>Live</Badge>
      <Badge tone="warning" dot>Degraded</Badge>
      <Badge tone="danger">Failed</Badge>
    </div>
  );
}

// @demo Card Header, body, footer
export function CardDemo() {
  const { Card, Badge, Button } = window.EfolusiDesignSystem_4ffc3d;
  return (
    <div style={{ width: 380 }}>
      <Card title="Nightly export" subtitle="Runs at 02:00 UTC" actions={<Badge tone="success" dot>Live</Badge>}
        footer={<Button variant="ghost" size="sm">View history</Button>}>
        <p style={{ margin: 0, fontSize: 14, lineHeight: 1.6, color: 'var(--text-secondary)' }}>Exports every closed conversation to your warehouse as Parquet.</p>
      </Card>
    </div>
  );
}

// @demo Carousel Scroll-snap strip
export function CarouselDemo() {
  const { Carousel, Card } = window.EfolusiDesignSystem_4ffc3d;
  return (
    <div style={{ width: '100%', maxWidth: 560 }}>
      <Carousel itemWidth="180px">
        {['Agent', 'Infra', 'Trader', 'Tools', 'Social', 'Content'].map(p => (
          <Card key={p} title={p} subtitle="Product kit"><div style={{ height: 28 }}></div></Card>
        ))}
      </Carousel>
    </div>
  );
}

// @demo Collapsible Advanced options
export function CollapsibleDemo() {
  const { Collapsible, Switch } = window.EfolusiDesignSystem_4ffc3d;
  return (
    <div style={{ width: 340 }}>
      <Collapsible title="Advanced settings" defaultOpen>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          <Switch size="sm" defaultChecked label="Verbose logs" />
          <Switch size="sm" label="Beta features" />
        </div>
      </Collapsible>
    </div>
  );
}

// @demo Divider With label
export function DividerDemo() {
  const { Divider, Button } = window.EfolusiDesignSystem_4ffc3d;
  return (
    <div style={{ width: 300, display: 'flex', flexDirection: 'column', gap: 14 }}>
      <Button variant="secondary" fullWidth>Continue with SSO</Button>
      <Divider label="or" />
      <Button variant="ghost" fullWidth>Use email instead</Button>
    </div>
  );
}

// @demo Kbd Keyboard hints
export function KbdDemo() {
  const { Kbd } = window.EfolusiDesignSystem_4ffc3d;
  return (
    <p style={{ margin: 0, fontSize: 14.5, color: 'var(--text-secondary)' }}>
      Press <Kbd>⌘</Kbd> <Kbd>K</Kbd> to open the command palette, or <Kbd>?</Kbd> for shortcuts.
    </p>
  );
}

// @demo Link Variants
export function LinkDemo() {
  const { Link } = window.EfolusiDesignSystem_4ffc3d;
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 10, fontSize: 14.5 }}>
      <span>Read the <Link href="#display/Link">billing docs</Link> before upgrading.</span>
      <Link href="#display/Link" external>Status page</Link>
      <Link href="#display/Link" standalone icon="arrow-right">View all runs</Link>
    </div>
  );
}

// @demo ListItem Rows with trailing actions
export function ListItemDemo() {
  const { ListItem, Badge } = window.EfolusiDesignSystem_4ffc3d;
  return (
    <div style={{ width: '100%', maxWidth: 460, border: '1px solid var(--border-default)', borderRadius: 'var(--radius-md)', overflow: 'hidden' }}>
      <ListItem icon="bot" title="Flight rebooking agent" description="Last run 4 min ago" trailing={<Badge tone="success" dot>Live</Badge>} chevron onClick={() => {}} />
      <ListItem icon="database" title="Warehouse sync" description="Nightly at 02:00" trailing={<Badge tone="neutral">Paused</Badge>} chevron onClick={() => {}} />
    </div>
  );
}

// @demo Resizable Split panes
export function ResizableDemo() {
  const { Resizable } = window.EfolusiDesignSystem_4ffc3d;
  return (
    <div style={{ width: '100%', maxWidth: 520, height: 150, border: '1px solid var(--border-default)', borderRadius: 'var(--radius-md)', overflow: 'hidden' }}>
      <Resizable defaultRatio={0.35}>
        <div style={{ padding: 14, fontSize: 13, color: 'var(--text-secondary)', background: 'var(--surface-card)', height: '100%' }}>Drag the handle →</div>
        <div style={{ padding: 14, fontSize: 13, color: 'var(--text-secondary)', height: '100%' }}>Keyboard: focus the handle, then use arrow keys.</div>
      </Resizable>
    </div>
  );
}

// @demo ScrollArea Bounded log
export function ScrollAreaDemo() {
  const { ScrollArea } = window.EfolusiDesignSystem_4ffc3d;
  const lines = ['agent.run started', 'plan drafted (4 steps)', 'tool: search_flights', 'tool: book_hotel', 'review requested', 'approved by Ada', 'agent.run finished', 'artifact saved', 'notified #ops', 'usage: 1,240 tokens'];
  return (
    <div style={{ width: 340, border: '1px solid var(--border-default)', borderRadius: 'var(--radius-md)' }}>
      <ScrollArea maxHeight={120}>
        <div style={{ padding: 12, display: 'flex', flexDirection: 'column', gap: 7, fontFamily: 'var(--font-mono)', fontSize: 12, color: 'var(--text-secondary)' }}>
          {lines.map((l, i) => <span key={i}>{l}</span>)}
        </div>
      </ScrollArea>
    </div>
  );
}

// @demo Tag Removable tokens
export function TagDemo() {
  const { Tag } = window.EfolusiDesignSystem_4ffc3d;
  const [tags, setTags] = React.useState(['production', 'eu-west-1', 'nightly']);
  return (
    <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
      {tags.map(t => <Tag key={t} onRemove={() => setTags(tags.filter(x => x !== t))}>{t}</Tag>)}
      {tags.length === 0 ? <span style={{ fontSize: 13, color: 'var(--text-muted)' }}>All tags removed.</span> : null}
    </div>
  );
}

// @demo Toolbar Icon actions
export function ToolbarDemo() {
  const { Toolbar } = window.EfolusiDesignSystem_4ffc3d;
  const [v, setV] = React.useState('play');
  return (
    <Toolbar label="Run controls" value={v} onChange={setV} items={[
      { id: 'play', icon: 'play', tip: 'Run' },
      { id: 'pause', icon: 'pause', tip: 'Pause' },
      'separator',
      { id: 'refresh', icon: 'refresh-cw', tip: 'Restart' },
      { id: 'settings', icon: 'settings', tip: 'Configure' },
    ]} />
  );
}

// @demo TreeList Nested navigation
export function TreeListDemo() {
  const { TreeList } = window.EfolusiDesignSystem_4ffc3d;
  const [sel, setSel] = React.useState('runs');
  return (
    <div style={{ width: 260 }}>
      <TreeList value={sel} onSelect={setSel} defaultOpen={['agents']} nodes={[
        { id: 'agents', label: 'Agents', icon: 'bot', children: [
          { id: 'runs', label: 'Runs', count: 128 },
          { id: 'schedules', label: 'Schedules', count: 6 },
        ] },
        { id: 'data', label: 'Data', icon: 'database', children: [
          { id: 'tables', label: 'Tables', count: 42 },
        ] },
        { id: 'billing', label: 'Billing', icon: 'credit-card' },
      ]} />
    </div>
  );
}
