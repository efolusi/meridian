// Meridian docs demos — navigation.

// @demo Sidebar Application shell
export function SidebarDemo() {
  const { SidebarProvider, Sidebar, SidebarHeader, SidebarInput, SidebarContent, SidebarGroup, SidebarGroupLabel, SidebarGroupContent, SidebarMenu, SidebarMenuItem, SidebarMenuButton, SidebarMenuBadge, SidebarFooter, SidebarRail, SidebarInset, SidebarTrigger, Avatar, AvatarFallback, Icon } = window.EfolusiDesignSystem_4ffc3d;
  return <div style={{ width: '100%', maxWidth: 760, height: 420, overflow: 'hidden', border: '1px solid var(--border-default)', borderRadius: 'var(--radius-lg)' }}>
    <SidebarProvider style={{ '--sidebar-width': '220px', minHeight: 420 }}>
      <Sidebar collapsible="icon">
        <SidebarHeader><strong className="ef-sidebar__collapse-hide">Northstar</strong><SidebarInput placeholder="Search workspace…" aria-label="Search workspace" /></SidebarHeader>
        <SidebarContent><SidebarGroup><SidebarGroupLabel>Operations</SidebarGroupLabel><SidebarGroupContent><SidebarMenu>
          {[['layout-dashboard', 'Overview'], ['activity', 'Live runs'], ['inbox', 'Inbox'], ['settings', 'Settings']].map(([icon, label], index) => <SidebarMenuItem key={label}><SidebarMenuButton href={`#sidebar-${label.toLowerCase().replace(' ', '-')}`} isActive={index === 0}><span className="ef-sidebar-menu-button__icon"><Icon name={icon} size={16} /></span><span>{label}</span>{label === 'Inbox' ? <SidebarMenuBadge>3</SidebarMenuBadge> : null}</SidebarMenuButton></SidebarMenuItem>)}
        </SidebarMenu></SidebarGroupContent></SidebarGroup></SidebarContent>
        <SidebarFooter><SidebarMenu><SidebarMenuItem><SidebarMenuButton><Avatar size="sm"><AvatarFallback>AO</AvatarFallback></Avatar><span>Ada Obi</span></SidebarMenuButton></SidebarMenuItem></SidebarMenu></SidebarFooter><SidebarRail />
      </Sidebar>
      <SidebarInset><header style={{ height: 52, display: 'flex', alignItems: 'center', gap: 8, paddingInline: 14, borderBottom: '1px solid var(--border-default)' }}><SidebarTrigger /><strong>Operations</strong></header><div style={{ padding: 20 }}><h3 style={{ margin: 0 }}>Release health</h3><p style={{ color: 'var(--text-secondary)' }}>All customer-facing regions are healthy.</p></div></SidebarInset>
    </SidebarProvider>
  </div>;
}

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
  const { Menubar, MenubarMenu, MenubarTrigger, MenubarContent, MenubarItem, MenubarCheckboxItem, MenubarRadioGroup, MenubarRadioItem, MenubarSeparator, MenubarShortcut, MenubarSub, MenubarSubTrigger, MenubarSubContent } = window.EfolusiDesignSystem_4ffc3d;
  const [statusBar, setStatusBar] = React.useState(true);
  const [zoom, setZoom] = React.useState('100');
  return <Menubar>
    <MenubarMenu><MenubarTrigger>File</MenubarTrigger><MenubarContent>
      <MenubarItem>New incident <MenubarShortcut>⌘N</MenubarShortcut></MenubarItem>
      <MenubarItem>Open runbook… <MenubarShortcut>⌘O</MenubarShortcut></MenubarItem>
      <MenubarSeparator />
      <MenubarSub><MenubarSubTrigger>Share</MenubarSubTrigger><MenubarSubContent><MenubarItem>Copy link</MenubarItem><MenubarItem>Invite responder</MenubarItem></MenubarSubContent></MenubarSub>
    </MenubarContent></MenubarMenu>
    <MenubarMenu><MenubarTrigger>View</MenubarTrigger><MenubarContent>
      <MenubarCheckboxItem checked={statusBar} onCheckedChange={setStatusBar}>Status bar</MenubarCheckboxItem>
      <MenubarSeparator />
      <MenubarRadioGroup value={zoom} onValueChange={setZoom}><MenubarRadioItem value="90">90%</MenubarRadioItem><MenubarRadioItem value="100">100%</MenubarRadioItem><MenubarRadioItem value="110">110%</MenubarRadioItem></MenubarRadioGroup>
    </MenubarContent></MenubarMenu>
  </Menubar>;
}

