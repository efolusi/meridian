const { Stat, Sparkline, BarChart, SegmentedControl, Table, Badge, Switch, Slider, Progress, Avatar, Toast, ToastStack, Card, Button, StatusDot, Divider, Icon, Menu, IconButton } = window.EfolusiDesignSystem_4ffc3d;

const SERIES = { '24h': [98, 99, 97, 101, 103, 102, 105, 104, 107, 106, 109, 112], '7d': [88, 92, 90, 95, 93, 99, 104, 101, 106, 110, 108, 112], '30d': [72, 78, 75, 82, 86, 84, 90, 95, 92, 101, 107, 112] };
const POSITIONS = [
  { id: 1, pair: 'BTC-EUR', side: 'Long', size: '0.42', entry: '58,120', mark: '61,480', pnl: '+2,410', up: true, spark: [58, 59, 58, 60, 61, 60, 61, 62] },
  { id: 2, pair: 'ETH-EUR', side: 'Long', size: '6.10', entry: '2,940', mark: '3,065', pnl: '+763', up: true, spark: [29, 30, 29, 30, 31, 30, 31, 31] },
  { id: 3, pair: 'SOL-EUR', side: 'Short', size: '84.0', entry: '132.40', mark: '138.15', pnl: '\u2212483', up: false, spark: [132, 133, 135, 134, 136, 137, 138, 138] },
];

function TraderScreen() {
  const [range, setRange] = React.useState('7d');
  const [auto, setAuto] = React.useState(true);
  const [risk, setRisk] = React.useState(4);
  const [followed, setFollowed] = React.useState([]);
  const [positions, setPositions] = React.useState(POSITIONS);
  const [toast, setToast] = React.useState(null);
  const notify = t => { setToast(t); setTimeout(() => setToast(null), 4000); };
  const follow = n => { setFollowed(f => f.includes(n) ? f.filter(x => x !== n) : [...f, n]); };
  return (
    <div style={{ minHeight: '100vh' }}>
      <div style={{ maxWidth: 1180, margin: '0 auto', padding: '28px 32px 60px' }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 24 }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <a href="../console/index.html" title="Back to Console" style={{ display: 'inline-flex' }}><img src="../../assets/logo.png" alt="" style={{ width: 30, height: 30 }} /></a>
              <h1 style={{ fontSize: 24, fontWeight: 680 }}>Trader</h1>
              <StatusDot state={auto ? 'busy' : 'off'} pulse={auto} label={auto ? 'Robot active' : 'Robot paused'} />
            </div>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 12, marginTop: 16 }}>
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: 40, fontWeight: 600, letterSpacing: '-0.01em' }}>€24,318.90</span>
              <Badge tone="success" dot>+12.4% · {range}</Badge>
            </div>
            <Sparkline data={SERIES[range]} width={420} height={72} strokeWidth={1.75} style={{ marginTop: 12 }} />
          </div>
          <div style={{ marginLeft: 'auto', display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 12 }}>
            <SegmentedControl options={['24h', '7d', '30d']} value={range} onChange={setRange} />
            <Card padding={14} style={{ width: 240 }}>
              <div style={{ fontSize: 11, fontWeight: 600, letterSpacing: '0.06em', textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: 8 }}>Daily volume</div>
              <BarChart height={64} data={[42, 61, 38, 74, 52, 88, 66, 91, 58, 80, 96, 71, 84, 104]} highlightLast={3} labels={['Jul 3', 'Jul 16']} formatValue={v => '€' + (v * 113).toLocaleString()} />
            </Card>
          </div>
        </div>
        <div style={{ display: 'flex', gap: 20, marginTop: 28, alignItems: 'flex-start' }}>
          <Card padding={0} title="Open positions" subtitle="Robot manages exits inside your risk cap." style={{ flex: 1.8 }}>
            <Table rowKey="id" columns={[
              { key: 'pair', label: 'Pair', render: v => <strong>{v}</strong> },
              { key: 'side', label: 'Side', render: v => <Badge tone={v === 'Long' ? 'success' : 'warning'}>{v}</Badge> },
              { key: 'size', label: 'Size', numeric: true, align: 'right' },
              { key: 'entry', label: 'Entry', numeric: true, align: 'right' },
              { key: 'mark', label: 'Mark', numeric: true, align: 'right' },
              { key: 'pnl', label: 'P&L (€)', numeric: true, align: 'right', render: (v, r) => <span style={{ color: r.up ? 'var(--success-600)' : 'var(--danger-600)', fontFamily: 'var(--font-mono)', fontSize: 13 }}>{v}</span> },
              { key: 'spark', label: '', width: 100, render: (v, r) => <Sparkline data={v} width={84} height={24} direction={r.up ? 'up' : 'down'} /> },
              { key: 'menu', label: '', width: 44, render: (v, r) => <Menu align="right" trigger={<IconButton icon="ellipsis" label="More" size="sm" />} onSelect={id => { if (id === 'close') { setPositions(ps => ps.filter(p => p.id !== r.id)); notify('Position closed'); } else notify('Order ticket opened'); }} items={[{ id: 'ticket', label: 'Adjust position', icon: 'pencil' }, 'separator', { id: 'close', label: 'Close position', icon: 'x', danger: true }]} /> },
            ]} rows={positions} />
          </Card>
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 16 }}>
            <Card padding={18} title="Strategy" actions={<Switch checked={auto} onChange={e => { setAuto(e.target.checked); notify(e.target.checked ? 'Robot resumed' : 'Robot paused'); }} />}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                <div style={{ fontSize: 13, color: 'var(--text-secondary)' }}>Momentum · EUR pairs · max 3 open positions. Every trade is logged and auditable.</div>
                <Slider label="Risk per trade" showValue format={v => v + '%'} min={1} max={10} value={risk} onChange={setRisk} />
                <Progress label="Monthly drawdown cap" value={31} showValue tone={risk > 7 ? 'warning' : 'default'} format={() => '\u22123.1% of \u221210%'} />
              </div>
            </Card>
            <Card padding={12} title="Social signals" subtitle="Traders you can mirror — with their real track record.">
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                {[['Femi Alade', '+31.2% this quarter \u00b7 low risk', 'up'], ['June Park', '+18.7% this quarter \u00b7 medium risk', 'up'], ['Sol Reyes', '\u22124.2% this quarter \u00b7 high risk', 'down']].map(([n, meta, dir]) => (
                  <div key={n} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '9px 8px' }}>
                    <Avatar name={n} size={30} />
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 13, fontWeight: 600 }}>{n}</div>
                      <div style={{ fontSize: 12, color: dir === 'up' ? 'var(--success-600)' : 'var(--danger-600)' }}>{meta}</div>
                    </div>
                    <Button size="sm" variant={followed.includes(n) ? 'secondary' : 'ghost'} iconLeft={followed.includes(n) ? 'check' : 'plus'} onClick={() => follow(n)}>{followed.includes(n) ? 'Mirroring' : 'Mirror'}</Button>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        </div>
      </div>
      <ToastStack>{toast && <Toast tone="success" title={toast} description="Change applies to the next trade." onClose={() => setToast(null)} />}</ToastStack>
    </div>
  );
}

Object.assign(window, { TraderScreen });
