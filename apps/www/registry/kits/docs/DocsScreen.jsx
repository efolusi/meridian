const { Icon, IconButton, Input, Badge, Button, Tag, Alert, Breadcrumbs, CodeBlock, Kbd, CommandPalette } = window.EfolusiDesignSystem_4ffc3d;

function DocsHeader({ onSearch }) {
  return (
    <header style={{ display: 'flex', alignItems: 'center', gap: 20, height: 58, padding: '0 24px', borderBottom: '1px solid var(--border-default)', background: 'rgba(250,249,246,.85)', backdropFilter: 'blur(12px)', position: 'sticky', top: 0, zIndex: 30 }}>
      <a href="../website/index.html" style={{ display: 'flex', alignItems: 'center', gap: 10, textDecoration: 'none', color: 'var(--text-primary)' }}>
        <img src="../../../../../assets/logo.png" alt="" style={{ width: 26, height: 26 }} />
        <span style={{ fontFamily: 'var(--font-display)', fontWeight: 680, letterSpacing: '-0.02em', fontSize: 17 }}>Efolusi</span>
        <span style={{ fontSize: 15, color: 'var(--text-muted)', fontWeight: 500 }}>Docs</span>
      </a>
      <button onClick={onSearch} style={{ display: 'flex', alignItems: 'center', gap: 8, width: 340, height: 32, padding: '0 10px', marginLeft: 12, border: '1px solid var(--border-strong)', borderRadius: 'var(--radius-sm)', background: 'var(--surface-card)', cursor: 'pointer', fontFamily: 'var(--font-sans)', fontSize: 13, color: 'var(--text-muted)' }}>
        <Icon name="search" size={15} />Search docs…
        <span style={{ marginLeft: 'auto', display: 'inline-flex', gap: 3 }}><Kbd>⌘</Kbd><Kbd>K</Kbd></span>
      </button>
      <nav style={{ marginLeft: 'auto', display: 'flex', gap: 4, alignItems: 'center' }}>
        <a href="../console/index.html" style={{ padding: '6px 10px', fontSize: 13.5, fontWeight: 500, color: 'var(--text-secondary)', textDecoration: 'none', borderRadius: 'var(--radius-sm)' }}>Console</a>
        <a href="mailto:support@efolusi.com" style={{ padding: '6px 10px', fontSize: 13.5, fontWeight: 500, color: 'var(--text-secondary)', textDecoration: 'none', borderRadius: 'var(--radius-sm)' }}>Support</a>
        <Button size="sm" variant="secondary" iconLeft="terminal" onClick={() => { window.location.href = '../console/index.html'; }}>Get API key</Button>
      </nav>
    </header>
  );
}

const NAV = [
  ['Getting started', [['quickstart', 'Quickstart'], ['auth', 'Authentication'], ['errors', 'Errors']]],
  ['Agent', [['tasks', 'Running tasks'], ['tools', 'Tool use']]],
  ['Infra', [['connections', 'Connections'], ['dns', 'Domains & DNS']]],
  ['Content', [['nodes', 'Content nodes'], ['media', 'Media pipelines']]],
  ['Tools', [['convert', 'Converting files']]],
  ['Trader', [['strategies', 'Strategies'], ['risk', 'Risk limits']]],
];
const ORDER = NAV.flatMap(([g, items]) => items.map(([id, label]) => ({ id, label, group: g })));

function DocsNav({ page, onPage }) {
  return (
    <nav style={{ width: 250, flex: 'none', padding: '20px 12px 20px 20px', borderRight: '1px solid var(--border-default)', overflowY: 'auto' }}>
      {NAV.map(([group, items]) => (
        <div key={group} style={{ marginBottom: 20 }}>
          <div style={{ fontSize: 11, fontWeight: 600, letterSpacing: '0.06em', textTransform: 'uppercase', color: 'var(--text-muted)', padding: '0 10px 6px' }}>{group}</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
            {items.map(([id, label]) => (
              <button key={id} onClick={() => onPage(id)}
                style={{ textAlign: 'left', border: 'none', cursor: 'pointer', padding: '6px 10px', borderRadius: 'var(--radius-sm)', fontFamily: 'var(--font-sans)', fontSize: 13.5, fontWeight: page === id ? 600 : 450,
                  background: page === id ? 'var(--accent-subtle)' : 'transparent', color: page === id ? 'var(--brand-700)' : 'var(--text-secondary)' }}>
                {label}
              </button>
            ))}
          </div>
        </div>
      ))}
    </nav>
  );
}

