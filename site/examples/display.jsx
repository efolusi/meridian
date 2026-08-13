// Meridian docs demos — display.

// @demo Accordion Disclosure list
export function AccordionDemo() {
  const { Accordion, AccordionItem, AccordionTrigger, AccordionContent } = window.EfolusiDesignSystem_4ffc3d;
  return (
    <div style={{ width: '100%', maxWidth: 520 }}>
      <Accordion type="single" defaultValue="limits" collapsible>
        <AccordionItem value="limits">
          <AccordionTrigger>What are the run limits?</AccordionTrigger>
          <AccordionContent>Free workspaces get 100 agent runs per month. Paid plans are metered per run.</AccordionContent>
        </AccordionItem>
        <AccordionItem value="data">
          <AccordionTrigger>Where does my data live?</AccordionTrigger>
          <AccordionContent>In your region. Artifacts are encrypted at rest and never used for training.</AccordionContent>
        </AccordionItem>
        <AccordionItem value="cancel">
          <AccordionTrigger>Can I cancel anytime?</AccordionTrigger>
          <AccordionContent>Yes — your workspace stays readable forever.</AccordionContent>
        </AccordionItem>
      </Accordion>
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

// @demo DirectionProvider Right-to-left behavior
export function DirectionProviderDemo() {
  const { DirectionProvider, Switch, Tabs } = window.EfolusiDesignSystem_4ffc3d;
  const [value, setValue] = React.useState('overview');
  return (
    <div dir="rtl" lang="ar" style={{ width: '100%', maxWidth: 420 }}>
      <DirectionProvider dir="rtl">
        <Tabs value={value} onChange={setValue} items={[
          { id: 'overview', label: 'نظرة عامة' },
          { id: 'activity', label: 'النشاط' },
          { id: 'settings', label: 'الإعدادات' },
        ]} />
        <div style={{ marginTop: 18 }}><Switch defaultChecked label="الإشعارات" /></div>
      </DirectionProvider>
    </div>
  );
}

// @demo Avatar Identity group with fallbacks
export function AvatarDemo() {
  const { Avatar, AvatarImage, AvatarFallback, AvatarBadge, AvatarGroup, AvatarGroupCount } = window.EfolusiDesignSystem_4ffc3d;
  return (
    <div style={{ display: 'grid', gap: 14 }}>
      <AvatarGroup aria-label="Project members">
        <Avatar size="lg"><AvatarImage src="https://i.pravatar.cc/96?img=47" alt="Ada Obi" /><AvatarFallback>AO</AvatarFallback><AvatarBadge aria-label="Online" /></Avatar>
        <Avatar size="lg"><AvatarFallback>KM</AvatarFallback></Avatar>
        <Avatar size="lg"><AvatarFallback>JP</AvatarFallback></Avatar>
        <AvatarGroupCount aria-label="3 more members">+3</AvatarGroupCount>
      </AvatarGroup>
      <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
        <Avatar size="sm"><AvatarFallback>AO</AvatarFallback></Avatar>
        <Avatar><AvatarFallback>AO</AvatarFallback></Avatar>
        <Avatar size="lg"><AvatarFallback>AO</AvatarFallback></Avatar>
      </div>
    </div>
  );
}

// @demo Badge Variants and custom status colors
export function BadgeDemo() {
  const { Badge, Icon } = window.EfolusiDesignSystem_4ffc3d;
  return (
    <div style={{ display: 'grid', gap: 12 }}>
      <div style={{ display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap' }}>
        <Badge>Default</Badge>
        <Badge variant="secondary">Secondary</Badge>
        <Badge variant="destructive">Destructive</Badge>
        <Badge variant="outline">Outline</Badge>
        <Badge variant="ghost">Ghost</Badge>
      </div>
      <div style={{ display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap' }}>
        <Badge className="ef-badge--success"><Icon name="circle" size={7} strokeWidth={4} data-icon="inline-start" />Live</Badge>
        <Badge className="ef-badge--warning"><Icon name="circle" size={7} strokeWidth={4} data-icon="inline-start" />Degraded</Badge>
        <Badge variant="destructive">Failed</Badge>
      </div>
    </div>
  );
}

// @demo Card Header, body, footer
export function CardDemo() {
  const { Card, CardAction, CardContent, CardDescription, CardFooter, CardHeader, CardTitle, Badge, Button, Icon } = window.EfolusiDesignSystem_4ffc3d;
  return (
    <div style={{ width: 380 }}>
      <Card>
        <CardHeader>
          <CardTitle>Nightly export</CardTitle>
          <CardDescription>Runs at 02:00 UTC</CardDescription>
          <CardAction><Badge className="ef-badge--success"><Icon name="circle" size={7} strokeWidth={4} data-icon="inline-start" />Live</Badge></CardAction>
        </CardHeader>
        <CardContent>Exports every closed conversation to your warehouse as Parquet.</CardContent>
        <CardFooter><Button variant="ghost" size="sm">View history</Button></CardFooter>
      </Card>
    </div>
  );
}

// @demo Carousel Scroll-snap strip
export function CarouselDemo() {
  const { Carousel, CarouselContent, CarouselItem, CarouselPrevious, CarouselNext, Card, CardContent, CardDescription, CardHeader, CardTitle } = window.EfolusiDesignSystem_4ffc3d;
  return (
    <div style={{ width: '100%', maxWidth: 560, paddingInline: 14 }}>
      <Carousel opts={{ align: 'start' }} aria-label="Workspace modules">
        <CarouselContent>
          {['Analytics', 'Billing', 'Identity', 'Storage', 'Search', 'Webhooks'].map(p => (
            <CarouselItem key={p} style={{ flexBasis: 180 }}>
              <Card><CardHeader><CardTitle>{p}</CardTitle><CardDescription>Module</CardDescription></CardHeader><CardContent><div style={{ height: 28 }} /></CardContent></Card>
            </CarouselItem>
          ))}
        </CarouselContent>
        <CarouselPrevious />
        <CarouselNext />
      </Carousel>
    </div>
  );
}

// @demo Collapsible Advanced options
export function CollapsibleDemo() {
  const { Collapsible, CollapsibleTrigger, CollapsibleContent, Icon, Switch } = window.EfolusiDesignSystem_4ffc3d;
  return (
    <div style={{ width: 340 }}>
      <Collapsible defaultOpen>
        <CollapsibleTrigger className="ef-collapsible__trigger">
          <Icon name="settings" size={16} /> Advanced settings
        </CollapsibleTrigger>
        <CollapsibleContent style={{ paddingBlock: 8 }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          <Switch size="sm" defaultChecked label="Verbose logs" />
          <Switch size="sm" label="Beta features" />
          </div>
        </CollapsibleContent>
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

// @demo Separator Semantic and decorative rules
export function SeparatorDemo() {
  const { Separator } = window.EfolusiDesignSystem_4ffc3d;
  return (
    <div style={{ display: 'grid', gap: 16 }}>
      <span>Account details</span>
      <Separator decorative={false} />
      <span>Billing details</span>
    </div>
  );
}

// @demo Kbd Keyboard hints
export function KbdDemo() {
  const { Kbd, KbdGroup } = window.EfolusiDesignSystem_4ffc3d;
  return (
    <p style={{ margin: 0, fontSize: 14.5, color: 'var(--text-secondary)' }}>
      Press <KbdGroup aria-label="Command K"><Kbd>⌘</Kbd><span>+</span><Kbd>K</Kbd></KbdGroup> to open the command palette, or <Kbd>?</Kbd> for shortcuts.
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

// @demo Item Compositional content rows
export function ItemDemo() {
  const { Item, ItemActions, ItemContent, ItemDescription, ItemGroup, ItemMedia, ItemTitle, Badge, Icon } = window.EfolusiDesignSystem_4ffc3d;
  return (
    <ItemGroup style={{ width: '100%', maxWidth: 460, gap: 8 }}>
      <Item variant="outline"><ItemMedia variant="icon"><Icon name="bot" /></ItemMedia><ItemContent><ItemTitle>Flight rebooking agent</ItemTitle><ItemDescription>Last run 4 min ago</ItemDescription></ItemContent><ItemActions><Badge className="ef-badge--success"><Icon name="circle" size={7} strokeWidth={4} data-icon="inline-start" />Live</Badge></ItemActions></Item>
      <Item variant="muted" size="sm"><ItemMedia variant="icon"><Icon name="database" /></ItemMedia><ItemContent><ItemTitle>Warehouse sync</ItemTitle><ItemDescription>Nightly at 02:00</ItemDescription></ItemContent><ItemActions><Badge variant="secondary">Paused</Badge></ItemActions></Item>
    </ItemGroup>
  );
}

// @demo Timeline Audit history
export function TimelineDemo() {
  const { Timeline } = window.EfolusiDesignSystem_4ffc3d;
  return (
    <div style={{ width: '100%', maxWidth: 520 }}>
      <Timeline items={[
        { id: 'review', title: 'Security review requested', description: 'Regional deployment questions assigned to solutions.', time: '09:42', dateTime: '2026-08-10T09:42:00Z', actor: 'Ada Obi', tone: 'warning' },
        { id: 'workshop', title: 'Rollout workshop completed', description: 'Operations named regional owners and the approval path.', time: 'Yesterday', dateTime: '2026-08-09', actor: 'Femi Alade' },
        { id: 'approved', title: 'Implementation approved', time: '8 Aug', dateTime: '2026-08-08', actor: 'June Park', tone: 'success' },
      ]} aria-label="Account history" />
    </div>
  );
}

// @demo ResizablePanelGroup Split panes
export function ResizableDemo() {
  const { ResizablePanelGroup, ResizablePanel, ResizableHandle } = window.EfolusiDesignSystem_4ffc3d;
  return (
    <div style={{ width: '100%', maxWidth: 520, height: 150, border: '1px solid var(--border-default)', borderRadius: 'var(--radius-md)', overflow: 'hidden' }}>
      <ResizablePanelGroup orientation="horizontal">
        <ResizablePanel defaultSize={35} minSize={20}>
          <div style={{ padding: 14, fontSize: 13, color: 'var(--text-secondary)', background: 'var(--surface-card)', height: '100%' }}>Drag the handle →</div>
        </ResizablePanel>
        <ResizableHandle withHandle />
        <ResizablePanel minSize={30}>
          <div style={{ padding: 14, fontSize: 13, color: 'var(--text-secondary)', height: '100%' }}>Keyboard: focus the handle, then use arrow keys.</div>
        </ResizablePanel>
      </ResizablePanelGroup>
    </div>
  );
}

// @demo ScrollArea Bounded log
export function ScrollAreaDemo() {
  const { ScrollArea, ScrollBar } = window.EfolusiDesignSystem_4ffc3d;
  const lines = ['agent.run started', 'plan drafted (4 steps)', 'tool: search_flights', 'tool: book_hotel', 'review requested', 'approved by Ada', 'agent.run finished', 'artifact saved', 'notified #ops', 'usage: 1,240 tokens'];
  return (
    <div style={{ width: 340, border: '1px solid var(--border-default)', borderRadius: 'var(--radius-md)' }}>
      <ScrollArea maxHeight={120}>
        <div style={{ padding: 12, display: 'flex', flexDirection: 'column', gap: 7, fontFamily: 'var(--font-mono)', fontSize: 12, color: 'var(--text-secondary)' }}>
          {lines.map((l, i) => <span key={i}>{l}</span>)}
        </div>
        <ScrollBar orientation="vertical" />
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
      <TreeList value={sel} onChange={setSel} defaultOpen={['agents']} nodes={[
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
