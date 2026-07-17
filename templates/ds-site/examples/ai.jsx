// Meridian docs demos — ai.

// @demo Reasoning Streaming and settled
export function ReasoningDemo() {
  const { Reasoning } = window.EfolusiDesignSystem_4ffc3d;
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12, width: '100%', maxWidth: 520 }}>
      <Reasoning streaming>Comparing nonstop fares against the 15:00 arrival constraint. TP 1287 lands 13:05 and keeps the fare class…</Reasoning>
      <Reasoning duration="4s" defaultOpen={false}>Checked 3 carriers. Rejected TAP 1441 (arrives 15:40) and easy 8112 (basic fare, no changes). TP 1287 satisfies all constraints.</Reasoning>
    </div>
  );
}

// @demo ToolCall States
export function ToolCallDemo() {
  const { ToolCall } = window.EfolusiDesignSystem_4ffc3d;
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 10, width: '100%', maxWidth: 520 }}>
      <ToolCall name="search_flights" status="success" defaultOpen args={{ from: 'LIS', arrive_before: '15:00' }} result="3 nonstops found — best: TP 1287, 10:20 → 13:05." />
      <ToolCall name="book_hotel" status="running" args={{ city: 'Lisbon', nights: 2 }} />
      <ToolCall name="charge_card" status="error" args={{ amount: '$412.80' }} error="Card ending 4412 declined — retry with the backup method?" />
    </div>
  );
}

// @demo ToolCall Approval gate
export function ToolCallApproval() {
  const { ToolCall } = window.EfolusiDesignSystem_4ffc3d;
  const [status, setStatus] = React.useState('approval');
  return (
    <div style={{ width: '100%', maxWidth: 520 }}>
      <ToolCall name="send_emails" status={status} args={{ to: '12 customers', template: 'refund-apology' }}
        onApprove={() => { setStatus('running'); setTimeout(() => setStatus('success'), 1500); }}
        onReject={() => setStatus('error')}
        result={status === 'success' ? 'All 12 emails delivered.' : null}
        error={status === 'error' ? 'Rejected by Ada — nothing was sent.' : null} />
    </div>
  );
}

// @demo Confirmation Inline approval
export function ConfirmationDemo() {
  const { Confirmation } = window.EfolusiDesignSystem_4ffc3d;
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12, width: '100%', maxWidth: 480 }}>
      <Confirmation title="Send 12 refund emails?" description="Covers every customer hit by yesterday's failed webhooks. Uses the refund-apology template." />
      <Confirmation tone="danger" title="Drop table archived_runs?" description="1.2M rows. This cannot be undone." approveLabel="Drop it" rejectedNote="Rejected — table kept." />
    </div>
  );
}

// @demo Conversation Stick-to-bottom thread
export function ConversationDemo() {
  const { Conversation, ChatMessage } = window.EfolusiDesignSystem_4ffc3d;
  const [msgs, setMsgs] = React.useState([
    ['user', 'Rebook my Lisbon flight to arrive before 15:00.'],
    ['assistant', 'Found 3 nonstops. Booking TP 1287 — arrives 13:05, same fare class.'],
  ]);
  React.useEffect(() => {
    const lines = ['Seat 14C held.', 'Fare confirmed — no change fee.', 'Ticket reissued. Confirmation sent to ada@acme.com.', 'Anything else before I close the run?'];
    let i = 0;
    const t = setInterval(() => { if (i < lines.length) { const line = lines[i]; setMsgs(m => [...m, ['assistant', line]]); i++; } else clearInterval(t); }, 1800);
    return () => clearInterval(t);
  }, []);
  return (
    <div style={{ width: '100%', maxWidth: 520, border: '1px solid var(--border-default)', borderRadius: 'var(--radius-md)', padding: 4 }}>
      <Conversation height={260} padding={12}>
        {msgs.map(([role, text], i) => <ChatMessage key={i} role={role} name={role === 'user' ? 'Ada' : 'Agent'}>{text}</ChatMessage>)}
      </Conversation>
    </div>
  );
}

