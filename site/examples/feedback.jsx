// Meridian docs demos — feedback.

// @demo AlertDialog Important decision
export function AlertDialogDemo() {
  const { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogMedia, AlertDialogTitle, AlertDialogTrigger, Button, Icon } = window.EfolusiDesignSystem_4ffc3d;
  return (
    <AlertDialog>
      <AlertDialogTrigger asChild><Button variant="outline">Archive project</Button></AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogMedia><Icon name="archive" size={20} /></AlertDialogMedia>
          <AlertDialogTitle>Archive Meridian Cloud?</AlertDialogTitle>
          <AlertDialogDescription>Scheduled runs pause immediately. You can restore the project later from workspace settings.</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction>Archive project</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

// @demo Alert Inline callout
export function AlertDemo() {
  const { Alert, AlertTitle, AlertDescription, Icon } = window.EfolusiDesignSystem_4ffc3d;
  return (
    <div style={{ width: '100%', maxWidth: 520 }}>
      <Alert>
        <Icon name="info" size={16} />
        <AlertTitle>Scheduled maintenance</AlertTitle>
        <AlertDescription>The EU region pauses for ~10 minutes on Sunday 02:00 UTC. Queued runs resume automatically.</AlertDescription>
      </Alert>
    </div>
  );
}

// @demo Alert Tones
export function AlertTones() {
  const { Alert, AlertTitle, AlertDescription, Icon } = window.EfolusiDesignSystem_4ffc3d;
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12, width: '100%', maxWidth: 520 }}>
      <Alert className="ef-alert--success"><Icon name="circle-check" size={16} /><AlertTitle>Backup restored</AlertTitle><AlertDescription>All 42 tables verified.</AlertDescription></Alert>
      <Alert className="ef-alert--warning"><Icon name="triangle-alert" size={16} /><AlertTitle>Budget at 85%</AlertTitle><AlertDescription>Runs pause at 100% unless you raise the cap.</AlertDescription></Alert>
      <Alert variant="destructive"><Icon name="circle-alert" size={16} /><AlertTitle>Deploy failed</AlertTitle><AlertDescription>Image digest mismatch on api-7f3c.</AlertDescription></Alert>
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
      <Banner tone="brand" icon="sparkles" action={<button className="ef-banner__action" onClick={() => {}}>See what's new</button>} onDismiss={() => setOpen(false)}>
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
      <ConfirmDialog open={open} onOpenChange={setOpen} onConfirm={() => setOpen(false)}
        title="Delete this workspace?" description="All agents, runs, and artifacts are removed. This cannot be undone."
        typeToConfirm="acme-prod" confirmLabel="Delete workspace" />
    </div>
  );
}

// @demo Dialog Modal form
export function DialogDemo() {
  const { Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger, Button, Input } = window.EfolusiDesignSystem_4ffc3d;
  return (
    <Dialog><DialogTrigger asChild><Button variant="secondary">Invite member</Button></DialogTrigger><DialogContent>
      <DialogHeader><DialogTitle>Invite a member</DialogTitle><DialogDescription>They get Editor access by default.</DialogDescription></DialogHeader>
      <div className="ef-dialog__body"><Input label="Email" placeholder="kofi@company.com" iconLeft="mail" /></div>
      <DialogFooter><DialogClose asChild><Button variant="ghost">Cancel</Button></DialogClose><DialogClose asChild><Button>Send invite</Button></DialogClose></DialogFooter>
    </DialogContent></Dialog>
  );
}

// @demo Progress Task completion states
export function ProgressDemo() {
  const { Progress } = window.EfolusiDesignSystem_4ffc3d;
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 18, width: 340 }}>
      <Progress value={64} label="Importing rows" showValue />
      <Progress value={86} max={100} label="Monthly budget" tone="warning" showValue format={(v) => '$' + v + ' of $100'} />
      <Progress aria-label="Preparing export" />
    </div>
  );
}

// @demo Spinner Loading indicator
export function SpinnerDemo() {
  const { Spinner } = window.EfolusiDesignSystem_4ffc3d;
  return (
    <div style={{ display: 'flex', gap: 22, alignItems: 'center' }}>
      <Spinner width={14} height={14} />
      <Spinner width={20} height={20} />
      <span style={{ display: 'inline-flex', alignItems: 'center', gap: 8, fontSize: 'var(--text-sm)', color: 'var(--text-muted)' }}>
        <Spinner width={28} height={28} aria-label="Restoring backup" /> Restoring backup…
      </span>
    </div>
  );
}

// @demo Toaster Imperative notifications
export function ToasterDemo() {
  const { Toaster, toast, Button } = window.EfolusiDesignSystem_4ffc3d;
  return <div style={{ display: 'flex', gap: 8 }}><Toaster position="bottom-right" closeButton /><Button variant="outline" onClick={() => toast.success('Release published', { description: 'All production regions are healthy.' })}>Show toast</Button><Button variant="outline" onClick={() => toast.promise(Promise.resolve('ready'), { loading: 'Checking regions…', success: value => `Release ${value}`, error: 'Check failed' })}>Promise toast</Button></div>;
}

// @demo Tooltip Hover hint
export function TooltipDemo() {
  const { TooltipProvider, Tooltip, TooltipTrigger, TooltipContent, IconButton } = window.EfolusiDesignSystem_4ffc3d;
  return (
    <TooltipProvider delayDuration={150}>
      <div style={{ display: 'flex', gap: 14, alignItems: 'center' }}>
        <Tooltip>
          <TooltipTrigger asChild><IconButton variant="outline" icon="copy" label="Duplicate" /></TooltipTrigger>
          <TooltipContent>Duplicate run</TooltipContent>
        </Tooltip>
        <Tooltip>
          <TooltipTrigger asChild><IconButton variant="outline" icon="refresh-cw" label="Retry" /></TooltipTrigger>
          <TooltipContent side="bottom">Runs again with the same inputs</TooltipContent>
        </Tooltip>
      </div>
    </TooltipProvider>
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
