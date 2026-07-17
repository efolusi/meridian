// Meridian docs demos — forms. Each '@demo Component Title' marker starts a
// demo block that is fetched, displayed as code, and compiled live by ExampleFrame.jsx.

// @demo Button Variants
export function ButtonDemo() {
  const { Button } = window.EfolusiDesignSystem_4ffc3d;
  return (
    <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'center' }}>
      <Button variant="primary">Save changes</Button>
      <Button variant="secondary">Preview</Button>
      <Button variant="ghost">Dismiss</Button>
      <Button variant="danger">Delete</Button>
    </div>
  );
}

// @demo Button Sizes and icons
export function ButtonSizes() {
  const { Button } = window.EfolusiDesignSystem_4ffc3d;
  return (
    <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'center' }}>
      <Button size="sm" iconLeft="plus">New task</Button>
      <Button size="md" iconLeft="sparkles">Generate</Button>
      <Button size="lg" iconRight="arrow-right">Continue</Button>
    </div>
  );
}

// @demo Button Loading state
export function ButtonLoading() {
  const { Button } = window.EfolusiDesignSystem_4ffc3d;
  const [busy, setBusy] = React.useState(false);
  const run = () => { setBusy(true); setTimeout(() => setBusy(false), 1800); };
  return <Button loading={busy} onClick={run}>{busy ? 'Deploying…' : 'Deploy to production'}</Button>;
}

// @demo ButtonGroup Attached actions
export function ButtonGroupDemo() {
  const { ButtonGroup, Button, IconButton } = window.EfolusiDesignSystem_4ffc3d;
  return (
    <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', alignItems: 'center' }}>
      <ButtonGroup>
        <Button variant="secondary">Day</Button>
        <Button variant="secondary">Week</Button>
        <Button variant="secondary">Month</Button>
      </ButtonGroup>
      <ButtonGroup>
        <IconButton variant="outline" icon="chevron-left" label="Previous" />
        <IconButton variant="outline" icon="chevron-right" label="Next" />
      </ButtonGroup>
    </div>
  );
}

// @demo ButtonTile Selectable tiles
export function ButtonTileDemo() {
  const { ButtonTile } = window.EfolusiDesignSystem_4ffc3d;
  const [plan, setPlan] = React.useState('team');
  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, width: '100%', maxWidth: 460 }}>
      <ButtonTile icon="user" title="Personal" description="One seat, three projects" selected={plan === 'solo'} onClick={() => setPlan('solo')} />
      <ButtonTile icon="users" title="Team" description="Unlimited seats and audit log" selected={plan === 'team'} onClick={() => setPlan('team')} />
    </div>
  );
}

// @demo Checkbox With description
export function CheckboxDemo() {
  const { Checkbox } = window.EfolusiDesignSystem_4ffc3d;
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      <Checkbox defaultChecked label="Email me on failed runs" description="One digest per hour at most." />
      <Checkbox label="Include usage report" />
      <Checkbox disabled label="SSO required (managed by admin)" />
    </div>
  );
}

// @demo Combobox Searchable select
export function ComboboxDemo() {
  const { Combobox } = window.EfolusiDesignSystem_4ffc3d;
  const [region, setRegion] = React.useState('eu-west-1');
  return (
    <div style={{ width: 300 }}>
      <Combobox label="Region" value={region} onChange={setRegion}
        options={['us-east-1', 'us-west-2', 'eu-west-1', 'eu-central-1', 'ap-southeast-1']} />
    </div>
  );
}

// @demo DigitEntry One-time code
export function DigitEntryDemo() {
  const { DigitEntry } = window.EfolusiDesignSystem_4ffc3d;
  const [done, setDone] = React.useState('');
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 10, alignItems: 'center' }}>
      <DigitEntry length={6} label="Enter the code we sent" onComplete={setDone} />
      {done ? <span style={{ fontSize: 13, color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>received: {done}</span> : null}
    </div>
  );
}

// @demo IconButton Variants
export function IconButtonDemo() {
  const { IconButton } = window.EfolusiDesignSystem_4ffc3d;
  return (
    <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
      <IconButton variant="quiet" icon="pencil" label="Edit" />
      <IconButton variant="outline" icon="copy" label="Duplicate" />
      <IconButton variant="solid" icon="plus" label="New" />
      <IconButton variant="outline" icon="trash-2" label="Delete" size="sm" />
    </div>
  );
}