// @demo AgentRun Live step trace
export function AgentRunDemo() {
  const { AgentRun, ToolCall } = window.EfolusiDesignSystem_4ffc3d;
  return (
    <div style={{ width: '100%', maxWidth: 460 }}>
      <AgentRun steps={[
        { title: 'Understand the request', status: 'done', time: '09:41:02' },
        { title: 'Draft a plan', status: 'done', time: '09:41:05', detail: '4 steps, est. 2 minutes' },
        { title: 'Search flights', status: 'done', time: '09:41:18', defaultOpen: false, children: <ToolCall name="search_flights" status="success" args={{ from: 'LIS' }} result="3 nonstops found." /> },
        { title: 'Rebook TP 1287', status: 'active', detail: 'Holding seat 14C, confirming fare…' },
        { title: 'Notify Ada', status: 'pending' },
      ]} />
    </div>
  );
}

// @demo Citation Inline chips and sources
export function CitationDemo() {
  const { Citation, SourceList } = window.EfolusiDesignSystem_4ffc3d;
  const SRC = [
    { title: 'IATA quarterly fare report', domain: 'iata.org', description: 'Average one-way fares on intra-EU nonstops fell 12% quarter over quarter, led by morning departures.' },
    { title: 'Efolusi fare desk data, Q2', domain: 'efolusi.com', description: 'Bookings placed before 10:00 local carried the lowest average change fees across all carriers.' },
  ];
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 14, width: '100%', maxWidth: 520 }}>
      <p style={{ margin: 0, fontSize: 14.5, lineHeight: 1.7, color: 'var(--text-secondary)' }}>
        Nonstop fares to Lisbon dropped 12% this quarter<Citation index={1} sources={SRC} />, and morning departures hold the lowest change fees<Citation index={2} sources={[SRC[1]]} />. Hover a chip to preview.
      </p>
      <SourceList sources={[
        { index: 1, title: 'IATA quarterly fare report', domain: 'iata.org' },
        { index: 2, title: 'Efolusi fare desk data, Q2', domain: 'efolusi.com' },
      ]} />
    </div>
  );
}

// @demo Suggestions Empty-state prompts
export function SuggestionsDemo() {
  const { Suggestions } = window.EfolusiDesignSystem_4ffc3d;
  const [picked, setPicked] = React.useState('');
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12, alignItems: 'center' }}>
      <Suggestions onPick={setPicked} items={[
        { icon: 'sparkles', label: 'Summarize this thread' },
        { icon: 'calendar', label: 'Find a meeting slot' },
        'Draft a status update',
        'Explain the failed run',
      ]} />
      {picked ? <span style={{ fontSize: 13, color: 'var(--text-muted)' }}>Sent: “{picked}”</span> : null}
    </div>
  );
}

// @demo ModelSelector Composer model picker
export function ModelSelectorDemo() {
  const { ModelSelector } = window.EfolusiDesignSystem_4ffc3d;
  const [m, setM] = React.useState('ef-2');
  return (
    <div style={{ paddingTop: 150 }}>
      <ModelSelector value={m} onChange={setM} models={[
        { id: 'ef-2', name: 'Efolusi 2', provider: 'Efolusi', hint: 'Best for agent runs', badge: 'New' },
        { id: 'ef-2-mini', name: 'Efolusi 2 Mini', provider: 'Efolusi', hint: 'Fast and cheap for chat' },
        { id: 'byo', name: 'Bring your own', hint: 'Any OpenAI-compatible endpoint' },
      ]} />
    </div>
  );
}

// @demo UsageMeter Token budget
export function UsageMeterDemo() {
  const { UsageMeter } = window.EfolusiDesignSystem_4ffc3d;
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20, width: 340 }}>
      <UsageMeter label="Tokens this month" used={812000} limit={1000000} unit="tokens" cost="$4.82" hint="Resets Aug 1" animated format={(v) => Math.round(v / 1000) + 'k'} />
      <UsageMeter label="Agent runs" used={96} limit={100} hint="Runs pause at the cap" />
    </div>
  );
}

