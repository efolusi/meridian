const { Icon, IconButton, Input, Avatar, Tooltip, Badge, Menu, Popover, Kbd, Divider } = window.EfolusiDesignSystem_4ffc3d;

function SideItem({ icon, label, active, badge, onClick, href }) {
  const [hov, setHov] = React.useState(false);
  const style = { display: 'flex', alignItems: 'center', gap: 10, width: '100%', height: 34, padding: '0 10px', border: 'none', borderRadius: 'var(--radius-sm)', cursor: 'pointer', textAlign: 'left', textDecoration: 'none',
    background: active ? 'var(--sand-200)' : hov ? 'var(--sand-100)' : 'transparent',
    color: active ? 'var(--text-primary)' : 'var(--text-secondary)', fontFamily: 'var(--font-sans)', fontSize: 14, fontWeight: active ? 600 : 500,
    transition: 'background var(--dur-fast) var(--ease-out)', boxSizing: 'border-box' };
  const inner = (
    <React.Fragment>
      <span style={{ color: active ? 'var(--accent)' : 'inherit', display: 'inline-flex' }}><Icon name={icon} size={17} /></span>
      <span style={{ flex: 1 }}>{label}</span>
      {badge != null && <Badge tone={active ? 'accent' : 'neutral'}>{badge}</Badge>}
      {href && hov && <Icon name="arrow-up-right" size={13} style={{ color: 'var(--text-muted)' }} />}
    </React.Fragment>
  );
  if (href) return <a href={href} style={style} onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)}>{inner}</a>;
  return <button onClick={onClick} onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)} style={style}>{inner}</button>;
}

function Sidebar({ nav, onNav }) {
  const items = [
    ['overview', 'layout-dashboard', 'Overview'],
    ['customers', 'users', 'Customers', 128],
    ['projects', 'folder', 'Projects'],
    ['usage', 'activity', 'Usage'],
    ['billing', 'credit-card', 'Billing'],
    ['settings', 'settings', 'Settings'],
  ];
  const products = [
    ['bot', 'Agent', '../agent/index.html'],
    ['server', 'Infra', '../infra/index.html'],
    ['sparkles', 'Content', '../docs/index.html'],
    ['package', 'Tools', '../tools/index.html'],
    ['chart-candlestick', 'Trader', '../trader/index.html'],
    ['wallet', 'Social Finance', '../trader/index.html'],
  ];
  return (
    <aside style={{ width: 240, flex: 'none', display: 'flex', flexDirection: 'column', borderRight: '1px solid var(--border-default)', background: 'var(--sand-25)' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '16px 16px 14px' }}>
        <a href="../website/index.html" style={{ display: 'inline-flex' }} title="efolusi.com"><img src="../../assets/logo.png" alt="Efolusi" style={{ width: 30, height: 30 }} /></a>
        <span style={{ fontFamily: 'var(--font-display)', fontWeight: 680, letterSpacing: '-0.02em', fontSize: 19 }}>Efolusi</span>
        <Badge tone="brand" style={{ marginLeft: 'auto' }}>Console</Badge>
      </div>
      <nav style={{ display: 'flex', flexDirection: 'column', gap: 2, padding: '4px 12px' }}>
        {items.map(([id, icon, label, badge]) => <SideItem key={id} icon={icon} label={label} badge={badge} active={nav === id} onClick={() => onNav(id)} />)}
      </nav>
      <div style={{ margin: '14px 12px 0', paddingTop: 12, borderTop: '1px solid var(--border-default)', display: 'flex', flexDirection: 'column', gap: 2 }}>
        <div style={{ fontSize: 11, fontWeight: 600, letterSpacing: '0.06em', textTransform: 'uppercase', color: 'var(--text-muted)', padding: '0 10px 6px' }}>Products</div>
        {products.map(([icon, label, href]) => <SideItem key={label} icon={icon} label={label} href={href} />)}
      </div>
      <div style={{ marginTop: 'auto', padding: 12 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: 10, borderRadius: 'var(--radius-md)', background: 'var(--surface-card)', border: '1px solid var(--border-default)' }}>
          <Avatar name="Ada Obi" size={30} />
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 13, fontWeight: 600, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>Ada Obi</div>
            <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>Acme Workspace</div>
          </div>
          <Menu align="right" trigger={<IconButton icon="chevron-up" label="Switch workspace" size="sm" />} items={[
            { id: 'acme', label: 'Acme Workspace', icon: 'check' },
            { id: 'personal', label: 'Personal', icon: 'user' },
            'separator',
            { id: 'new', label: 'Create workspace', icon: 'plus' },
          ]} onSelect={() => {}} />
        </div>
      </div>
    </aside>
  );
}

