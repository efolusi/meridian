const { ChatMessage, PromptComposer, Terminal, Steps, FileTile, StatusDot, KeyValueList, CommandPalette, Menu, Card, Button, IconButton, Badge, Kbd, Icon, Toast, ToastStack } = window.EfolusiDesignSystem_4ffc3d;

function AgentHeader({ running, onToggle, notify }) {
  return (
    <header style={{ display: 'flex', alignItems: 'center', gap: 12, height: 58, padding: '0 20px', borderBottom: '1px solid var(--border-default)', background: 'rgba(250,249,246,.85)', backdropFilter: 'blur(12px)', flex: 'none' }}>
      <a href="../console/index.html" title="Back to Console" style={{ display: 'flex', alignItems: 'center', gap: 8, textDecoration: 'none', color: 'var(--text-primary)' }}>
        <img src="../../assets/logo.png" alt="" style={{ width: 26, height: 26 }} />
        <span style={{ fontFamily: 'var(--font-display)', fontWeight: 680, letterSpacing: '-0.02em', fontSize: 17 }}>Agent</span>
      </a>
      <span style={{ color: 'var(--sand-300)' }}>/</span>
      <span style={{ fontSize: 14, fontWeight: 600 }}>Retry failed webhooks</span>
      <StatusDot state={running ? 'busy' : 'off'} pulse={running} label={running ? 'Running' : 'Paused'} />
      <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 8 }}>
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, fontSize: 12, color: 'var(--text-muted)' }}><Kbd>⌘</Kbd><Kbd>K</Kbd></span>
        <Button size="sm" variant="secondary" iconLeft={running ? 'pause' : 'play'} onClick={onToggle}>{running ? 'Pause' : 'Resume'}</Button>
        <Menu align="right" trigger={<IconButton icon="ellipsis" label="More" size="sm" />} onSelect={id => notify(id === 'rerun' ? 'Re-running task' : id === 'export' ? 'Transcript exported' : 'Task stopped', id === 'stop' ? 'Everything is logged up to this point.' : 'Done.')} items={[
          { id: 'rerun', label: 'Re-run from start', icon: 'refresh-cw' },
          { id: 'export', label: 'Export transcript', icon: 'download' },
          'separator',
          { id: 'stop', label: 'Stop task', icon: 'square', danger: true },
        ]} />
      </div>
    </header>
  );
}

function TaskRail({ running }) {
  return (
    <aside style={{ width: 304, flex: 'none', borderLeft: '1px solid var(--border-default)', overflowY: 'auto', padding: 16, display: 'flex', flexDirection: 'column', gap: 14 }}>
      <Card padding={16} title="Task" subtitle="4 steps planned">
        <Steps current={2} items={[
          { title: 'Connect to pg-prod-eu', description: 'Read-only session' },
          { title: 'Find failed deliveries', description: '12 found · all 503s' },
          { title: 'Retry in batches', description: 'Batch 2 of 3 running' },
          { title: 'Report + close' },
        ]} />
      </Card>
      <Card padding={12} title="Context">
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          <FileTile name="webhook-log.csv" size="82 KB" style={{ padding: '6px 8px' }} />
          <FileTile name="retry-policy.md" size="3 KB" style={{ padding: '6px 8px' }} />
        </div>
      </Card>
      <Card padding={16} title="Run">
        <div style={{ marginBottom: 8 }}><StatusDot state={running ? 'busy' : 'off'} pulse={running} label={running ? 'Agent active' : 'Paused by you'} /></div>
        <KeyValueList labelWidth={88} items={[
          { label: 'Model', value: 'efolusi-1' },
          { label: 'Tokens', value: '48.1k', mono: true },
          { label: 'Cost', value: '$0.42', mono: true },
          { label: 'Started', value: '14:02', mono: true },
        ]} />
      </Card>
    </aside>
  );
}

const CMD_GROUPS = [
  { group: 'Actions', items: [
    { id: 'new-task', label: 'New task', icon: 'plus' },
    { id: 'pause', label: 'Pause current task', icon: 'pause' },
    { id: 'export', label: 'Export transcript', icon: 'download' },
  ]},
  { group: 'Go to', items: [
    { id: 'infra', label: 'Infra', icon: 'server' },
    { id: 'trader', label: 'Trader', icon: 'chart-candlestick' },
    { id: 'settings', label: 'Workspace settings', icon: 'settings' },
  ]},
];