// @demo FeedbackBar Message actions
export function FeedbackBarDemo() {
  const { FeedbackBar } = window.EfolusiDesignSystem_4ffc3d;
  return <FeedbackBar copyText="Rebooked to TP 1287, arriving 13:05." onFeedback={() => {}} onRetry={() => {}} note="ef-2 · 2.1s" />;
}

// @demo ChatMessage Conversation turn
export function ChatMessageDemo() {
  const { ChatMessage } = window.EfolusiDesignSystem_4ffc3d;
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 18, width: '100%', maxWidth: 560 }}>
      <ChatMessage role="user" name="Ada" time="09:41">Rebook my Lisbon flight to arrive before 15:00 local.</ChatMessage>
      <ChatMessage role="assistant" name="Agent" time="09:41" actions>
        Found 3 nonstops arriving before 15:00. Booking TP 1287 (dep 10:20, arr 13:05) — same fare class, no change fee.
      </ChatMessage>
      <ChatMessage role="assistant" name="Agent" streaming>Confirming seat 14C…</ChatMessage>
    </div>
  );
}

// @demo PromptComposer Message input
export function PromptComposerDemo() {
  const { PromptComposer, Tag } = window.EfolusiDesignSystem_4ffc3d;
  const [sent, setSent] = React.useState('');
  return (
    <div style={{ width: '100%', maxWidth: 560, display: 'flex', flexDirection: 'column', gap: 10 }}>
      <PromptComposer placeholder="Ask the agent to do something…" onSend={setSent}
        attachments={<Tag icon="paperclip">itinerary.pdf</Tag>}
        hint="⏎ to send · ⇧⏎ for a new line" />
      {sent ? <span style={{ fontSize: 13, color: 'var(--text-muted)' }}>Sent: “{sent}”</span> : null}
    </div>
  );
}

// @demo Task Agent actions
export function TaskDemo() {
  const { Task } = window.EfolusiDesignSystem_4ffc3d;
  return (
    <Task streaming items={[
      { icon: 'search', label: 'Searched workspace', detail: 'for "webhook retries"' },
      { icon: 'file-text', label: 'Read', detail: <code>gateway.md</code> },
      { icon: 'terminal', label: 'Ran', detail: <code>pytest -k retry</code> },
      { label: 'Drafting the fix' },
    ]} />
  );
}

// @demo Todo Streaming plan
export function TodoDemo() {
  const { Todo } = window.EfolusiDesignSystem_4ffc3d;
  const [step, setStep] = React.useState(1);
  React.useEffect(() => {
    const id = setInterval(() => setStep(s => (s + 1) % 5), 1800);
    return () => clearInterval(id);
  }, []);
  const st = i => i < step ? 'done' : i === step ? 'progress' : 'pending';
  return (
    <div style={{ width: '100%', maxWidth: 420 }}>
      <Todo title="Plan" items={[
        { label: 'Read webhook schema', status: st(0) },
        { label: 'Patch retry backoff', status: st(1) },
        { label: 'Replay failed batch', status: st(2) },
        { label: 'Write incident summary', status: st(3) },
      ]} />
    </div>
  );
}

// @demo DocumentCard Clipped document
export function DocumentCardDemo() {
  const { DocumentCard } = window.EfolusiDesignSystem_4ffc3d;
  return (
    <div style={{ width: '100%', maxWidth: 520 }}>
      <DocumentCard title="Incident summary — failed webhooks" meta="310 words" collapsedHeight={140}>
        <h3>What happened</h3>
        <p>Between 02:10 and 02:14, 12 webhook deliveries to hooks.acme.io returned 503. The host was mid-deploy; our retry window (3 attempts over 40s) was shorter than the outage.</p>
        <h3>Fix</h3>
        <p>Backoff now stretches to 5 attempts over 6 minutes, with jitter. The failed batch was replayed at 14:06 and all 12 deliveries succeeded.</p>
        <p>Follow-up: alert when a single endpoint accounts for more than 80% of failures in any 5-minute window.</p>
      </DocumentCard>
    </div>
  );
}

