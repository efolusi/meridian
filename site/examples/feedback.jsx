// Meridian docs demos — feedback.

// @demo Alert Inline callout
export function AlertDemo() {
  const { Alert } = window.EfolusiDesignSystem_4ffc3d;
  return (
    <div style={{ width: '100%', maxWidth: 520 }}>
      <Alert tone="info" title="Scheduled maintenance" description="The EU region pauses for ~10 minutes on Sunday 02:00 UTC. Queued runs resume automatically." />
    </div>
  );
}

// @demo Alert Tones
export function AlertTones() {
  const { Alert } = window.EfolusiDesignSystem_4ffc3d;
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12, width: '100%', maxWidth: 520 }}>
      <Alert tone="success" title="Backup restored" description="All 42 tables verified." />
      <Alert tone="warning" title="Budget at 85%" description="Runs pause at 100% unless you raise the cap." />
      <Alert tone="danger" title="Deploy failed" description="Image digest mismatch on api-7f3c." />
    </div>
  );
}

// @demo Banner Page-level notice
export function BannerDemo() {
  const { Banner } = window.EfolusiDesignSystem_4ffc3d;
  const [open, setOpen] = React.useState(true);
  if (!open) return <span style={{ fontSize: 13, color: 'var(--text-muted)' }}>Banner dismissed.</span>;
  return (
    <div style={{ width: '100%', maxWidth: 560 }}>
      <Banner tone="brand" icon="sparkles" action="See what's new" onAction={() => {}} onDismiss={() => setOpen(false)}>
Meridian 1.4 is the first public release.
      </Banner>
    </div>
  );
}

// @demo ConfirmDialog Destructive confirmation
export function ConfirmDialogDemo() {
  const { ConfirmDialog, Button } = window.EfolusiDesignSystem_4ffc3d;
  const [open, setOpen] = React.useState(false);
  return (
    <div>
      <Button variant="danger" onClick={() => setOpen(true)}>Delete workspace</Button>
      <ConfirmDialog open={open} onClose={() => setOpen(false)} onConfirm={() => setOpen(false)}
        title="Delete this workspace?" description="All agents, runs, and artifacts are removed. This cannot be undone."
        typeToConfirm="acme-prod" confirmLabel="Delete workspace" />
    </div>
  );
}

// @demo Dialog Modal form
export function DialogDemo() {
  const { Dialog, Button, Input } = window.EfolusiDesignSystem_4ffc3d;
  const [open, setOpen] = React.useState(false);
  return (
    <div>
      <Button variant="secondary" onClick={() => setOpen(true)}>Invite member</Button>
      <Dialog open={open} onClose={() => setOpen(false)} title="Invite a member" description="They get Editor access by default."
        footer={<React.Fragment><Button variant="ghost" onClick={() => setOpen(false)}>Cancel</Button><Button onClick={() => setOpen(false)}>Send invite</Button></React.Fragment>}>
        <Input label="Email" placeholder="kofi@company.com" iconLeft="mail" />
      </Dialog>
    </div>
  );
}

// @demo Progress Determinate bar
export function ProgressDemo() {
  const { Progress } = window.EfolusiDesignSystem_4ffc3d;
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 18, width: 340 }}>
      <Progress value={64} label="Importing rows" showValue />
      <Progress value={86} max={100} label="Monthly budget" tone="warning" showValue format={(v) => '$' + v + ' of $100'} />
    </div>
  );
}

// @demo Spinner Loading indicator
export function SpinnerDemo() {
  const { Spinner } = window.EfolusiDesignSystem_4ffc3d;
  return (
    <div style={{ display: 'flex', gap: 22, alignItems: 'center' }}>
      <Spinner size={14} />
      <Spinner size={20} />
      <Spinner size={28} label="Restoring backup…" />
    </div>
  );
}

// @demo Toast Notification
export function ToastDemo() {
  const { Toast } = window.EfolusiDesignSystem_4ffc3d;
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12, width: 360 }}>
      <Toast tone="success" title="Run finished" description="Flight rebooked, receipt saved." actionLabel="View" onAction={() => {}} onClose={() => {}} />
      <Toast tone="danger" title="Payment failed" description="Card ending 4412 was declined." actionLabel="Retry" onAction={() => {}} onClose={() => {}} />
    </div>
  );
}

// @demo Tooltip Hover hint
export function TooltipDemo() {
  const { Tooltip, IconButton } = window.EfolusiDesignSystem_4ffc3d;
  return (
    <div style={{ display: 'flex', gap: 14, alignItems: 'center' }}>
      <Tooltip label="Duplicate run"><IconButton variant="outline" icon="copy" label="Duplicate" /></Tooltip>
      <Tooltip label="Runs again with the same inputs" position="bottom"><IconButton variant="outline" icon="refresh-cw" label="Retry" /></Tooltip>
    </div>
  );
}

// @demo Loader Pulse, shimmer, dots
export function LoaderDemo() {
  const { Loader } = window.EfolusiDesignSystem_4ffc3d;
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
      <Loader>Thinking</Loader>
      <Loader dots>Thinking</Loader>
      <Loader variant="shimmer">Searching the workspace</Loader>
      <Loader variant="shimmer" dots duration={1.6}>Generating a reply</Loader>
    </div>
  );
}