const H2 = ({ children }) => <h2 style={{ fontSize: 24, fontWeight: 680, marginTop: 40 }}>{children}</h2>;
const P = ({ children }) => <p style={{ fontSize: 15.5, lineHeight: 1.7, color: 'var(--sand-800)', marginTop: 14 }}>{children}</p>;

const CONTENT = {
  auth: { lede: 'Every request authenticates with a bearer key. Keys are workspace-scoped and environment-prefixed.', tags: [['clock', '3 min']], sections: [
    ['Key types', 'ef_live_ keys touch production; ef_test_ keys hit an isolated sandbox with the same shape. Create both in Console → Settings → API keys, and rotate quarterly — the old key keeps working for 24 hours after rotation.'],
    ['Sending the header', 'Pass the key on every call. SDKs read EFOLUSI_API_KEY from the environment automatically.']],
    code: ['bash', 'curl https://api.efolusi.com/v1/me \\\n  -H "Authorization: Bearer $EFOLUSI_API_KEY"'],
    tip: ['Keep keys server-side', 'Never ship keys in browser code — proxy through your backend instead.'] },
  errors: { lede: 'Errors are plain JSON with a stable code, a human message, and a hint that tells you how to fix it.', tags: [['clock', '2 min']], sections: [
    ['The shape', 'Every non-2xx response carries { code, message, hint }. Codes are stable across versions; messages may improve over time — parse codes, show messages.'],
    ['Retries', '429 and 5xx are safe to retry with exponential backoff. The SDK retries three times automatically.']],
    code: ['json', '{\n  "code": "key_expired",\n  "message": "That API key was rotated on Jul 2.",\n  "hint": "Create a fresh key in Console → Settings → API keys."\n}'],
    tip: ['Idempotency', 'Send an Idempotency-Key header on writes to make retries safe.'] },
  tasks: { lede: 'A task is a goal you hand the agent. It plans steps, runs tools, and reports back for review.', tags: [['clock', '4 min'], ['bot', 'Agent']], sections: [
    ['Starting a task', 'Describe the outcome, not the steps. The agent plans, shows its step rail, and pauses at anything destructive unless you pre-approve it.'],
    ['Reviewing work', 'Every step is logged with its tool calls and output. Pause, redirect, or take over at any point — the transcript stays auditable.']],
    code: ['javascript', "const task = await efolusi.agent.tasks.run(\n  'retry failed webhooks from yesterday',\n  { approve: ['db.read'], pauseOn: ['db.write'] }\n);"],
    tip: ['Scope access', 'Tasks inherit your Infra connections — grant the narrowest scopes that work.'] },
  tools: { lede: 'Tools are what the agent can touch: your Infra connections, file utilities, content nodes, and HTTP.', tags: [['clock', '3 min'], ['bot', 'Agent']], sections: [
    ['Built-in tools', 'db.read/db.write against connected databases, ssh.exec on connected hosts, files.convert, http.fetch, and content.render. Each call is one line in the transcript.'],
    ['Custom tools', 'Register any HTTPS endpoint as a tool with a JSON schema — the agent learns it immediately.']],
    code: ['javascript', "efolusi.agent.tools.register({\n  name: 'refund',\n  url: 'https://api.acme.co/refund',\n  schema: { orderId: 'string', amountCents: 'number' },\n});"],
    tip: ['Danger levels', "Mark tools destructive: true and the agent always asks before calling them."] },
  connections: { lede: 'Connect clouds, databases, caches, and SSH hosts through encrypted tunnels — nothing is stored.', tags: [['clock', '4 min'], ['server', 'Infra']], sections: [
    ['Creating a tunnel', 'Console → Infra → Connect resource, or the CLI below. Efolusi keeps a keepalive tunnel and health-checks it every 30 seconds.'],
    ['Health & status', 'Resources report ok / degraded / down. Degraded fires a notification and shows amber in the console; the agent avoids degraded resources unless told otherwise.']],
    code: ['bash', 'efolusi infra connect postgres \\\n  --host db.internal.acme.co:5432 \\\n  --region eu-west-1'],
    tip: ['Least privilege', 'Connect with a read-only role first; add write roles per-project when needed.'] },
  dns: { lede: 'Point domains at Efolusi, and DNS records, SSL certificates, and renewals manage themselves.', tags: [['clock', '3 min'], ['globe', 'Infra']], sections: [
    ['Adding a domain', 'Add the domain, copy the two records below into your registrar, and verification runs automatically — usually under a minute.'],
    ['Certificates', 'Certs issue and renew automatically for verified domains. Manual certs get an expiry warning at 30 days.']],
    code: ['text', 'A     efolusi.com        76.76.21.21\nCNAME app.efolusi.com    edge.efolusi.com'],
    tip: ['Propagation', 'Registrars cache aggressively — a stuck verification usually clears with a lower TTL.'] },
  nodes: { lede: 'A content node is a small AI worker with one job: turn an input into content — text, image, audio, or video.', tags: [['clock', '4 min'], ['sparkles', 'Content']], sections: [
    ['Composing nodes', 'Chain nodes into pipelines: outline → draft → voiceover → subtitle. Each node is testable alone and versioned with its prompt.'],
    ['Scaling', 'Pipelines fan out: hand one a CSV of 500 rows and it renders 500 variants with per-row context.']],
    code: ['javascript', "const node = efolusi.content.node('product-blurb');\nconst out = await node.render({ product: 'Trader', tone: 'plain' });"],
    tip: ['Brand voice', 'Give nodes your voice guide once — every render inherits it.'] },
  media: { lede: 'Media pipelines handle the heavy lifting after render: transcode, subtitle, resize, and publish.', tags: [['clock', '3 min'], ['video', 'Content']], sections: [
    ['Targets', 'Declare output targets (webm 1080p, mp3, png @2x) and the pipeline produces all of them from one source render.'],
    ['Delivery', 'Outputs land in your storage or CDN — connected through Infra, so no extra credentials.']],
    code: ['javascript', "await efolusi.content.pipeline('launch-video')\n  .targets(['webm/1080p', 'mp3', 'srt'])\n  .run({ source: render.id });"],
    tip: ['Costs', 'Transcoding bills by output minute — check Usage → Content before a big batch.'] },
  convert: { lede: 'One endpoint converts anything: documents, images, audio, video, archives — 240 formats in, 80 out.', tags: [['clock', '2 min'], ['package', 'Tools']], sections: [
    ['Converting', 'Upload or point at a URL, name the target format, get a signed download link. Files are deleted after 24 hours.'],
    ['Batches', 'Send up to 500 files per batch; a webhook fires when the batch settles.']],
    code: ['bash', 'efolusi tools convert q3-deck.pdf --to docx\n# → https://files.efolusi.com/d/8f2a…  (expires in 24h)'],
    tip: ['Quality flag', '--quality 1-100 trades size for fidelity on lossy targets.'] },
  strategies: { lede: 'A strategy is a rulebook the trading robot follows — entries, exits, sizing — inside your risk caps.', tags: [['clock', '4 min'], ['chart-candlestick', 'Trader']], sections: [
    ['Anatomy', 'Pick a template (momentum, mean-reversion, DCA), scope it to pairs and hours, and set sizing. Every decision the robot makes is logged with its reason.'],
    ['Backtests', 'Strategies backtest against 5 years of data before going live — results show P&L, drawdown, and win rate with fees included.']],
    code: ['javascript', "await efolusi.trader.strategies.create({\n  template: 'momentum',\n  pairs: ['BTC-EUR', 'ETH-EUR'],\n  riskPerTrade: 0.04,\n});"],
    tip: ['Paper first', 'New strategies default to paper trading for 7 days. Keep it that way until the log makes sense to you.'] },
  risk: { lede: 'Risk limits are hard stops the robot cannot cross — per trade, per day, and per month.', tags: [['clock', '3 min'], ['shield-check', 'Trader']], sections: [
    ['The three caps', 'Risk per trade (default 4%), daily loss cap (default 5%), monthly drawdown cap (default 10%). Hitting any cap pauses the robot and notifies you.'],
    ['Overrides', 'Caps only move manually, from the console, with a confirmation — never from the API and never by the robot.']],
    code: ['javascript', "await efolusi.trader.risk.set({\n  perTrade: 0.04,\n  dailyLoss: 0.05,\n  monthlyDrawdown: 0.10,\n});"],
    tip: ['Social mirrors', 'Mirrored traders run inside your caps too — their risk never overrides yours.'] },
};