// @demo GeneratedImage States
export function GeneratedImageDemo() {
  const { GeneratedImage } = window.EfolusiDesignSystem_4ffc3d;
  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12, width: '100%', maxWidth: 640 }}>
      <GeneratedImage state="queued" prompt="Espresso machine, isometric" />
      <GeneratedImage state="generating" prompt="Espresso machine, isometric" />
      <GeneratedImage state="error" prompt="Espresso machine, isometric" error="Rate limit hit" onRetry={() => {}} />
    </div>
  );
}

// @demo Sandbox Run with tabs
export function SandboxDemo() {
  const { Sandbox } = window.EfolusiDesignSystem_4ffc3d;
  const [state, setState] = React.useState('running');
  React.useEffect(() => {
    const id = setInterval(() => setState(s => s === 'running' ? 'success' : s === 'success' ? 'error' : 'running'), 2600);
    return () => clearInterval(id);
  }, []);
  return (
    <div style={{ width: '100%', maxWidth: 520 }}>
      <Sandbox title="python analyze_failures.py" state={state} defaultOpen tabs={[
        { id: 'out', label: 'Output', content: <pre>Loaded 12 failed deliveries{'\n'}Grouping by endpoint… 1 host{'\n'}Computing backoff windows…</pre> },
        { id: 'code', label: 'Code', content: <pre>{'rows = load("failures.csv")\nby_host = group(rows, "endpoint")\nprint(backoff(by_host))'}</pre> },
      ]} />
    </div>
  );
}

// @demo WebPreview Chrome + console
export function WebPreviewDemo() {
  const { WebPreview } = window.EfolusiDesignSystem_4ffc3d;
  return (
    <div style={{ width: '100%', maxWidth: 620 }}>
      <WebPreview url="https://status.efolusi.dev" height={240} logs={[
        { level: 'info', text: 'hydrated in 84ms' },
        { level: 'warn', text: 'preload unused: fonts/figtree.woff2' },
        { level: 'error', text: "Uncaught TypeError: retries is undefined" },
      ]}>
        <div style={{ padding: 28 }}>
          <div style={{ fontFamily: 'var(--font-display)', fontSize: 22, color: 'var(--text-primary)', marginBottom: 6 }}>All systems operational</div>
          <div style={{ fontSize: 13, color: 'var(--text-muted)' }}>Webhooks recovered at 14:06 — 12/12 replays delivered.</div>
        </div>
      </WebPreview>
    </div>
  );
}

// @demo SourceCard Card and plain
export function SourceCardDemo() {
  const { SourceCard } = window.EfolusiDesignSystem_4ffc3d;
  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, width: '100%', maxWidth: 560 }}>
      <SourceCard domain="docs.efolusi.dev" title="Webhook retry policy" description="Defaults, backoff windows, and how replays are deduplicated across attempts." />
      <SourceCard variant="plain" domain="acme.statuspage.io" title="Acme — deploy window 02:00–02:20" description="Scheduled maintenance notice covering the outage." />
    </div>
  );
}

// @demo PromptSteps Multi-step, keyboard-first
export function PromptStepsDemo() {
  const { PromptSteps } = window.EfolusiDesignSystem_4ffc3d;
  const [done, setDone] = React.useState(null);
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 10, width: '100%', maxWidth: 460 }}>
      <PromptSteps onComplete={setDone} steps={[
        { name: 'tone', question: 'What tone should the reply use?', options: ['Formal', 'Friendly', 'Direct'], other: true },
        { name: 'length', question: 'How long should it be?', options: ['One paragraph', 'Half a page', 'Full page'] },
      ]} />
      {done ? <div style={{ fontSize: 12.5, color: 'var(--text-muted)' }}>Answers: {JSON.stringify(done)}</div> : null}
    </div>
  );
}

