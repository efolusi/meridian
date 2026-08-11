// Meridian docs demos — navigation.

// @demo Breadcrumbs Path trail
export function BreadcrumbsDemo() {
  const { Breadcrumb, BreadcrumbList, BreadcrumbItem, BreadcrumbLink, BreadcrumbPage, BreadcrumbSeparator, BreadcrumbEllipsis } = window.EfolusiDesignSystem_4ffc3d;
  return (
    <Breadcrumb>
      <BreadcrumbList>
        <BreadcrumbItem><BreadcrumbLink href="#">Workspace</BreadcrumbLink></BreadcrumbItem>
        <BreadcrumbSeparator />
        <BreadcrumbItem><BreadcrumbEllipsis /></BreadcrumbItem>
        <BreadcrumbSeparator />
        <BreadcrumbItem><BreadcrumbPage>Flight rebooking</BreadcrumbPage></BreadcrumbItem>
      </BreadcrumbList>
    </Breadcrumb>
  );
}

// @demo Menubar Application menus
export function MenubarDemo() {
  const { Menubar } = window.EfolusiDesignSystem_4ffc3d;
  return <Menubar onSelect={() => {}} menus={[
    { label: 'File', items: [
      { id: 'new', label: 'New task', icon: 'plus', kbd: '⌘N' },
      { id: 'open', label: 'Open…', kbd: '⌘O' },
      'separator',
      { id: 'close', label: 'Close workspace' },
    ] },
    { label: 'Edit', items: [
      { id: 'undo', label: 'Undo', kbd: '⌘Z' },
      { id: 'redo', label: 'Redo', kbd: '⇧⌘Z' },
    ] },
    { label: 'View', items: [
      { id: 'zoom', label: 'Zoom in', kbd: '⌘+' },
      { id: 'full', label: 'Full screen' },
    ] },
  ]} />;
}

// @demo PageControl Dots pager
export function PageControlDemo() {
  const { PageControl } = window.EfolusiDesignSystem_4ffc3d;
  const [i, setI] = React.useState(1);
  return <PageControl count={5} index={i} onChange={setI} label="Onboarding step" />;
}

// @demo Pagination Numbered pages
export function PaginationDemo() {
  const { Pagination } = window.EfolusiDesignSystem_4ffc3d;
  const [page, setPage] = React.useState(3);
  return <Pagination page={page} pageCount={12} onChange={setPage} />;
}

// @demo SegmentedControl Exclusive views
export function SegmentedControlDemo() {
  const { SegmentedControl } = window.EfolusiDesignSystem_4ffc3d;
  const [v, setV] = React.useState('board');
  return <SegmentedControl value={v} onChange={setV} options={[
    { id: 'list', label: 'List', icon: 'menu' },
    { id: 'board', label: 'Board', icon: 'layout-dashboard' },
    { id: 'timeline', label: 'Timeline', icon: 'chart-line' },
  ]} />;
}

// @demo SideNav Grouped app navigation
export function SideNavDemo() {
  const { SideNav } = window.EfolusiDesignSystem_4ffc3d;
  const [v, setV] = React.useState('runs');
  return (
    <div style={{ width: 240, height: 340, border: '1px solid var(--border-default)', borderRadius: 'var(--radius-md)', overflow: 'hidden' }}>
      <SideNav brand="Meridian" value={v} onChange={setV} groups={[
        { items: [
          { id: 'home', label: 'Overview', icon: 'house' },
          { id: 'runs', label: 'Runs', icon: 'bot', badge: 3 },
          { id: 'data', label: 'Data', icon: 'database' },
        ] },
        { label: 'Workspace', items: [
          { id: 'members', label: 'Members', icon: 'users' },
          { id: 'settings', label: 'Settings', icon: 'settings' },
        ] },
      ]} />
    </div>
  );
}

// @demo Steps Progress checklist
export function StepsDemo() {
  const { Steps } = window.EfolusiDesignSystem_4ffc3d;
  return (
    <div style={{ width: 340 }}>
      <Steps current={1} items={[
        { title: 'Connect your data', description: 'Read-only warehouse credentials.' },
        { title: 'Pick an agent', description: 'Start from a template or blank.' },
        { title: 'First run', description: 'Review the plan before it executes.' },
      ]} />
    </div>
  );
}

// @demo Steps Horizontal
export function StepsHorizontal() {
  const { Steps } = window.EfolusiDesignSystem_4ffc3d;
  return (
    <div style={{ width: '100%', maxWidth: 560 }}>
      <Steps orientation="horizontal" current={2} items={[
        { title: 'Account' }, { title: 'Workspace' }, { title: 'Invite team' }, { title: 'Done' },
      ]} />
    </div>
  );
}

// @demo Tabs With counts
export function TabsDemo() {
  const { Tabs, TabsList, TabsTrigger, TabsContent } = window.EfolusiDesignSystem_4ffc3d;
  return (
    <div style={{ width: '100%', maxWidth: 480 }}>
      <Tabs defaultValue="active">
        <TabsList variant="line"><TabsTrigger value="active">Active · 12</TabsTrigger><TabsTrigger value="scheduled">Scheduled · 4</TabsTrigger><TabsTrigger value="archived">Archived</TabsTrigger></TabsList>
        <TabsContent value="active">Showing production runs that are active now.</TabsContent>
        <TabsContent value="scheduled">Showing runs waiting for their next window.</TabsContent>
        <TabsContent value="archived">Showing retained run history.</TabsContent>
      </Tabs>
    </div>
  );
}

// @demo TopNav Page header bar
export function TopNavDemo() {
  const { TopNav, Breadcrumbs, Button, IconButton, Avatar } = window.EfolusiDesignSystem_4ffc3d;
  return (
    <div style={{ width: '100%', maxWidth: 640, border: '1px solid var(--border-default)', borderRadius: 'var(--radius-md)', overflow: 'hidden' }}>
      <TopNav leading={<Breadcrumbs items={[{ label: 'Agents', onClick: () => {} }, { label: 'Flight rebooking' }]} />}>
        <IconButton variant="quiet" icon="bell" label="Notifications" />
        <Button size="sm" iconLeft="play">Run now</Button>
        <Avatar name="Ada Obi" size={28} />
      </TopNav>
      <div style={{ height: 64, background: 'var(--surface-page)' }}></div>
    </div>
  );
}
