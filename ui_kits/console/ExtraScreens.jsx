const { Card, Badge, Button, Icon, IconButton, Avatar, AvatarGroup, Stat, BarChart, Progress, Table, EmptyState, Menu, KeyValueList } = window.EfolusiDesignSystem_4ffc3d;

const PROJECTS = [
  ['Q3 launch plan', 'Agent', '2 hours ago', ['Ada Obi', 'Femi Alade'], 'busy'],
  ['Billing migration', 'Infra', 'Yesterday', ['June Park', 'Ada Obi', 'Sol Reyes'], 'ok'],
  ['Onboarding videos', 'Content', '3 days ago', ['Sol Reyes'], 'ok'],
  ['EUR momentum bot', 'Trader', 'Last week', ['Femi Alade', 'June Park'], 'ok'],
];
function ProjectsScreen({ onNewProject, notify }) {
  return (
    <div style={{ padding: 24 }}>
      <div style={{ display: 'flex', alignItems: 'center', marginBottom: 16 }}>
        <span style={{ fontSize: 13, color: 'var(--text-muted)' }}>{PROJECTS.length} projects · all products</span>
        <Button style={{ marginLeft: 'auto' }} iconLeft="plus" onClick={onNewProject}>New project</Button>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 16 }}>
        {PROJECTS.map(([name, product, when, people, state]) => (
          <Card key={name} interactive padding={18} onClick={() => notify('Opening ' + name, 'Projects are a demo surface in this kit.')}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ fontSize: 15, fontWeight: 600, flex: 1 }}>{name}</span>
              <Menu align="right" trigger={<IconButton icon="ellipsis" label="More" size="sm" />} onSelect={id => notify(id === 'archive' ? 'Project archived' : 'Link copied', name)} items={[
                { id: 'copy', label: 'Copy link', icon: 'link' },
                { id: 'archive', label: 'Archive', icon: 'package', danger: true },
              ]} />
            </div>
            <div style={{ display: 'flex', gap: 6, marginTop: 8 }}>
              <Badge tone={state === 'busy' ? 'accent' : 'neutral'} dot={state === 'busy'}>{product}</Badge>
              {state === 'busy' && <Badge tone="success" dot>Agent running</Badge>}
            </div>
            <div style={{ display: 'flex', alignItems: 'center', marginTop: 16 }}>
              <AvatarGroup>{people.map(p => <Avatar key={p} name={p} size={26} />)}</AvatarGroup>
              <span style={{ marginLeft: 'auto', fontSize: 12, color: 'var(--text-muted)' }}>{when}</span>
            </div>
          </Card>
        ))}
        <EmptyState bordered icon="plus" title="New project" description="Group keys, environments, and usage." action={<Button size="sm" variant="secondary" iconLeft="plus" onClick={onNewProject}>Create</Button>} style={{ padding: '28px 24px' }} />
      </div>
    </div>
  );
}

const USAGE_BY_PRODUCT = [
  { id: 'agent', product: 'Agent', unit: 'tasks', used: '1,204', quota: '5,000', pct: 24 },
  { id: 'infra', product: 'Infra', unit: 'tunnels', used: '14', quota: '25', pct: 56 },
  { id: 'content', product: 'Content', unit: 'renders', used: '8,912', quota: '10,000', pct: 89 },
  { id: 'tools', product: 'Tools', unit: 'conversions', used: '412', quota: '2,000', pct: 21 },
];
function UsageScreen() {
  return (
    <div style={{ padding: 24, display: 'flex', flexDirection: 'column', gap: 16 }}>
      <div style={{ display: 'flex', gap: 16 }}>
        <Card padding={16} style={{ flex: 1 }}><Stat label="API requests · 30 days" value="489M" delta="8.9%" direction="up" /></Card>
        <Card padding={16} style={{ flex: 1 }}><Stat label="Peak day" value="21.4M" hint="Jul 9 · product launch" /></Card>
        <Card padding={16} style={{ flex: 1 }}><Stat label="Plan quota used" value="61%" hint="Resets Aug 1" /></Card>
      </div>
      <Card title="Requests per day" subtitle="Last 30 days · ink bars are this week">
        <BarChart height={150} highlightLast={7} labels={['Jun 17', 'Jul 1', 'Jul 16']} formatValue={v => (v / 10).toFixed(1) + 'M requests'}
          data={[82, 95, 88, 101, 98, 112, 106, 120, 114, 128, 132, 124, 136, 130, 144, 138, 152, 148, 158, 151, 164, 170, 162, 178, 172, 184, 190, 181, 196, 214]} />
      </Card>
      <Card title="By product" padding={20}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16, maxWidth: 560 }}>
          {USAGE_BY_PRODUCT.map(u => (
            <Progress key={u.id} label={u.product} value={u.pct} showValue tone={u.pct > 85 ? 'warning' : 'default'} format={() => u.used + ' of ' + u.quota + ' ' + u.unit} />
          ))}
        </div>
      </Card>
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
    <div style={{ padding: 24, display: 'flex', flexDirection: 'column', gap: 16, maxWidth: 900 }}>
      <div style={{ display: 'flex', gap: 16 }}>
        <Card padding={20} style={{ flex: 1.2 }} title="Plan" actions={<Badge tone="accent">Growth</Badge>}>
          <KeyValueList labelWidth={130} items={[
            { label: 'Price', value: '€12 per seat / month', mono: true },
            { label: 'Seats', value: '4 of 5 used' },
            { label: 'Next invoice', value: 'Aug 1, 2026 · ~€1,240', mono: true },
          ]} />
          <div style={{ display: 'flex', gap: 8, marginTop: 16 }}>
            <Button size="sm" variant="secondary" onClick={() => notify('Plan options sent', 'Compare Growth vs Scale in your inbox.')}>Change plan</Button>
            <Button size="sm" variant="ghost" onClick={() => notify('Seats updated', 'You now have 6 seats.')}>Add seats</Button>
          </div>
        </Card>
        <Card padding={20} style={{ flex: 1 }} title="Payment method">
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <span style={{ display: 'inline-flex', width: 38, height: 38, alignItems: 'center', justifyContent: 'center', borderRadius: 'var(--radius-sm)', background: 'var(--surface-sunken)', color: 'var(--sand-700)' }}><Icon name="credit-card" size={18} /></span>
            <div>
              <div style={{ fontSize: 14, fontWeight: 600, fontFamily: 'var(--font-mono)' }}>•••• 4242</div>
              <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>Expires 08 / 28</div>
            </div>
          </div>
          <Button size="sm" variant="secondary" iconLeft="pencil" style={{ marginTop: 16 }} onClick={() => notify('Secure link sent', 'Update your card from the email we just sent.')}>Update card</Button>
        </Card>
      </div>
      <Card padding={0} title="Invoices" subtitle="Also emailed to billing@acme.co on the 1st.">
        <Table rowKey="id" columns={[
          { key: 'id', label: 'Invoice', render: v => <strong>#{v}</strong> },
          { key: 'date', label: 'Date' },
          { key: 'amount', label: 'Amount', numeric: true, align: 'right' },
          { key: 'status', label: 'Status', render: v => <Badge tone={v === 'Paid' ? 'success' : 'neutral'} dot>{v}</Badge> },
          { key: 'dl', label: '', width: 50, render: (v, r) => <IconButton icon="download" label="Download PDF" size="sm" onClick={() => notify('Invoice #' + r.id + ' downloading', 'PDF on its way.')} /> },
        ]} rows={INVOICES} />
      </Card>
    </div>
  );
}

Object.assign(window, { ProjectsScreen, UsageScreen, BillingScreen });
