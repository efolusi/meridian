const { Banner, Stat, Sparkline, SegmentedControl, Table, StatusDot, Drawer, KeyValueList, CopyField, Terminal, Dialog, Card, Button, Select, Input, Badge, Icon, Toast, ToastStack } = window.EfolusiDesignSystem_4ffc3d;

const RESOURCES = [
  { id: 'pg', name: 'pg-prod-eu', kind: 'PostgreSQL', icon: 'database', region: 'eu-west-1', status: 'ok', latency: '38 ms' },
  { id: 'redis', name: 'cache-main', kind: 'Redis', icon: 'hard-drive', region: 'eu-west-1', status: 'ok', latency: '2 ms' },
  { id: 'aws', name: 'aws-primary', kind: 'AWS account', icon: 'cloud', region: 'eu-west-1', status: 'ok', latency: '—' },
  { id: 'ssh', name: 'worker-04', kind: 'SSH host', icon: 'terminal', region: 'fra1', status: 'warn', latency: '212 ms' },
  { id: 'k8s', name: 'render-cluster', kind: 'Kubernetes', icon: 'server', region: 'us-east-1', status: 'ok', latency: '61 ms' },
];
const DOMAINS = [
  { id: 'apex', name: 'efolusi.com', kind: 'A record', icon: 'globe', region: '—', status: 'ok', latency: '76.76.21.21' },
  { id: 'app', name: 'app.efolusi.com', kind: 'CNAME', icon: 'globe', region: '—', status: 'err', latency: 'missing' },
  { id: 'docs', name: 'docs.efolusi.com', kind: 'CNAME', icon: 'book-open', region: '—', status: 'ok', latency: 'edge.efolusi.com' },
];
const CERTS = [
  { id: 'c1', name: '*.efolusi.com', kind: 'Wildcard', icon: 'shield-check', region: 'Auto-renews', status: 'ok', latency: 'Oct 2, 2026' },
  { id: 'c2', name: 'pay.efolusi.com', kind: 'Single', icon: 'shield-check', region: 'Manual', status: 'warn', latency: 'Jul 29, 2026' },
];
const STATUS_LABEL = { ok: 'Healthy', warn: 'Degraded', err: 'Action needed' };
const COLS_LAST = { resources: 'Latency', domains: 'Value', certificates: 'Expires' };