function Helpful({ onNext, nextLabel }) {
  const [done, setDone] = React.useState(false);
  return (
    <div style={{ display: 'flex', gap: 20, marginTop: 32, paddingTop: 20, borderTop: '1px solid var(--border-default)', alignItems: 'center' }}>
      {done ? <span style={{ fontSize: 13, color: 'var(--success-600)', display: 'inline-flex', alignItems: 'center', gap: 6 }}><Icon name="circle-check" size={14} />Thanks — noted.</span> : (
        <React.Fragment>
          <span style={{ fontSize: 13, color: 'var(--text-muted)' }}>Was this helpful?</span>
          <div style={{ display: 'flex', gap: 4 }}>
            <IconButton icon="check" label="Yes" size="sm" variant="outline" onClick={() => setDone(true)} />
            <IconButton icon="x" label="No" size="sm" variant="outline" onClick={() => setDone(true)} />
          </div>
        </React.Fragment>
      )}
      {onNext && <a href="#" onClick={e => { e.preventDefault(); onNext(); }} style={{ marginLeft: 'auto', fontSize: 13.5, fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: 6 }}>Next: {nextLabel} <Icon name="arrow-right" size={14} /></a>}
    </div>
  );
}

function Article({ page, onPage }) {
  const meta = ORDER.find(o => o.id === page);
  const c = CONTENT[page];
  const idx = ORDER.findIndex(o => o.id === page);
  const next = ORDER[idx + 1];
  return (
    <article style={{ maxWidth: 720 }}>
      <Breadcrumbs items={[{ label: meta.group, href: '#', onClick: e => e.preventDefault() }, { label: meta.label }]} />
      <h1 style={{ fontSize: 38, fontWeight: 680, marginTop: 12 }}>{meta.label}</h1>
      <p style={{ fontSize: 17, lineHeight: 1.65, color: 'var(--text-secondary)', marginTop: 12 }}>{c.lede}</p>
      <div style={{ display: 'flex', gap: 8, marginTop: 16 }}>{c.tags.map(([i, t]) => <Tag key={t} icon={i}>{t}</Tag>)}</div>
      <H2>{c.sections[0][0]}</H2>
      <P>{c.sections[0][1]}</P>
      <CodeBlock lang={c.code[0]} style={{ margin: '18px 0' }}>{c.code[1]}</CodeBlock>
      <H2>{c.sections[1][0]}</H2>
      <P>{c.sections[1][1]}</P>
      <Alert tone="info" title={c.tip[0]} description={c.tip[1]} style={{ margin: '18px 0' }} />
      <Helpful onNext={next ? () => onPage(next.id) : null} nextLabel={next ? next.label : ''} />
    </article>
  );
}

