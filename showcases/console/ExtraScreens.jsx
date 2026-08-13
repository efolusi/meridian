const { Card, CardAction, CardContent, CardDescription, CardHeader, CardTitle, Badge, Button, Icon, IconButton, Avatar, AvatarFallback, AvatarGroup, Stat, BarChart, Progress, Table, EmptyState, DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuShortcut, KeyValueList } = window.EfolusiDesignSystem_4ffc3d;

function ProjectActionMenu({ trigger, items, onSelect, align = 'end' }) { return <DropdownMenu><DropdownMenuTrigger asChild>{trigger}</DropdownMenuTrigger><DropdownMenuContent align={align}>{items.map((item, index) => item === 'separator' ? <DropdownMenuSeparator key={'separator-' + index} /> : <DropdownMenuItem key={item.id} disabled={item.disabled} variant={item.danger ? 'destructive' : 'default'} onSelect={() => { onSelect?.(item.id); item.onClick?.(); }}>{item.icon ? <Icon name={item.icon} size={15} /> : null}{item.label}{item.kbd ? <DropdownMenuShortcut>{item.kbd}</DropdownMenuShortcut> : null}</DropdownMenuItem>)}</DropdownMenuContent></DropdownMenu>; }

const PROJECTS = [
  ['Q3 launch plan', 'AI agents', '2 hours ago', ['Ada Obi', 'Femi Alade'], 'busy'],
  ['Billing migration', 'Infrastructure', 'Yesterday', ['June Park', 'Ada Obi', 'Sol Reyes'], 'ok'],
  ['Onboarding videos', 'Automation', '3 days ago', ['Sol Reyes'], 'ok'],
  ['EUR momentum bot', 'Trading', 'Last week', ['Femi Alade', 'June Park'], 'ok'],
];
function ProjectsScreen({ onNewProject, notify }) {
  return (
    <div style={{ padding: 24 }}>
      <div style={{ display: 'flex', alignItems: 'center', marginBottom: 16 }}>
        <span style={{ fontSize: 13, color: 'var(--text-muted)' }}>{PROJECTS.length} projects · all surfaces</span>
        <Button style={{ marginLeft: 'auto' }} iconLeft="plus" onClick={onNewProject}>New project</Button>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 16 }}>
        {PROJECTS.map(([name, product, when, people, state]) => (
          <Card key={name} interactive style={{ '--card-spacing': '18px' }} onClick={() => notify('Opening ' + name, 'Projects are a demo surface in this kit.')}><CardContent>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ fontSize: 15, fontWeight: 600, flex: 1 }}>{name}</span>
              <ProjectActionMenu trigger={<IconButton icon="ellipsis" label="More" size="sm" />} onSelect={id => notify(id === 'archive' ? 'Project archived' : 'Link copied', name)} items={[
                { id: 'copy', label: 'Copy link', icon: 'link' },
                { id: 'archive', label: 'Archive', icon: 'package', danger: true },
              ]} />
            </div>
            <div style={{ display: 'flex', gap: 6, marginTop: 8 }}>
              <Badge variant={state === 'busy' ? 'default' : 'secondary'} className={state === 'busy' ? 'ef-badge--accent' : undefined}>{state === 'busy' && <Icon name="circle" size={7} strokeWidth={4} data-icon="inline-start" />}{product}</Badge>
              {state === 'busy' && <Badge className="ef-badge--success"><Icon name="circle" size={7} strokeWidth={4} data-icon="inline-start" />Running</Badge>}
            </div>
            <div style={{ display: 'flex', alignItems: 'center', marginTop: 16 }}>
              <AvatarGroup>{people.map(p => <Avatar key={p} size="sm"><AvatarFallback>{p.split(/\s+/).map(part => part[0]).slice(0, 2).join('')}</AvatarFallback></Avatar>)}</AvatarGroup>
              <span style={{ marginLeft: 'auto', fontSize: 12, color: 'var(--text-muted)' }}>{when}</span>
            </div>
          </CardContent></Card>
        ))}
        <EmptyState bordered icon="plus" title="New project" description="Group keys, environments, and usage." action={<Button size="sm" variant="secondary" iconLeft="plus" onClick={onNewProject}>Create</Button>} style={{ padding: '28px 24px' }} />
      </div>
    </div>
  );
}