// @demo SelectionQuote Quote selected text
export function SelectionQuoteDemo() {
  const { SelectionQuote } = window.EfolusiDesignSystem_4ffc3d;
  const [quoted, setQuoted] = React.useState('');
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 10, width: '100%', maxWidth: 520 }}>
      <SelectionQuote onAction={(id, text) => setQuoted(text)} actions={[{ id: 'quote', label: 'Quote', icon: 'corner-up-left' }, { id: 'explain', label: 'Explain' }]}>
        <div style={{ padding: '14px 16px', border: '1px solid var(--border-default)', borderRadius: 10, background: 'var(--surface-card)', fontSize: 13.5, lineHeight: 1.7, color: 'var(--text-secondary)' }}>
          Select any part of this answer to quote it back — the retry window was shorter than the outage, so all three attempts landed inside the deploy.
        </div>
      </SelectionQuote>
      {quoted ? <div style={{ fontSize: 12.5, color: 'var(--text-muted)' }}>Quoted: “{quoted}”</div> : null}
    </div>
  );
}

// @demo RichComposer Mentions and commands
export function RichComposerDemo() {
  const { RichComposer } = window.EfolusiDesignSystem_4ffc3d;
  const [sent, setSent] = React.useState(null);
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 10, width: '100%', maxWidth: 560 }}>
      <RichComposer hint="@ files · / commands" onSubmit={setSent} onCommand={() => {}} mentions={[
        { id: 'f1', label: 'gateway.md', icon: 'file-text', group: 'Files' },
        { id: 'f2', label: 'retry.ts', icon: 'code', group: 'Files' },
        { id: 'u1', label: 'Ada Obi', icon: 'user', group: 'People' },
      ]} commands={[
        { id: 'summarize', label: 'summarize', description: 'Summarize the thread' },
        { id: 'clear', label: 'clear', description: 'Start over' },
      ]} />
      {sent ? <div style={{ fontSize: 12.5, color: 'var(--text-muted)' }}>Sent: {sent.text} · {sent.mentions.length} mention(s)</div> : null}
    </div>
  );
}

// @demo Player Audio with waveform
export function PlayerDemo() {
  const { Player } = window.EfolusiDesignSystem_4ffc3d;
  return (
    <div style={{ width: '100%', maxWidth: 520 }}>
      <Player title="Standup — webhook incident" meta="03:12" />
    </div>
  );
}

// @demo Transcript Synced with a player
export function TranscriptDemo() {
  const { Player, Transcript } = window.EfolusiDesignSystem_4ffc3d;
  const [t, setT] = React.useState(6);
  const ref = React.useRef(null);
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12, width: '100%', maxWidth: 560 }}>
      <Player ref={ref} title="Standup — webhook incident" meta="03:12" onTimeChange={setT} />
      <Transcript height={200} currentTime={t} onJump={s => { setT(s); if (ref.current) ref.current.jumpTo(s); }} items={[
        { start: 0, speaker: 'Ada', text: 'Quick recap of the webhook incident?' },
        { start: 4, speaker: 'Efe', words: [{ t: 4, w: 'Twelve' }, { t: 4.4, w: 'deliveries' }, { t: 5, w: 'failed' }, { t: 5.5, w: 'during' }, { t: 6, w: 'the' }, { t: 6.2, w: 'acme' }, { t: 6.6, w: 'deploy.' }] },
        { start: 8, speaker: 'Ada', text: 'And the fix is the longer backoff?' },
        { start: 11, speaker: 'Efe', text: 'Five attempts over six minutes, with jitter. Replay went out clean.' },
        { start: 15, speaker: 'Ada', interim: true, text: 'Perfect, ship it…' },
      ]} />
    </div>
  );
}