function QuickstartArticle({ onPage }) {
  return (
    <article style={{ maxWidth: 720 }}>
      <Breadcrumbs items={[{ label: 'Getting started', href: '#', onClick: e => e.preventDefault() }, { label: 'Quickstart' }]} />
      <h1 style={{ fontSize: 38, fontWeight: 680, marginTop: 12 }}>Quickstart</h1>
      <p style={{ fontSize: 17, lineHeight: 1.65, color: 'var(--text-secondary)', marginTop: 12 }}>Send your first API request in under five minutes. Everything in Efolusi — agent tasks, infra, content, trades — starts with the same key.</p>
      <div style={{ display: 'flex', gap: 8, marginTop: 16 }}><Tag icon="clock">5 min</Tag><Tag icon="terminal">curl or SDK</Tag></div>
      <h2 id="install" style={{ fontSize: 24, fontWeight: 680, marginTop: 40 }}>1. Install the SDK</h2>
      <P>Grab the client for your stack — or skip straight to curl; the API is plain JSON over HTTPS.</P>
      <CodeBlock lang="bash" style={{ margin: '18px 0' }}>npm install @efolusi/sdk</CodeBlock>
      <h2 id="authenticate" style={{ fontSize: 24, fontWeight: 680, marginTop: 40 }}>2. Authenticate</h2>
      <P>Create a key in Console → Settings → API keys. Test keys are prefixed <code style={{ background: 'var(--sand-100)', padding: '2px 6px', borderRadius: 4, fontSize: 13 }}>ef_test_</code> and never touch live data.</P>
      <CodeBlock lang="javascript" style={{ margin: '18px 0' }}>{`import Efolusi from '@efolusi/sdk';

const efolusi = new Efolusi('ef_test_a91xK…');
const task = await efolusi.agent.tasks.run('retry failed webhooks');`}</CodeBlock>
      <Alert tone="info" title="Keep keys server-side" description="Keys grant full workspace access — never ship them in browser code." style={{ margin: '18px 0' }} />
      <h2 id="first-request" style={{ fontSize: 24, fontWeight: 680, marginTop: 40 }}>3. Make it do something</h2>
      <P>Run your first agent task, connect your first cloud, or spin up a content node. Each product has its own five-minute guide from here.</P>
      <Helpful onNext={() => onPage('auth')} nextLabel="Authentication" />
    </article>
  );
}

