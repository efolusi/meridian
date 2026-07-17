// Meridian docs demos — code.

// @demo Diff Unified diff
export function DiffDemo() {
  const { Diff } = window.EfolusiDesignSystem_4ffc3d;
  return (
    <div style={{ width: '100%', maxWidth: 520 }}>
      <Diff title="agents/retry.ts" lines={[
        { text: "export function retry(run: Run) {" },
        { text: "  const maxAttempts = 3;", type: 'del' },
        { text: "  const maxAttempts = 5;", type: 'add' },
        { text: "  const backoff = attempt ** 2 * 100;", type: 'add' },
        { text: "  return schedule(run, maxAttempts);" },
        { text: "}" },
      ]} />
    </div>
  );
}

// @demo CodeBlock Syntax-tinted source
export function CodeBlockDemo() {
  const { CodeBlock } = window.EfolusiDesignSystem_4ffc3d;
  const snippet = 'const run = await agent.start({\n  goal: "Rebook LIS flight",\n  budget: { usd: 40 },\n});\nconsole.log(run.status); // "planning"';
  return (
    <div style={{ width: '100%', maxWidth: 520 }}>
      <CodeBlock lang="javascript" title="start-run.js">{snippet}</CodeBlock>
    </div>
  );
}

// @demo CopyField One-click copy
export function CopyFieldDemo() {
  const { CopyField } = window.EfolusiDesignSystem_4ffc3d;
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 14, width: 400 }}>
      <CopyField label="Webhook URL" value="https://hooks.efolusi.com/t/9f3ac2" />
      <CopyField label="API key" value="ef_live_4d1c9a8b7e6f" secret />
    </div>
  );
}

// @demo Terminal Session log
export function TerminalDemo() {
  const { Terminal } = window.EfolusiDesignSystem_4ffc3d;
  return (
    <div style={{ width: '100%', maxWidth: 560 }}>
      <Terminal host="acme-prod" live lines={[
        { text: 'meridian deploy --env prod', type: 'cmd' },
        { text: 'Building bundle… done in 1.2s', type: 'out', time: '10:02:11' },
        { text: 'Health check passed (3/3)', type: 'ok', time: '10:02:14' },
        { text: 'Cache warm skipped — low traffic window', type: 'info', time: '10:02:14' },
        { text: 'Released v2.14.0 to 100%', type: 'ok', time: '10:02:19' },
      ]} />
    </div>
  );
}

// @demo Console Levels and stacks
export function ConsoleDemo() {
  const { Console } = window.EfolusiDesignSystem_4ffc3d;
  return (
    <div style={{ width: '100%', maxWidth: 560 }}>
      <Console height={190} entries={[
        { level: 'info', time: '14:02:11', text: 'Replaying 12 failed deliveries' },
        { level: 'log', time: '14:02:12', text: 'batch 1/3 → hooks.acme.io · 200 OK' },
        { level: 'warn', time: '14:02:13', text: 'batch 2/3 slow (1.9s) — backing off' },
        { level: 'error', time: '14:02:19', text: 'delivery #9 failed once, retrying', stack: 'at deliver (webhooks.ts:88)\nat replay (batch.ts:31)', source: 'webhooks.ts:88' },
        { level: 'debug', time: '14:02:20', text: 'jitter window 1.2–2.8s' },
        { level: 'info', time: '14:02:24', text: 'Replay complete — 12/12 delivered' },
      ]} />
    </div>
  );
}

// @demo Console Streaming (stick to bottom)
export function ConsoleStreamingDemo() {
  const { Console } = window.EfolusiDesignSystem_4ffc3d;
  const [entries, setEntries] = React.useState([{ level: 'info', time: '14:02:00', text: 'Stream started' }]);
  React.useEffect(() => {
    let n = 1;
    const id = setInterval(() => {
      n += 1;
      const sec = String(n % 60).padStart(2, '0');
      setEntries(e => e.slice(-40).concat({ level: n % 7 === 0 ? 'warn' : 'log', time: '14:02:' + sec, text: 'delivery #' + n + ' → 200 OK (' + (80 + (n * 37) % 400) + 'ms)' }));
    }, 900);
    return () => clearInterval(id);
  }, []);
  return <div style={{ width: '100%', maxWidth: 560 }}><Console height={170} entries={entries} /></div>;
}

// @demo Exception Stack and source
export function ExceptionDemo() {
  const { Exception } = window.EfolusiDesignSystem_4ffc3d;
  return (
    <div style={{ width: '100%', maxWidth: 560 }}>
      <Exception type="TypeError" message="Cannot read properties of undefined (reading 'retries')" defaultOpen frames={[
        { fn: 'backoffFor', loc: 'webhooks.ts:88:19', active: true },
        { fn: 'deliver', loc: 'webhooks.ts:64:9' },
        { fn: 'replayBatch', loc: 'batch.ts:31:5' },
        { fn: 'processTicks', loc: 'node:internal/task_queues:95', internal: true },
      ]} source={{ title: 'webhooks.ts', lines: [
        { no: 87, text: 'const policy = endpoint.policy;' },
        { no: 88, text: 'const wait = policy.retries * base;', active: true },
        { no: 89, text: 'return jitter(wait);' },
      ] }} />
    </div>
  );
}

// @demo EnvList Masked secrets
export function EnvListDemo() {
  const { EnvList } = window.EfolusiDesignSystem_4ffc3d;
  return (
    <div style={{ width: '100%', maxWidth: 480 }}>
      <EnvList vars={[
        { name: 'DATABASE_URL', value: 'postgres://ef:s3cr3t@pg-prod-eu/main', secret: true },
        { name: 'WEBHOOK_SIGNING_KEY', value: 'whsec_a91xK2mQ84vTz6Rd', secret: true },
        { name: 'NODE_ENV', value: 'production' },
        { name: 'REGION', value: 'eu-west-1' },
      ]} />
    </div>
  );
}

// @demo Diff Word-level from strings
export function DiffWordDemo() {
  const { Diff } = window.EfolusiDesignSystem_4ffc3d;
  return (
    <div style={{ width: '100%', maxWidth: 560 }}>
      <Diff title="agents/retry.ts"
        from={'export function retry(run: Run) {\n  const maxAttempts = 3;\n  const window = seconds(40);\n  return schedule(run, maxAttempts, window);\n}'}
        to={'export function retry(run: Run) {\n  const maxAttempts = 5;\n  const window = minutes(6);\n  return schedule(run, maxAttempts, window, { jitter: true });\n}'} />
    </div>
  );
}

// @demo Diff Multi-file review
export function DiffMultiFileDemo() {
  const { Diff } = window.EfolusiDesignSystem_4ffc3d;
  return (
    <div style={{ width: '100%', maxWidth: 560 }}>
      <Diff files={[
        { name: 'agents/retry.ts', from: 'const maxAttempts = 3;\nconst window = seconds(40);', to: 'const maxAttempts = 5;\nconst window = minutes(6);' },
        { name: 'agents/alerts.ts', defaultOpen: false, from: 'threshold: 0.5,', to: 'threshold: 0.8,\nwindowMinutes: 5,' },
      ]} />
    </div>
  );
}

// @demo CodeBlock Clipped with expand
export function CodeBlockClipDemo() {
  const { CodeBlock } = window.EfolusiDesignSystem_4ffc3d;
  const body = Array.from({ length: 18 }, (_, i) => 'log("step ' + (i + 1) + ' of the replay pipeline");').join('\n');
  return (
    <div style={{ width: '100%', maxWidth: 560 }}>
      <CodeBlock lang="ts" clip clipHeight={180}>{body}</CodeBlock>
    </div>
  );
}
