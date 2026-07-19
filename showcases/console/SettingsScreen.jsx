const { Card, Badge, Button, Input, Textarea, Select, Switch, Tabs, Avatar, IconButton, Tag, Icon, Dialog } = window.EfolusiDesignSystem_4ffc3d;

function SectionRow({ title, desc, children }) {
  return (
    <div style={{ display: 'flex', gap: 24, padding: '18px 0', borderBottom: '1px solid var(--sand-100)', alignItems: 'flex-start' }}>
      <div style={{ width: 260, flex: 'none' }}>
        <div style={{ fontSize: 14, fontWeight: 600 }}>{title}</div>
        <div style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 2, lineHeight: 1.45 }}>{desc}</div>
      </div>
      <div style={{ flex: 1, maxWidth: 420 }}>{children}</div>
    </div>
  );
}

function GeneralTab({ notify }) {
  return (
    <Card padding={24}>
      <SectionRow title="Workspace name" desc="Shown in the sidebar and on invoices.">
        <Input defaultValue="Acme Workspace" />
      </SectionRow>
      <SectionRow title="Description" desc="Helps teammates pick the right workspace.">
        <Textarea defaultValue="Robotics tooling for the Acme fleet." rows={3} />
      </SectionRow>
      <SectionRow title="Default surface" desc="Where new members land after sign-in.">
        <Select options={['AI agents', 'Infrastructure', 'Automation', 'File tools', 'Trading', 'Finance']} defaultValue="AI agents" />
      </SectionRow>
      <SectionRow title="Notifications" desc="Workspace-wide defaults; members can override.">
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <Switch defaultChecked label="Usage alerts at 80% of plan" />
          <Switch defaultChecked label="Weekly digest" />
          <Switch label="Product announcements" />
        </div>
      </SectionRow>
      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, paddingTop: 18 }}>
        <Button variant="ghost">Discard</Button>
        <Button onClick={() => notify('Settings saved', 'Changes apply to everyone in Acme Workspace.')}>Save changes</Button>
      </div>
    </Card>
  );
}

const MEMBERS = [['Ada Obi', 'ada@acme.co', 'Owner'], ['Femi Alade', 'femi@acme.co', 'Admin'], ['June Park', 'june@acme.co', 'Member'], ['Sol Reyes', 'sol@acme.co', 'Member']];
function MembersTab({ notify }) {
  return (
    <Card padding={0} title="Members" subtitle="4 of 5 seats used on the Growth plan." actions={<Button size="sm" iconLeft="plus" onClick={() => notify('Invite sent', "We'll email them a join link.")}>Invite</Button>}>
      <div>
        {MEMBERS.map(([name, email, role]) => (
          <div key={email} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 20px', borderTop: '1px solid var(--sand-100)' }}>
            <Avatar name={name} size={32} />
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 14, fontWeight: 600 }}>{name}</div>
              <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{email}</div>
            </div>
            {role === 'Owner' ? <Badge tone="brand">Owner</Badge> : <Select size="sm" options={['Admin', 'Member', 'Viewer']} defaultValue={role} style={{ width: 110 }} />}
            <IconButton icon="ellipsis" label="More" size="sm" disabled={role === 'Owner'} />
          </div>
        ))}
      </div>
    </Card>
  );
}

const SEED_KEYS = [['Production', 'ef_live_…8f2a', 'Jul 2, 2026', true], ['Staging', 'ef_test_…c91d', 'May 14, 2026', false]];
function ApiTab({ notify }) {
  const [keys, setKeys] = React.useState(SEED_KEYS);
  const [confirm, setConfirm] = React.useState(false);
  const createKey = () => {
    const n = ['Preview', 'CI', 'Local dev'][keys.length - 2] || 'Key ' + keys.length;
    setKeys(k => [...k, [n, 'ef_test_…' + Math.random().toString(16).slice(2, 6), 'Jul 16, 2026', false]]);
    notify('Key created', 'Copy it now — we only show it once.');
  };
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <Card padding={0} title="API keys" subtitle="Keys grant full access — rotate them quarterly." actions={<Button size="sm" variant="secondary" iconLeft="plus" onClick={createKey}>Create key</Button>}>
        {keys.map(([env, key, date, live]) => (
          <div key={env} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 20px', borderTop: '1px solid var(--sand-100)' }}>
            <span style={{ display: 'inline-flex', width: 32, height: 32, alignItems: 'center', justifyContent: 'center', borderRadius: 'var(--radius-sm)', background: 'var(--sand-100)', color: 'var(--sand-700)' }}><Icon name="terminal" size={16} /></span>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 14, fontWeight: 600 }}>{env} {live && <Badge tone="success" dot style={{ marginLeft: 6 }}>Live</Badge>}</div>
              <div style={{ fontSize: 12, fontFamily: 'var(--font-mono)', color: 'var(--text-muted)', marginTop: 2 }}>{key} · created {date}</div>
            </div>
            <Button size="sm" variant="secondary" iconLeft="copy" onClick={() => notify('Key copied', 'Paste it somewhere safe — it expires from your clipboard in 60s.')}>Copy</Button>
            <Button size="sm" variant="ghost" iconLeft="refresh-cw" onClick={() => notify(env + ' key rotated', 'The old key keeps working for 24 hours.')}>Rotate</Button>
          </div>
        ))}
      </Card>
      <Card padding={20} style={{ borderColor: 'var(--danger-300)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--danger-600)' }}>Delete workspace</div>
            <div style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 2 }}>Removes all projects, keys, and member access. This can't be undone.</div>
          </div>
          <Button variant="danger" iconLeft="trash-2" onClick={() => setConfirm(true)}>Delete workspace</Button>
        </div>
      </Card>
      <Dialog open={confirm} onClose={() => setConfirm(false)} title="Delete Acme Workspace?" description="All projects, keys, and member access disappear. There is no undo."
        footer={<React.Fragment><Button variant="ghost" onClick={() => setConfirm(false)}>Keep workspace</Button><Button variant="danger" iconLeft="trash-2" onClick={() => { setConfirm(false); notify('Deletion requested', 'Owners get a confirmation email first.', 'warning'); }}>Delete forever</Button></React.Fragment>}>
        <Input label='Type "Acme Workspace" to confirm' placeholder="Acme Workspace" autoFocus />
      </Dialog>
    </div>
  );
}

function SettingsScreen({ notify }) {
  const [tab, setTab] = React.useState('general');
  return (
    <div style={{ padding: 24, maxWidth: 860 }}>
      <Tabs value={tab} onChange={setTab} items={[
        { id: 'general', label: 'General', icon: 'settings' },
        { id: 'members', label: 'Members', icon: 'users', count: 4 },
        { id: 'api', label: 'API keys', icon: 'terminal', count: 2 },
      ]} />
      <div style={{ marginTop: 20 }}>
        {tab === 'general' && <GeneralTab notify={notify} />}
        {tab === 'members' && <MembersTab notify={notify} />}
        {tab === 'api' && <ApiTab notify={notify} />}
      </div>
    </div>
  );
}

Object.assign(window, { SettingsScreen });
