// Meridian docs demos — chart recipes composed from the four primitives.

// @demo BarChart Revenue with range switch
export function RevenueBars() {
  const { Card, BarChart, SegmentedControl } = window.EfolusiDesignSystem_4ffc3d;
  const [range, setRange] = React.useState('12m');
  const series = {
    '30d': { labels: ['W1', 'W2', 'W3', 'W4'], data: [18, 22, 19, 26] },
    '12m': { labels: ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'], data: [42, 38, 51, 46, 62, 58, 71, 66, 80, 92, 88, 104] },
  }[range];
  return (
    <Card title="Revenue" subtitle="Recognized, USD thousands" padding={18} style={{ width: '100%', maxWidth: 560 }}
      actions={<SegmentedControl value={range} onChange={setRange} options={[{ id: '30d', label: '30d' }, { id: '12m', label: '12m' }]} />}>
      <BarChart height={160} data={series.data} labels={series.labels} highlightLast={3} formatValue={(v) => '$' + v + 'k'} />
    </Card>
  );
}

// @demo LineChart Latency with headline stat
export function LatencyTrend() {
  const { Card, LineChart, Stat } = window.EfolusiDesignSystem_4ffc3d;
  return (
    <Card padding={18} style={{ width: '100%', maxWidth: 560 }}>
      <Stat label="P95 latency" value="171 ms" delta="−27 ms" direction="down" hint="last 6 months" />
      <div style={{ marginTop: 14 }}>
        <LineChart height={140} showDots format={(v) => v + ' ms'} data={[
          { label: 'Jan', value: 240 }, { label: 'Feb', value: 228 }, { label: 'Mar', value: 214 },
          { label: 'Apr', value: 232 }, { label: 'May', value: 198 }, { label: 'Jun', value: 171 },
        ]} />
      </div>
    </Card>
  );
}

// @demo DonutChart Center figure and formatting
export function SpendDonut() {
  const { Card, DonutChart } = window.EfolusiDesignSystem_4ffc3d;
  const data = [
    { label: 'Agent runs', value: 2900 },
    { label: 'Storage', value: 1100 },
    { label: 'Egress', value: 820 },
  ];
  const total = data.reduce((a, d) => a + d.value, 0);
  return (
    <Card title="Spend this month" padding={18} style={{ width: '100%', maxWidth: 420 }}>
      <div style={{ display: 'flex', justifyContent: 'center' }}>
        <DonutChart size={150} data={data} centerValue={'$' + (total / 1000).toFixed(1) + 'k'} centerLabel="total" format={(v) => '$' + v.toLocaleString()} />
      </div>
    </Card>
  );
}

// @demo Sparkline KPI cards
export function KpiRow() {
  const { Card, Stat, Sparkline } = window.EfolusiDesignSystem_4ffc3d;
  const kpis = [
    { label: 'Runs', value: '12,480', delta: '+12.4%', direction: 'up', series: [3, 4, 3.6, 5, 5.4, 6.2, 6, 7.1] },
    { label: 'Success rate', value: '98.2%', delta: '+0.4pt', direction: 'up', series: [5, 5.1, 5.4, 5.2, 5.6, 5.8, 5.7, 6] },
    { label: 'Cost per run', value: '$0.39', delta: '−4.1%', direction: 'down', series: [7.2, 6.8, 7, 6.1, 5.6, 5.9, 4.8, 4.2] },
  ];
  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 14, width: '100%', maxWidth: 640 }}>
      {kpis.map((k) => (
        <Card key={k.label} padding={16}>
          <Stat label={k.label} value={k.value} delta={k.delta} direction={k.direction} />
          <div style={{ marginTop: 10 }}><Sparkline data={k.series} width={140} height={30} /></div>
        </Card>
      ))}
    </div>
  );
}

// @demo Sparkline In table cells
export function PositionsTable() {
  const { Table, Sparkline, Badge } = window.EfolusiDesignSystem_4ffc3d;
  return (
    <div style={{ width: '100%', maxWidth: 620 }}>
      <Table rowKey="id" columns={[
        { key: 'name', label: 'Position' },
        { key: 'pl', label: 'P&L', numeric: true, align: 'right', render: (v) => <span style={{ color: v.startsWith('+') ? 'var(--success-600, var(--text-primary))' : 'var(--danger-600)' }}>{v}</span> },
        { key: 'trend', label: '30d', render: (v) => <Sparkline data={v} width={96} height={24} /> },
        { key: 'status', label: '', render: (v) => <Badge tone={v === 'Auto' ? 'accent' : 'neutral'}>{v}</Badge> },
      ]} rows={[
        { id: 'a', name: 'EUR / USD', pl: '+$1,240', trend: [3, 4, 3.6, 5, 5.4, 6.2, 6, 7.1], status: 'Auto' },
        { id: 'b', name: 'Gold spot', pl: '+$310', trend: [4, 4.4, 4.2, 4.8, 5, 5.2, 5.1, 5.6], status: 'Manual' },
        { id: 'c', name: 'BTC / USD', pl: '−$580', trend: [7.2, 6.8, 7, 6.1, 5.6, 5.9, 4.8, 4.2], status: 'Auto' },
      ]} />
    </div>
  );
}

// @demo BarChart Dark-scoped panel
export function DarkPanel() {
  const { Card, BarChart } = window.EfolusiDesignSystem_4ffc3d;
  return (
    <div data-theme="dark" style={{ width: '100%', maxWidth: 560, borderRadius: 'var(--radius-lg)', overflow: 'hidden' }}>
      <div style={{ background: 'var(--surface-page)', padding: 18 }}>
        <Card title="Night shift" subtitle="Same component, data-theme=&quot;dark&quot; on the wrapper" padding={18}>
          <BarChart height={140} data={[42, 38, 51, 46, 62, 58, 71, 80]} labels={['Mar','Apr','May','Jun','Jul','Aug','Sep','Oct']} highlightLast={2} />
        </Card>
      </div>
    </div>
  );
}