const NOTIFS = [
  ['circle-check', 'Batch retry finished', 'Agent · 12/12 webhooks delivered', '2m'],
  ['triangle-alert', 'worker-04 degraded', 'Infra · P95 latency up 4×', '1h'],
  ['banknote', 'Invoice #10422 paid', 'Billing · €1,240.00', '3h'],
];
function Topbar({ title, onSearch, notify }) {
  return (
    <header style={{ display: 'flex', alignItems: 'center', gap: 12, height: 60, padding: '0 24px', borderBottom: '1px solid var(--border-default)', background: 'color-mix(in srgb, var(--surface-page) 85%, transparent)', backdropFilter: 'blur(12px)', position: 'sticky', top: 0, zIndex: 20 }}>
      <h1 style={{ fontSize: 18, fontWeight: 680, fontFamily: 'var(--font-display)', letterSpacing: '-0.02em' }}>{title}</h1>
      <button onClick={onSearch} style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 8, width: 300, height: 32, padding: '0 10px', border: '1px solid var(--border-strong)', borderRadius: 'var(--radius-sm)', background: 'var(--surface-card)', cursor: 'pointer', fontFamily: 'var(--font-sans)', fontSize: 13, color: 'var(--text-muted)' }}>
        <Icon name="search" size={15} />Search anything…
        <span style={{ marginLeft: 'auto', display: 'inline-flex', gap: 3 }}><Kbd>⌘</Kbd><Kbd>K</Kbd></span>
      </button>
      <Popover align="right" width={320} trigger={<IconButton icon="sparkles" label="What's new" />}>
        <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 8 }}>What's new</div>
        <div style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.55 }}>Trader now mirrors other traders with a risk cap, and the Agent can use your Infra connections directly.</div>
        <Divider style={{ margin: '10px 0' }} />
        <a href="../docs/index.html" style={{ fontSize: 13, fontWeight: 600 }}>Read the changelog →</a>
      </Popover>
      <Popover align="right" width={340} trigger={<IconButton icon="bell" label="Notifications" />}>
        <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 4 }}>Notifications</div>
        {NOTIFS.map(([icon, t, d, when]) => (
          <div key={t} style={{ display: 'flex', gap: 10, padding: '9px 0', borderBottom: '1px solid var(--sand-100)' }}>
            <span style={{ display: 'inline-flex', width: 28, height: 28, alignItems: 'center', justifyContent: 'center', flex: 'none', borderRadius: 'var(--radius-full)', background: 'var(--sand-100)', color: 'var(--sand-700)' }}><Icon name={icon} size={14} /></span>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 13, fontWeight: 600 }}>{t}</div>
              <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{d}</div>
            </div>
            <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>{when}</span>
          </div>
        ))}
        <button onClick={() => notify('All caught up', 'Notifications cleared.')} style={{ marginTop: 8, background: 'none', border: 'none', padding: 0, fontFamily: 'var(--font-sans)', fontSize: 13, fontWeight: 600, color: 'var(--text-link)', cursor: 'pointer' }}>Mark all as read</button>
      </Popover>
      <Menu align="right" trigger={<button style={{ border: 'none', background: 'none', padding: 0, cursor: 'pointer', display: 'inline-flex' }}><Avatar name="Ada Obi" size={30} /></button>} items={[
        { id: 'profile', label: 'Profile', icon: 'user' },
        { id: 'settings', label: 'Workspace settings', icon: 'settings' },
        'separator',
        { id: 'signout', label: 'Sign out', icon: 'log-out' },
      ]} onSelect={id => { if (id === 'signout') window.location.href = '../auth/index.html'; }} />
    </header>
  );
}

Object.assign(window, { Sidebar, Topbar, SideItem });
