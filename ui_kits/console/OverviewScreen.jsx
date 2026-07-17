const { Card, Badge, Button, Icon, IconButton, Avatar, Tooltip, Stat: EfStat } = window.EfolusiDesignSystem_4ffc3d;

function KpiCard({ label, value, delta, up }) {
  return (
    <Card padding={16} style={{ flex: 1 }}>
      <EfStat label={label} value={value} delta={delta} direction={up ? 'up' : 'down'} />
    </Card>
  );
}

const BARS = [42, 55, 48, 61, 58, 72, 66, 80, 74, 88, 92, 84, 96, 90, 104, 98, 112, 108, 118, 111, 124, 130, 122, 138, 132, 144, 150, 141];
function UsageChart({ notify }) {
  const [hov, setHov] = React.useState(null);
  const max = Math.max(...BARS);
  return (
    <Card title="API requests" subtitle="Last 28 days · all products" actions={<Button size="sm" variant="secondary" iconLeft="download" onClick={() => notify && notify('Export ready', 'requests-28d.csv is downloading.')}>Export</Button>} style={{ flex: 2 }}>
      <div style={{ display: 'flex', alignItems: 'flex-end', gap: 4, height: 150 }}>
        {BARS.map((v, i) => (
          <Tooltip key={i} label={(v * 113).toLocaleString() + ' requests'} style={{ flex: 1, height: '100%', alignItems: 'flex-end' }}>
            <div onMouseEnter={() => setHov(i)} onMouseLeave={() => setHov(null)}
              style={{ width: '100%', height: (v / max * 100) + '%', borderRadius: '3px 3px 0 0', background: hov === i ? 'var(--brand-700)' : i > 23 ? 'var(--brand-900)' : 'var(--sand-200)', transition: 'background var(--dur-fast) var(--ease-out)' }} />
          </Tooltip>
        ))}
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 8, fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--text-muted)' }}>
        <span>Jun 18</span><span>Jul 2</span><span>Jul 16</span>
      </div>
    </Card>
  );
}

const EVENTS = [
  ['Femi Alade', 'rotated the production API key', '2m ago', 'key-round'],
  ['June Park', 'invited sam@acme.co as Admin', '18m ago', 'mail'],
  ['Trader', 'closed BTC-EUR position at +2.4%', '1h ago', 'chart-candlestick'],
  ['Sol Reyes', 'created project Q3 launch plan', '3h ago', 'folder'],
  ['Infra', 'pg-prod-eu failover completed', '5h ago', 'server'],
];
function Activity() {
  return (
    <Card title="Activity" actions={<IconButton icon="ellipsis" label="More" size="sm" />} padding={8} style={{ flex: 1 }}>
      <div style={{ display: 'flex', flexDirection: 'column' }}>
        {EVENTS.map(([who, what, when, icon], i) => (
          <div key={i} style={{ display: 'flex', gap: 10, alignItems: 'flex-start', padding: '9px 12px', borderRadius: 'var(--radius-sm)' }}>
            <span style={{ display: 'inline-flex', width: 28, height: 28, alignItems: 'center', justifyContent: 'center', flex: 'none', borderRadius: 'var(--radius-full)', background: 'var(--sand-100)', color: 'var(--sand-700)' }}><Icon name={icon === 'key-round' ? 'lock' : icon} size={14} /></span>
            <div style={{ fontSize: 13, lineHeight: 1.45 }}>
              <span style={{ fontWeight: 600 }}>{who}</span> <span style={{ color: 'var(--text-secondary)' }}>{what}</span>
              <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 1 }}>{when}</div>
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}

function DashboardScreen({ onNewProject, notify }) {
  return (
    <div style={{ padding: 24, display: 'flex', flexDirection: 'column', gap: 20 }}>
      <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between' }}>
        <div>
          <h2 style={{ fontSize: 26, fontWeight: 680 }}>Good morning, Ada</h2>
          <p style={{ color: 'var(--text-secondary)', marginTop: 4, fontSize: 14 }}>Acme Workspace is trending up across every product.</p>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <Button variant="secondary" iconLeft="upload" onClick={() => notify && notify('Import started', "We'll email you when the CSV is mapped.")}>Import</Button>
          <Button iconLeft="plus" onClick={onNewProject}>New project</Button>
        </div>
      </div>
      <div style={{ display: 'flex', gap: 16 }}>
        <KpiCard label="Monthly recurring revenue" value="$48.2k" delta="12.4%" up />
        <KpiCard label="Active customers" value="1,284" delta="3.1%" up />
        <KpiCard label="API requests / day" value="16.3M" delta="8.9%" up />
        <KpiCard label="Churn" value="1.9%" delta="0.4pt" />
      </div>
      <div style={{ display: 'flex', gap: 16, alignItems: 'stretch' }}>
        <UsageChart notify={notify} />
        <Activity />
      </div>
    </div>
  );
}

Object.assign(window, { DashboardScreen });