function AgentScreen() {
  const [running, setRunning] = React.useState(true);
  const [cmdk, setCmdk] = React.useState(false);
  const [toast, setToast] = React.useState(null);
  const notify = (title, description) => { setToast({ title, description }); setTimeout(() => setToast(null), 4000); };
  const [msgs, setMsgs] = React.useState([
    { id: 1, role: 'user', text: 'Connect the prod database and retry yesterday\u2019s failed webhooks.', time: '14:02' },
    { id: 2, role: 'assistant', time: '14:02', body: 'terminal' },
    { id: 3, role: 'assistant', time: '14:03', text: 'Found 12 failed deliveries between 02:10 and 02:14 — all 503s to the billing endpoint. Retrying in 3 batches with backoff. Batch 1 is done (4/4 delivered).' },
  ]);
  const [streaming, setStreaming] = React.useState(false);
  const endRef = React.useRef(null);
  React.useEffect(() => {
    const key = e => { if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') { e.preventDefault(); setCmdk(o => !o); } };
    document.addEventListener('keydown', key);
    return () => document.removeEventListener('keydown', key);
  }, []);
  const send = text => {
    const t = new Date().toTimeString().slice(0, 5);
    setMsgs(m => [...m, { id: Date.now(), role: 'user', text, time: t }]);
    setStreaming(true);
    setTimeout(() => {
      setStreaming(false);
      setMsgs(m => [...m, { id: Date.now() + 1, role: 'assistant', time: t, text: 'On it — I\u2019ll fold that into the current run and report back when batch 3 lands.' }]);
    }, 1600);
  };
  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh' }}>
      <AgentHeader running={running} onToggle={() => setRunning(r => !r)} notify={notify} />
      <div style={{ display: 'flex', flex: 1, minHeight: 0 }}>
        <main style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
          <div style={{ flex: 1, overflowY: 'auto', padding: '28px 32px' }}>
            <div style={{ maxWidth: 720, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 22 }}>
              {msgs.map(m => (
                <ChatMessage key={m.id} role={m.role} name={m.role === 'user' ? 'Ada Obi' : undefined} time={m.time}>
                  {m.body === 'terminal' ? (
                    <div>
                      Connected. Scanning delivery log:
                      <Terminal host="agent@pg-prod-eu" style={{ marginTop: 10 }} lines={[
                        { type: 'cmd', text: 'SELECT count(*) FROM webhook_deliveries WHERE status = 503 AND day = yesterday' },
                        { type: 'ok', text: '12 rows · 02:10\u201302:14 UTC', time: '14:02:41' },
                        { type: 'info', text: 'Grouping by endpoint\u2026 1 endpoint affected', time: '14:02:42' },
                      ]} />
                    </div>
                  ) : m.text}
                </ChatMessage>
              ))}
              {streaming && <ChatMessage streaming time="now">Working on it</ChatMessage>}
              <div ref={endRef}></div>
            </div>
          </div>
          <div style={{ flex: 'none', padding: '0 32px 24px' }}>
            <div style={{ maxWidth: 720, margin: '0 auto' }}>
              <PromptComposer onSend={send} hint="Agent can read your workspace" placeholder="Tell the agent what to do next…" />
            </div>
          </div>
        </main>
        <TaskRail running={running} />
      </div>
      <CommandPalette open={cmdk} onClose={() => setCmdk(false)} onSelect={id => {
        if (id === 'new-task') notify('New task', 'Describe the outcome in the composer below.');
        else if (id === 'pause') { setRunning(false); notify('Task paused', 'Resume any time.'); }
        else if (id === 'export') notify('Transcript exported', 'Markdown file in your downloads.');
        else if (id === 'infra') window.location.href = '../infra/index.html';
        else if (id === 'trader') window.location.href = '../trader/index.html';
        else if (id === 'settings') window.location.href = '../console/index.html';
      }} groups={CMD_GROUPS} />
      <ToastStack>{toast && <Toast tone="success" title={toast.title} description={toast.description} onClose={() => setToast(null)} />}</ToastStack>
    </div>
  );
}

Object.assign(window, { AgentScreen });