function InfraScreen() {
  const [tab, setTab] = React.useState('resources');
  const [banner, setBanner] = React.useState(true);
  const [sel, setSel] = React.useState(null);
  const [connect, setConnect] = React.useState(false);
  const [cli, setCli] = React.useState(false);
  const [extra, setExtra] = React.useState([]);
  const [toast, setToast] = React.useState(null);
  const notify = (title, description) => { setToast({ title, description }); setTimeout(() => setToast(null), 4000); };
  const rows = tab === 'resources' ? [...RESOURCES, ...extra] : tab === 'domains' ? DOMAINS : CERTS;
  return (
    <div style={{ height: '100vh', display: 'flex', flexDirection: 'column' }}>
      {banner && <Banner tone="warning" icon="triangle-alert" action="View incident" onAction={() => { setTab('resources'); setSel(RESOURCES[3]); }} onDismiss={() => setBanner(false)}><strong>worker-04 is degraded.</strong> P95 latency up 4× since 08:12 UTC.</Banner>}
      <div style={{ flex: 1, overflowY: 'auto' }}>
        <div style={{ maxWidth: 1180, margin: '0 auto', padding: '28px 32px 60px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <a href="../console/index.html" title="Back to Console" style={{ display: 'inline-flex' }}><img src="../../assets/logo.png" alt="" style={{ width: 30, height: 30 }} /></a>
            <h1 style={{ fontSize: 24, fontWeight: 680 }}>Infra</h1>
            <StatusDot state="warn" pulse label="1 incident" />
            <div style={{ marginLeft: 'auto', display: 'flex', gap: 8 }}>
              <Button variant="secondary" iconLeft="terminal" onClick={() => setCli(true)}>Open CLI</Button>
              <Button iconLeft="plus" onClick={() => setConnect(true)}>Connect resource</Button>
            </div>
          </div>
          <div style={{ display: 'flex', gap: 16, marginTop: 22 }}>
            <Card padding={16} style={{ flex: 1 }}><Stat label="Connected resources" value="14" hint="5 kinds · 3 regions" /></Card>
            <Card padding={16} style={{ flex: 1 }}><Stat label="Uptime · 90 days" value="99.98%" delta="0.01pt" direction="up" /></Card>
            <Card padding={16} style={{ flex: 1 }}><Stat label="P50 latency" value="38 ms" delta="6 ms" direction="down" /><Sparkline data={[52, 49, 51, 47, 44, 46, 41, 40, 42, 38]} direction="up" width={150} style={{ marginTop: 10 }} /></Card>
            <Card padding={16} style={{ flex: 1 }}><Stat label="Open incidents" value="1" hint="worker-04 · degraded" /></Card>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginTop: 26 }}>
            <SegmentedControl value={tab} onChange={t => { setTab(t); setSel(null); }} options={[
              { id: 'resources', label: 'Resources', icon: 'server' },
              { id: 'domains', label: 'Domains & DNS', icon: 'globe' },
              { id: 'certificates', label: 'Certificates', icon: 'shield-check' },
            ]} />
            <span style={{ fontSize: 13, color: 'var(--text-muted)' }}>{rows.length} shown</span>
          </div>
          <Card padding={0} style={{ marginTop: 14 }}>
            <Table rowKey="id" onRowClick={r => setSel(r)} columns={[
              { key: 'name', label: 'Name', render: (v, r) => <span style={{ display: 'inline-flex', alignItems: 'center', gap: 10, fontWeight: 600 }}><span style={{ display: 'inline-flex', width: 30, height: 30, alignItems: 'center', justifyContent: 'center', borderRadius: 'var(--radius-sm)', background: 'var(--surface-sunken)', color: 'var(--sand-700)' }}><Icon name={r.icon} size={15} /></span>{v}</span> },
              { key: 'kind', label: 'Type' },
              { key: 'region', label: tab === 'resources' ? 'Region' : 'Notes' },
              { key: 'status', label: 'Status', render: v => <StatusDot state={v} pulse={v !== 'ok'} label={STATUS_LABEL[v]} /> },
              { key: 'latency', label: COLS_LAST[tab], numeric: true, align: 'right' },
            ]} rows={rows} />
          </Card>
        </div>
      </div>
      <Drawer open={!!sel} onClose={() => setSel(null)} title={sel ? sel.name : ''} width={420}
        footer={<React.Fragment><Button variant="ghost" onClick={() => setSel(null)}>Close</Button><Button variant="danger" iconLeft="plug" onClick={() => { notify(sel.name + ' disconnected', 'The tunnel closed cleanly.'); setSel(null); }}>Disconnect</Button></React.Fragment>}>
        {sel && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
            <StatusDot state={sel.status} pulse={sel.status !== 'ok'} label={STATUS_LABEL[sel.status]} />
            <KeyValueList labelWidth={110} items={[
              { label: 'Type', value: sel.kind },
              { label: tab === 'resources' ? 'Region' : 'Notes', value: sel.region },
              { label: COLS_LAST[tab], value: sel.latency, mono: true },
              { label: 'Connected', value: 'May 3, 2026' },
            ]} />
            <CopyField label="Connection string" value={'efolusi://' + sel.id + '@edge.efolusi.com'} secret />
            <div>
              <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 8 }}>Recent activity</div>
              <Terminal maxHeight={160} lines={[
                { type: 'info', text: 'Health check passed', time: '09:41' },
                { type: sel.status === 'ok' ? 'ok' : 'err', text: sel.status === 'ok' ? '\u2713 Responding normally' : '\u2717 Slow responses detected', time: '09:40' },
                { type: 'info', text: 'Config synced', time: '08:12' },
              ]} />
            </div>
          </div>
        )}
      </Drawer>
      <Dialog open={connect} onClose={() => setConnect(false)} title="Connect a resource" description="Efolusi talks to it through an encrypted tunnel — nothing is stored."
        footer={<React.Fragment><Button variant="ghost" onClick={() => setConnect(false)}>Cancel</Button><Button iconRight="arrow-right" onClick={() => { setConnect(false); setTab('resources'); setExtra(x => [...x, { id: 'new' + x.length, name: 'db-replica-' + (x.length + 1), kind: 'PostgreSQL', icon: 'database', region: 'eu-west-1', status: 'ok', latency: '41 ms' }]); notify('Tunnel created', 'db-replica is connected and healthy.'); }}>Create tunnel</Button></React.Fragment>}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <Select label="Kind" options={['PostgreSQL', 'MySQL', 'Redis', 'SSH host', 'Kubernetes', 'AWS account', 'Domain / DNS']} />
          <Input label="Host" placeholder="db.internal.acme.co:5432" iconLeft="server" />
          <Select label="Region" options={['eu-west-1', 'us-east-1', 'fra1', 'sgp1']} />
        </div>
      </Dialog>
      <Drawer open={cli} onClose={() => setCli(false)} title="Efolusi CLI" width={480}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <CopyField label="Install" value="curl -fsSL cli.efolusi.com | sh" />
          <Terminal host="ada@acme-workspace" live maxHeight={280} lines={[
            { type: 'cmd', text: 'efolusi infra ls' },
            { type: 'out', text: '14 resources \u00b7 3 regions \u00b7 1 degraded' },
            { type: 'cmd', text: 'efolusi infra logs worker-04 --tail' },
            { type: 'err', text: '\u2717 p95 812ms (baseline 190ms)', time: '09:41:12' },
            { type: 'info', text: 'Suggestion: drain + restart with efolusi infra restart worker-04', time: '09:41:12' },
          ]} />
        </div>
      </Drawer>
      <ToastStack>{toast && <Toast tone="success" title={toast.title} description={toast.description} onClose={() => setToast(null)} />}</ToastStack>
    </div>
  );
}

Object.assign(window, { InfraScreen });
