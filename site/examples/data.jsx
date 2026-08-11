// Meridian docs demos — data.

// @demo BarChart Weekly runs
export function BarChartDemo() {
  const { BarChart } = window.EfolusiDesignSystem_4ffc3d;
  return (
    <div style={{ width: '100%', maxWidth: 460 }}>
      <BarChart height={150} highlightLast={1} labels={['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']}
        data={[42, 58, 51, 74, 66, 30, 89]} format={(v) => v + ' runs'} />
    </div>
  );
}

// @demo DonutChart Share of spend
export function DonutChartDemo() {
  const { DonutChart } = window.EfolusiDesignSystem_4ffc3d;
  return <DonutChart size={160} centerLabel="This month" centerValue="$4,820"
    data={[
      { label: 'Agent runs', value: 2900 },
      { label: 'Storage', value: 1100 },
      { label: 'Egress', value: 820 },
    ]} format={(v) => '$' + v.toLocaleString()} />;
}

// @demo Empty Nothing here yet
export function EmptyStateDemo() {
  const { Empty, EmptyContent, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle, Button, Icon } = window.EfolusiDesignSystem_4ffc3d;
  return (
    <div style={{ width: '100%', maxWidth: 460 }}>
      <Empty className="ef-empty--bordered">
        <EmptyHeader><EmptyMedia variant="icon"><Icon name="bot" /></EmptyMedia><EmptyTitle>No agents yet</EmptyTitle><EmptyDescription>Create your first agent from a template — most teams start with the inbox triager.</EmptyDescription></EmptyHeader>
        <EmptyContent><Button iconLeft="plus">New agent</Button></EmptyContent>
      </Empty>
    </div>
  );
}

// @demo KeyValueList Metadata pairs
export function KeyValueListDemo() {
  const { KeyValueList, Badge } = window.EfolusiDesignSystem_4ffc3d;
  return (
    <div style={{ width: '100%', maxWidth: 440 }}>
      <KeyValueList labelWidth={130} items={[
        { label: 'Status', value: <Badge tone="success" dot>Healthy</Badge> },
        { label: 'Region', value: 'eu-west-1' },
        { label: 'Endpoint', value: 'api.acme.efolusi.com', mono: true },
        { label: 'Last deploy', value: '2h ago by ada@acme.com' },
      ]} />
    </div>
  );
}

// @demo LineChart Trend over time
export function LineChartDemo() {
  const { LineChart } = window.EfolusiDesignSystem_4ffc3d;
  return (
    <div style={{ width: '100%', maxWidth: 480 }}>
      <LineChart height={160} showDots format={(v) => v + 'ms'} data={[
        { label: 'Jan', value: 240 }, { label: 'Feb', value: 228 }, { label: 'Mar', value: 214 },
        { label: 'Apr', value: 232 }, { label: 'May', value: 198 }, { label: 'Jun', value: 171 },
      ]} />
    </div>
  );
}

// @demo Skeleton Loading placeholders
export function SkeletonDemo() {
  const { Skeleton } = window.EfolusiDesignSystem_4ffc3d;
  return (
    <div style={{ display: 'flex', gap: 14, alignItems: 'flex-start', width: 340 }}>
      <Skeleton variant="circle" width={40} height={40} />
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 8 }}>
        <Skeleton width="60%" />
        <Skeleton lines={2} />
        <Skeleton variant="rect" height={72} />
      </div>
    </div>
  );
}

// @demo Sparkline Inline trends
export function SparklineDemo() {
  const { Sparkline } = window.EfolusiDesignSystem_4ffc3d;
  return (
    <div style={{ display: 'flex', gap: 28, alignItems: 'center' }}>
      <Sparkline direction="up" data={[3, 5, 4, 7, 6, 9, 8, 12]} />
      <Sparkline direction="down" data={[9, 8, 9, 6, 7, 5, 4, 3]} />
      <Sparkline direction="flat" area={false} data={[5, 5, 6, 5, 5, 6, 5, 5]} />
    </div>
  );
}

// @demo Stat KPI with delta
export function StatDemo() {
  const { Stat } = window.EfolusiDesignSystem_4ffc3d;
  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 26, width: '100%', maxWidth: 440 }}>
      <Stat label="Runs this week" value="1,284" delta="+12.4%" direction="up" hint="vs last week" />
      <Stat label="P95 latency" value="212 ms" delta="−8 ms" direction="down" hint="7-day rolling" />
    </div>
  );
}

// @demo StatusDot Service states
export function StatusDotDemo() {
  const { StatusDot } = window.EfolusiDesignSystem_4ffc3d;
  return (
    <div style={{ display: 'flex', gap: 22, flexWrap: 'wrap' }}>
      <StatusDot state="ok" label="API" />
      <StatusDot state="busy" pulse label="Deploying" />
      <StatusDot state="warn" label="Queue depth" />
      <StatusDot state="err" label="Webhooks" />
      <StatusDot state="off" label="Sandbox" />
    </div>
  );
}

// @demo Table Sortable-looking data grid
export function TableDemo() {
  const { Table, TableHeader, TableBody, TableRow, TableHead, TableCell, TableCaption, Badge } = window.EfolusiDesignSystem_4ffc3d;
  return (
    <div style={{ width: '100%' }}>
      <Table>
        <TableCaption>Agent runs from the current release window.</TableCaption>
        <TableHeader><TableRow><TableHead>Agent</TableHead><TableHead>Runs</TableHead><TableHead>P95</TableHead><TableHead>Status</TableHead></TableRow></TableHeader>
        <TableBody>
          <TableRow><TableCell>Inbox triager</TableCell><TableCell>412</TableCell><TableCell>180 ms</TableCell><TableCell><Badge tone="success" dot>Live</Badge></TableCell></TableRow>
          <TableRow><TableCell>Flight rebooking</TableCell><TableCell>128</TableCell><TableCell>2.4 s</TableCell><TableCell><Badge tone="success" dot>Live</Badge></TableCell></TableRow>
          <TableRow><TableCell>Refund handler</TableCell><TableCell>36</TableCell><TableCell>640 ms</TableCell><TableCell><Badge tone="neutral">Paused</Badge></TableCell></TableRow>
        </TableBody>
      </Table>
    </div>
  );
}
