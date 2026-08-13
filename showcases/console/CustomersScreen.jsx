const { Card, CardContent, Badge, Button, Input, NativeSelect, NativeSelectOption, Checkbox, Avatar, AvatarFallback, Icon, IconButton, Tag, DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, Pagination, PaginationContent, PaginationEllipsis, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious, Drawer, DrawerContent, DrawerHeader, DrawerTitle, DrawerDescription, DrawerFooter, DrawerClose, KeyValueList, Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, Sparkline, Field, FieldLabel } = window.EfolusiDesignSystem_4ffc3d;

function CustomerActionMenu({ trigger, items, onSelect, align = 'start' }) { return <DropdownMenu><DropdownMenuTrigger asChild>{trigger}</DropdownMenuTrigger><DropdownMenuContent align={align}>{items.map((item, index) => item === 'separator' ? <DropdownMenuSeparator key={'separator-' + index} /> : <DropdownMenuItem key={item.id} disabled={item.disabled} variant={item.danger ? 'destructive' : 'default'} onSelect={() => { onSelect?.(item.id); item.onClick?.(); }}>{item.icon ? <Icon name={item.icon} size={15} /> : null}{item.label}</DropdownMenuItem>)}</DropdownMenuContent></DropdownMenu>; }

const SEED = [
  ['Acme Robotics', 'ada@acmerobotics.com', 'Growth', 'Active', '$1,240', 'AI agents'],
  ['Bloom Health', 'ops@bloomhealth.io', 'Scale', 'Active', '$3,860', 'Infrastructure'],
  ['Cardinal Freight', 'it@cardinalfreight.com', 'Growth', 'Trial', '$0', 'Trading'],
  ['Delta Studios', 'hello@deltastudios.tv', 'Starter', 'Active', '$96', 'Automation'],
  ['Everline', 'admin@everline.app', 'Scale', 'Past due', '$2,410', 'Finance'],
  ['Foundry Labs', 'team@foundrylabs.dev', 'Growth', 'Active', '$1,870', 'File tools'],
  ['Golden Gate Coffee', 'sam@ggcoffee.com', 'Starter', 'Churned', '$0', 'AI agents'],
].map(([name, email, plan, status, mrr, product], i) => ({ id: i + 1, name, email, plan, status, mrr, product }));
const BADGE_CLASS = { Active: 'ef-badge--success', Trial: 'ef-badge--accent', 'Past due': 'ef-badge--warning' };
const STATUSES = ['Any status', 'Active', 'Trial', 'Past due', 'Churned'];