function Toc() {
  const items = [['#install', '1. Install the SDK'], ['#authenticate', '2. Authenticate'], ['#first-request', '3. Make it do something']];
  const [active, setActive] = React.useState('#install');
  return (
    <aside style={{ width: 200, flex: 'none', padding: '28px 24px 0 0' }}>
      <div style={{ fontSize: 11, fontWeight: 600, letterSpacing: '0.06em', textTransform: 'uppercase', color: 'var(--text-muted)' }}>On this page</div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginTop: 12, borderLeft: '1px solid var(--border-default)' }}>
        {items.map(([href, label]) => (
          <a key={href} href={href} onClick={() => setActive(href)}
            style={{ fontSize: 13, textDecoration: 'none', paddingLeft: 12, marginLeft: -1, lineHeight: 1.4,
              borderLeft: active === href ? '2px solid var(--accent)' : '2px solid transparent',
              color: active === href ? 'var(--brand-700)' : 'var(--text-secondary)', fontWeight: active === href ? 600 : 450 }}>{label}</a>
        ))}
      </div>
    </aside>
  );
}

function DocsApp() {
  const [page, setPage] = React.useState('quickstart');
  const [cmdk, setCmdk] = React.useState(false);
  const main = React.useRef(null);
  React.useEffect(() => {
    const key = e => { if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') { e.preventDefault(); setCmdk(o => !o); } };
    document.addEventListener('keydown', key);
    return () => document.removeEventListener('keydown', key);
  }, []);
  const go = id => { setPage(id); if (main.current) main.current.scrollTop = 0; };
  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh' }}>
      <DocsHeader onSearch={() => setCmdk(true)} />
      <div style={{ display: 'flex', flex: 1, overflow: 'hidden', maxWidth: 1440, width: '100%', margin: '0 auto' }}>
        <DocsNav page={page} onPage={go} />
        <main ref={main} style={{ flex: 1, overflowY: 'auto', padding: '28px 40px 80px' }}>
          {page === 'quickstart' ? <QuickstartArticle onPage={go} /> : <Article page={page} onPage={go} />}
        </main>
        {page === 'quickstart' && <Toc />}
      </div>
      <CommandPalette open={cmdk} onClose={() => setCmdk(false)} placeholder="Search docs…" onSelect={go}
        groups={NAV.map(([g, items]) => ({ group: g, items: items.map(([id, label]) => ({ id, label, icon: 'file-text', hint: g })) }))} />
    </div>
  );
}

Object.assign(window, { DocsApp });