// @demo NavigationMenu Product discovery
export function NavigationMenuDemo() {
  const { NavigationMenu, NavigationMenuList, NavigationMenuItem, NavigationMenuTrigger, NavigationMenuContent, NavigationMenuLink, NavigationMenuIndicator } = window.EfolusiDesignSystem_4ffc3d;
  const linkStyle = { width: 220 };
  return <div style={{ minHeight: 210, display: 'flex', alignItems: 'flex-start', justifyContent: 'center' }}>
    <NavigationMenu>
      <NavigationMenuList>
        <NavigationMenuItem value="platform">
          <NavigationMenuTrigger>Platform</NavigationMenuTrigger>
          <NavigationMenuContent>
            <NavigationMenuLink href="#automation" style={linkStyle}><strong>Automation</strong><span style={{ color: 'var(--text-secondary)' }}>Build dependable operational workflows.</span></NavigationMenuLink>
            <NavigationMenuLink href="#observability" style={linkStyle}><strong>Observability</strong><span style={{ color: 'var(--text-secondary)' }}>Trace every run and investigate failures.</span></NavigationMenuLink>
          </NavigationMenuContent>
        </NavigationMenuItem>
        <NavigationMenuItem value="resources">
          <NavigationMenuTrigger>Resources</NavigationMenuTrigger>
          <NavigationMenuContent>
            <NavigationMenuLink href="#guides" style={linkStyle}><strong>Guides</strong><span style={{ color: 'var(--text-secondary)' }}>Patterns for shipping production workflows.</span></NavigationMenuLink>
            <NavigationMenuLink href="#changelog" style={linkStyle}><strong>Changelog</strong><span style={{ color: 'var(--text-secondary)' }}>Follow improvements across the platform.</span></NavigationMenuLink>
          </NavigationMenuContent>
        </NavigationMenuItem>
        <NavigationMenuItem><NavigationMenuLink href="#pricing">Pricing</NavigationMenuLink></NavigationMenuItem>
        <NavigationMenuIndicator />
      </NavigationMenuList>
    </NavigationMenu>
  </div>;
}

// @demo PageControl Dots pager
export function PageControlDemo() {
  const { PageControl } = window.EfolusiDesignSystem_4ffc3d;
  const [i, setI] = React.useState(1);
  return <PageControl count={5} index={i} onChange={setI} label="Onboarding step" />;
}

// @demo Pagination Numbered pages
export function PaginationDemo() {
  const { Pagination, PaginationContent, PaginationItem, PaginationPrevious, PaginationLink, PaginationEllipsis, PaginationNext } = window.EfolusiDesignSystem_4ffc3d;
  return (
    <Pagination>
      <PaginationContent>
        <PaginationItem><PaginationPrevious href="#runs-page-1" /></PaginationItem>
        <PaginationItem><PaginationLink href="#runs-page-1">1</PaginationLink></PaginationItem>
        <PaginationItem><PaginationLink href="#runs-page-2" isActive>2</PaginationLink></PaginationItem>
        <PaginationItem><PaginationLink href="#runs-page-3">3</PaginationLink></PaginationItem>
        <PaginationItem><PaginationEllipsis /></PaginationItem>
        <PaginationItem><PaginationNext href="#runs-page-3" /></PaginationItem>
      </PaginationContent>
    </Pagination>
  );
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
  const { TopNav, Breadcrumbs, Button, IconButton, Avatar, AvatarFallback } = window.EfolusiDesignSystem_4ffc3d;
  return (
    <div style={{ width: '100%', maxWidth: 640, border: '1px solid var(--border-default)', borderRadius: 'var(--radius-md)', overflow: 'hidden' }}>
      <TopNav leading={<Breadcrumbs items={[{ label: 'Agents', onClick: () => {} }, { label: 'Flight rebooking' }]} />}>
        <IconButton variant="quiet" icon="bell" label="Notifications" />
        <Button size="sm" iconLeft="play">Run now</Button>
        <Avatar><AvatarFallback>AO</AvatarFallback></Avatar>
      </TopNav>
      <div style={{ height: 64, background: 'var(--surface-page)' }}></div>
    </div>
  );
}