const USAGE_BY_PRODUCT = [
  { id: 'agent', product: 'AI agents', unit: 'tasks', used: '1,204', quota: '5,000', pct: 24 },
  { id: 'infra', product: 'Infrastructure', unit: 'tunnels', used: '14', quota: '25', pct: 56 },
  { id: 'content', product: 'Automation', unit: 'renders', used: '8,912', quota: '10,000', pct: 89 },
  { id: 'tools', product: 'File tools', unit: 'conversions', used: '412', quota: '2,000', pct: 21 },
];
function UsageScreen() {
  return (
    <div style={{ padding: 24, display: 'flex', flexDirection: 'column', gap: 16 }}>
      <div style={{ display: 'flex', gap: 16 }}>
        <Card style={{ flex: 1, '--card-spacing': '16px' }}><CardContent><Stat label="API requests · 30 days" value="489M" delta="8.9%" direction="up" /></CardContent></Card>
        <Card style={{ flex: 1, '--card-spacing': '16px' }}><CardContent><Stat label="Peak day" value="21.4M" hint="Jul 9 · product launch" /></CardContent></Card>
        <Card style={{ flex: 1, '--card-spacing': '16px' }}><CardContent><Stat label="Plan quota used" value="61%" hint="Resets Aug 1" /></CardContent></Card>
      </div>
      <Card><CardHeader><CardTitle>Requests per day</CardTitle><CardDescription>Last 30 days · ink bars are this week</CardDescription></CardHeader><CardContent><BarChart height={150} highlightLast={7} labels={['Jun 17', 'Jul 1', 'Jul 16']} format={v => (v / 10).toFixed(1) + 'M requests'}
          data={[82, 95, 88, 101, 98, 112, 106, 120, 114, 128, 132, 124, 136, 130, 144, 138, 152, 148, 158, 151, 164, 170, 162, 178, 172, 184, 190, 181, 196, 214]} /></CardContent></Card>
      <Card style={{ '--card-spacing': '20px' }}><CardHeader><CardTitle>By surface</CardTitle></CardHeader><CardContent>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px 40px' }}>
          {USAGE_BY_PRODUCT.map(u => (
            <Progress key={u.id} label={u.product} value={u.pct} showValue tone={u.pct > 85 ? 'warning' : 'default'} format={() => u.used + ' of ' + u.quota + ' ' + u.unit} />
          ))}
        </div>
      </CardContent></Card>
    </div>
  );
}

const INVOICES = [
  { id: '10422', date: 'Jul 1, 2026', amount: '€1,240.00', status: 'Paid' },
  { id: '10391', date: 'Jun 1, 2026', amount: '€1,240.00', status: 'Paid' },
  { id: '10360', date: 'May 1, 2026', amount: '€1,116.00', status: 'Paid' },
  { id: '10329', date: 'Apr 1, 2026', amount: '€992.00', status: 'Refunded' },
];
function BillingScreen({ notify }) {
  return (
    <div style={{ padding: 24, display: 'flex', flexDirection: 'column', gap: 16, maxWidth: 860 }}>
      <div style={{ display: 'flex', gap: 16 }}>
        <Card style={{ flex: 1.2, '--card-spacing': '20px' }}><CardHeader><CardTitle>Plan</CardTitle><CardAction><Badge className="ef-badge--accent">Growth</Badge></CardAction></CardHeader><CardContent>
          <KeyValueList labelWidth={130} items={[
            { label: 'Price', value: '€12 per seat / month', mono: true },
            { label: 'Seats', value: '4 of 5 used' },
            { label: 'Next invoice', value: 'Aug 1, 2026 · ~€1,240', mono: true },
          ]} />
          <div style={{ display: 'flex', gap: 8, marginTop: 16 }}>
            <Button size="sm" variant="secondary" onClick={() => notify('Plan options sent', 'Compare Growth vs Scale in your inbox.')}>Change plan</Button>
            <Button size="sm" variant="ghost" onClick={() => notify('Seats updated', 'You now have 6 seats.')}>Add seats</Button>
          </div>
        </CardContent></Card>
        <Card style={{ flex: 1, '--card-spacing': '20px' }}><CardHeader><CardTitle>Payment method</CardTitle></CardHeader><CardContent>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <span style={{ display: 'inline-flex', width: 38, height: 38, alignItems: 'center', justifyContent: 'center', borderRadius: 'var(--radius-sm)', background: 'var(--surface-sunken)', color: 'var(--sand-700)' }}><Icon name="credit-card" size={18} /></span>
            <div>
              <div style={{ fontSize: 14, fontWeight: 600, fontFamily: 'var(--font-mono)' }}>•••• 4242</div>
              <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>Expires 08 / 28</div>
            </div>
          </div>
          <Button size="sm" variant="secondary" iconLeft="pencil" style={{ marginTop: 16 }} onClick={() => notify('Secure link sent', 'Update your card from the email we just sent.')}>Update card</Button>
        </CardContent></Card>
      </div>
      <Card><CardHeader><CardTitle>Invoices</CardTitle><CardDescription>Also emailed to billing@acme.co on the 1st.</CardDescription></CardHeader><CardContent style={{ paddingInline: 0, marginBlockEnd: 'calc(var(--card-spacing) * -1)' }}><Table rowKey="id" columns={[
          { key: 'id', label: 'Invoice', render: v => <strong>#{v}</strong> },
          { key: 'date', label: 'Date' },
          { key: 'amount', label: 'Amount', numeric: true, align: 'right' },
          { key: 'status', label: 'Status', render: v => <Badge variant={v === 'Paid' ? 'default' : 'secondary'} className={v === 'Paid' ? 'ef-badge--success' : undefined}><Icon name="circle" size={7} strokeWidth={4} data-icon="inline-start" />{v}</Badge> },
          { key: 'dl', label: '', width: 50, render: (v, r) => <IconButton icon="download" label="Download PDF" size="sm" onClick={() => notify('Invoice #' + r.id + ' downloading', 'PDF on its way.')} /> },
        ]} rows={INVOICES} /></CardContent></Card>
    </div>
  );
}

Object.assign(window, { ProjectsScreen, UsageScreen, BillingScreen });