// @demo Input Label and hint
export function InputDemo() {
  const { Input } = window.EfolusiDesignSystem_4ffc3d;
  return (
    <div style={{ width: 320 }}>
      <Input label="Work email" placeholder="ada@company.com" iconLeft="mail" hint="We only use this for run alerts." />
    </div>
  );
}

// @demo Input Validation state
export function InputInvalid() {
  const { Input } = window.EfolusiDesignSystem_4ffc3d;
  return (
    <div style={{ width: 320 }}>
      <Input label="Workspace slug" defaultValue="acme corp!" error="Lowercase letters and dashes only." />
    </div>
  );
}

// @demo InputGroup Addons
export function InputGroupDemo() {
  const { InputGroup } = window.EfolusiDesignSystem_4ffc3d;
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 14, width: 360 }}>
      <InputGroup label="Workspace URL" prefix="https://" suffix=".efolusi.com" defaultValue="acme" />
      <InputGroup label="Budget cap" prefix="$" suffix="USD / mo" placeholder="0.00" hint="Runs pause when the cap is hit." />
    </div>
  );
}

// @demo Label Standalone field label
export function LabelDemo() {
  const { Label } = window.EfolusiDesignSystem_4ffc3d;
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
      <Label htmlFor="lbl-demo" required hint="Cannot be changed later">Primary region</Label>
      <input id="lbl-demo" placeholder="eu-west-1" style={{ height: 34, padding: '0 11px', border: '1px solid var(--border-strong)', borderRadius: 'var(--radius-sm)', font: 'inherit', background: 'var(--surface-card)', color: 'var(--text-primary)' }} />
    </div>
  );
}

// @demo Radio Exclusive choice
export function RadioDemo() {
  const { Radio } = window.EfolusiDesignSystem_4ffc3d;
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      <Radio name="deploy" defaultChecked label="Deploy on merge" description="Every merge to main ships automatically." />
      <Radio name="deploy" label="Manual approval" description="A reviewer promotes each release." />
    </div>
  );
}

// @demo Select Native select
export function SelectDemo() {
  const { Select } = window.EfolusiDesignSystem_4ffc3d;
  return (
    <div style={{ width: 280 }}>
      <Select label="Role" options={['Owner', 'Admin', 'Editor', 'Viewer']} defaultValue="Editor" hint="Owners can delete the workspace." />
    </div>
  );
}

// @demo Slider Value formatting
export function SliderDemo() {
  const { Slider } = window.EfolusiDesignSystem_4ffc3d;
  const [v, setV] = React.useState(40);
  return (
    <div style={{ width: 320 }}>
      <Slider label="Memory limit" min={0} max={128} step={8} value={v} onChange={setV} showValue format={(n) => n + ' GB'} />
    </div>
  );
}

// @demo Switch Settings toggle
export function SwitchDemo() {
  const { Switch } = window.EfolusiDesignSystem_4ffc3d;
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      <Switch defaultChecked label="Auto-retry failed runs" />
      <Switch size="sm" label="Verbose logging" />
    </div>
  );
}

// @demo Textarea Multiline input
export function TextareaDemo() {
  const { Textarea } = window.EfolusiDesignSystem_4ffc3d;
  return (
    <div style={{ width: 380 }}>
      <Textarea label="Run instructions" rows={4} placeholder="Book the cheapest nonstop, aisle seat, refundable fare…" hint="The agent follows these on every run." />
    </div>
  );
}

// @demo Toggle Pressed state
export function ToggleDemo() {
  const { Toggle, ToggleGroup } = window.EfolusiDesignSystem_4ffc3d;
  return (
    <div style={{ display: 'flex', gap: 16, alignItems: 'center', flexWrap: 'wrap' }}>
      <Toggle icon="sparkles" defaultPressed>Auto-fix</Toggle>
      <ToggleGroup type="single" defaultValue="list">
        <Toggle value="list" icon="menu" aria-label="List view" />
        <Toggle value="board" icon="layout-dashboard" aria-label="Board view" />
        <Toggle value="grid" icon="square" aria-label="Grid view" />
      </ToggleGroup>
    </div>
  );
}