function CustomersScreen({ notify }) {
  const [rows, setRows] = React.useState(SEED);
  const [checked, setChecked] = React.useState([]);
  const [q, setQ] = React.useState('');
  const [plan, setPlan] = React.useState('All plans');
  const [status, setStatus] = React.useState('Any status');
  const [page, setPage] = React.useState(1);
  const [sel, setSel] = React.useState(null);
  const [adding, setAdding] = React.useState(false);
  const [form, setForm] = React.useState({ name: '', email: '', plan: 'Starter' });
  const shown = rows.filter(r => r.name.toLowerCase().includes(q.toLowerCase()) && (plan === 'All plans' || r.plan === plan) && (status === 'Any status' || r.status === status));
  const toggle = id => setChecked(c => c.includes(id) ? c.filter(x => x !== id) : [...c, id]);
  const markChurned = id => { setRows(rs => rs.map(r => r.id === id ? { ...r, status: 'Churned', mrr: '$0' } : r)); notify('Marked churned', 'MRR moved to $0 for this customer.'); };
  const addCustomer = () => {
    if (!form.name.trim()) return;
    setRows(rs => [{ id: Date.now(), name: form.name, email: form.email || 'hello@' + form.name.toLowerCase().replace(/\s+/g, '') + '.com', plan: form.plan, status: 'Trial', mrr: '$0', product: 'AI agents' }, ...rs]);
    setAdding(false); setForm({ name: '', email: '', plan: 'Starter' });
    notify('Customer added', form.name + ' starts on a 14-day trial.');
  };
  const th = { textAlign: 'left', padding: '10px 16px', fontSize: 11, fontWeight: 600, letterSpacing: '0.06em', textTransform: 'uppercase', color: 'var(--text-muted)', borderBottom: '1px solid var(--border-default)', whiteSpace: 'nowrap' };
  const td = { padding: '12px 16px', fontSize: 14, borderBottom: '1px solid var(--sand-100)', whiteSpace: 'nowrap' };
  return (
    <div style={{ padding: 24, display: 'flex', flexDirection: 'column', gap: 16 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <div style={{ width: 280 }}><Input size="sm" placeholder="Search customers…" iconLeft="search" value={q} onChange={e => setQ(e.target.value)} /></div>
        <NativeSelect size="sm" value={plan} onChange={e => setPlan(e.target.value)} aria-label="Plan filter" style={{ width: 130 }}>{['All plans', 'Starter', 'Growth', 'Scale'].map(value => <NativeSelectOption key={value} value={value}>{value}</NativeSelectOption>)}</NativeSelect>
        <CustomerActionMenu trigger={<Tag icon="funnel" onClick={() => {}}>{status}</Tag>} items={STATUSES.map(s => ({ id: s, label: s, icon: s === status ? 'check' : undefined }))} onSelect={setStatus} />
        <div style={{ marginLeft: 'auto', display: 'flex', gap: 8, alignItems: 'center' }}>
          {checked.length > 0 && <Button size="sm" variant="secondary" iconLeft="mail" onClick={() => { notify('Email drafted', checked.length + ' recipients added to the draft.'); setChecked([]); }}>Email {checked.length} selected</Button>}
          <Button size="sm" iconLeft="plus" onClick={() => setAdding(true)}>Add customer</Button>
        </div>
      </div>
      <Card><CardContent style={{ paddingInline: 0, marginBlock: 'calc(var(--card-spacing) * -1)' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead><tr>
            <th style={{ ...th, width: 40, paddingRight: 0 }}><Checkbox checked={checked.length === shown.length && shown.length > 0} onChange={() => setChecked(checked.length === shown.length ? [] : shown.map(r => r.id))} /></th>
            <th style={th}>Customer</th><th style={th}>Plan</th><th style={th}>Status</th><th style={th}>MRR</th><th style={th}>Product</th><th style={{ ...th, width: 40 }}></th>
          </tr></thead>
          <tbody>
            {shown.map(r => (
              <tr key={r.id} style={{ background: checked.includes(r.id) ? 'var(--accent-subtle)' : 'transparent', cursor: 'pointer' }}>
                <td style={{ ...td, paddingRight: 0 }} onClick={e => e.stopPropagation()}><Checkbox checked={checked.includes(r.id)} onChange={() => toggle(r.id)} /></td>
                <td style={td} onClick={() => setSel(r)}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <Avatar><AvatarFallback>{r.name.split(/\s+/).map(part => part[0]).slice(0, 2).join('')}</AvatarFallback></Avatar>
                    <div><div style={{ fontWeight: 600 }}>{r.name}</div><div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{r.email}</div></div>
                  </div>
                </td>
                <td style={td} onClick={() => setSel(r)}>{r.plan}</td>
                <td style={td} onClick={() => setSel(r)}><Badge variant={r.status === 'Churned' ? 'secondary' : 'default'} className={BADGE_CLASS[r.status]}><Icon name="circle" size={7} strokeWidth={4} data-icon="inline-start" />{r.status}</Badge></td>
                <td style={{ ...td, fontFamily: 'var(--font-mono)', fontSize: 13 }} onClick={() => setSel(r)}>{r.mrr}</td>
                <td style={td} onClick={() => setSel(r)}><span style={{ fontSize: 13, color: 'var(--text-secondary)' }}>{r.product}</span></td>
                <td style={td} onClick={e => e.stopPropagation()}>
                  <CustomerActionMenu align="end" trigger={<IconButton icon="ellipsis" label="More" size="sm" />} onSelect={id => { if (id === 'view') setSel(r); if (id === 'email') notify('Email drafted', 'To ' + r.email); if (id === 'churn') markChurned(r.id); }} items={[
                    { id: 'view', label: 'View details', icon: 'external-link' },
                    { id: 'email', label: 'Email customer', icon: 'mail' },
                    'separator',
                    { id: 'churn', label: 'Mark churned', icon: 'x', danger: true, disabled: r.status === 'Churned' },
                  ]} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {shown.length === 0 && <div style={{ padding: '28px 16px', textAlign: 'center', fontSize: 13, color: 'var(--text-muted)' }}>No customers match — clear the search or filters.</div>}
        <div style={{ display: 'flex', alignItems: 'center', padding: '10px 16px', fontSize: 13, color: 'var(--text-muted)' }}>
          <span>{shown.length} of 128 customers</span>
          <Pagination style={{ marginLeft: 'auto' }}><PaginationContent>
            <PaginationItem><PaginationPrevious href={`#customers-page-${page - 1}`} aria-disabled={page === 1} onClick={event => { event.preventDefault(); setPage(value => Math.max(1, value - 1)); }} /></PaginationItem>
            <PaginationItem><PaginationLink href="#customers-page-1" isActive={page === 1} onClick={event => { event.preventDefault(); setPage(1); }}>1</PaginationLink></PaginationItem>
            {page > 2 && <PaginationItem><PaginationEllipsis /></PaginationItem>}
            {page > 1 && page < 19 && <PaginationItem><PaginationLink href={`#customers-page-${page}`} isActive>{page}</PaginationLink></PaginationItem>}
            {page < 18 && <PaginationItem><PaginationEllipsis /></PaginationItem>}
            <PaginationItem><PaginationLink href="#customers-page-19" isActive={page === 19} onClick={event => { event.preventDefault(); setPage(19); }}>19</PaginationLink></PaginationItem>
            <PaginationItem><PaginationNext href={`#customers-page-${page + 1}`} aria-disabled={page === 19} onClick={event => { event.preventDefault(); setPage(value => Math.min(19, value + 1)); }} /></PaginationItem>
          </PaginationContent></Pagination>
        </div>
      </CardContent></Card>
      <Drawer open={!!sel} onOpenChange={open => { if (!open) setSel(null); }} direction="right"><DrawerContent style={{ width: 400 }}><DrawerHeader><DrawerTitle>{sel ? sel.name : ''}</DrawerTitle><DrawerDescription>Customer account and recent usage.</DrawerDescription></DrawerHeader>
        {sel && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 18, padding: 20 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <Avatar size="lg"><AvatarFallback>{sel.name.split(/\s+/).map(part => part[0]).slice(0, 2).join('')}</AvatarFallback></Avatar>
              <div>
                <div style={{ fontSize: 16, fontWeight: 600 }}>{sel.name}</div>
                <Badge variant={sel.status === 'Churned' ? 'secondary' : 'default'} className={BADGE_CLASS[sel.status]}><Icon name="circle" size={7} strokeWidth={4} data-icon="inline-start" />{sel.status}</Badge>
              </div>
            </div>
            <KeyValueList labelWidth={110} items={[
              { label: 'Email', value: sel.email, mono: true },
              { label: 'Plan', value: sel.plan },
              { label: 'MRR', value: sel.mrr, mono: true },
              { label: 'Main product', value: sel.product },
              { label: 'Customer since', value: 'Feb 12, 2026' },
            ]} />
            <div>
              <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 6 }}>Usage · 12 weeks</div>
              <Sparkline data={[12, 18, 15, 22, 26, 24, 31, 29, 36, 34, 41, 46]} width={340} height={56} />
            </div>
          </div>
        )}
        {sel && <DrawerFooter><DrawerClose asChild><Button variant="ghost">Close</Button></DrawerClose><Button variant="secondary" iconLeft="mail" onClick={() => { notify('Email drafted', 'To ' + sel.email); setSel(null); }}>Email</Button></DrawerFooter>}
      </DrawerContent></Drawer>
      <Dialog open={adding} onOpenChange={setAdding}><DialogContent><DialogHeader><DialogTitle>Add customer</DialogTitle><DialogDescription>They'll start on a 14-day trial.</DialogDescription></DialogHeader><div className="ef-dialog__body"><div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <Input label="Company" placeholder="Acme Robotics" autoFocus value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} />
          <Input label="Billing email" type="email" placeholder="ops@acme.co" iconLeft="mail" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} />
          <Field><FieldLabel htmlFor="customer-plan">Plan</FieldLabel><NativeSelect id="customer-plan" value={form.plan} onChange={e => setForm({ ...form, plan: e.target.value })}>{['Starter', 'Growth', 'Scale'].map(value => <NativeSelectOption key={value} value={value}>{value}</NativeSelectOption>)}</NativeSelect></Field>
        </div></div><DialogFooter><DialogClose asChild><Button variant="ghost">Cancel</Button></DialogClose><Button onClick={addCustomer}>Add customer</Button></DialogFooter></DialogContent></Dialog>
    </div>
  );
}

Object.assign(window, { CustomersScreen });
