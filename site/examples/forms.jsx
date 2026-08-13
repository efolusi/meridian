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
  const { ButtonGroup, ButtonGroupSeparator, ButtonGroupText, Button, IconButton } = window.EfolusiDesignSystem_4ffc3d;
  return (
    <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', alignItems: 'center' }}>
      <ButtonGroup>
        <Button variant="secondary">Day</Button>
        <Button variant="secondary">Week</Button>
        <Button variant="secondary">Month</Button>
      </ButtonGroup>
      <ButtonGroup>
        <IconButton variant="outline" icon="chevron-left" label="Previous" />
        <ButtonGroupSeparator />
        <ButtonGroupText>3 / 12</ButtonGroupText>
        <ButtonGroupSeparator />
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

// @demo Checkbox Selection states
export function CheckboxDemo() {
  const { Checkbox } = window.EfolusiDesignSystem_4ffc3d;
  const [selected, setSelected] = React.useState('indeterminate');
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      <Checkbox checked={selected} onCheckedChange={setSelected} label="Email me on failed runs" description="One digest per hour at most." />
      <Checkbox label="Include usage report" />
      <Checkbox disabled label="SSO required (managed by admin)" />
    </div>
  );
}

// @demo Combobox Searchable select
export function ComboboxDemo() {
  const { Combobox, ComboboxInput, ComboboxContent, ComboboxEmpty, ComboboxList, ComboboxItem, Field, FieldLabel } = window.EfolusiDesignSystem_4ffc3d;
  const [region, setRegion] = React.useState('eu-west-1');
  const regions = ['us-east-1', 'us-west-2', 'eu-west-1', 'eu-central-1', 'ap-southeast-1'];
  return (
    <Field style={{ width: 300 }}><FieldLabel>Region</FieldLabel>
      <Combobox items={regions} value={region} onValueChange={setRegion}>
        <ComboboxInput placeholder="Select a region" showClear />
        <ComboboxContent><ComboboxEmpty>No regions found.</ComboboxEmpty><ComboboxList>{item => <ComboboxItem value={item}>{item}</ComboboxItem>}</ComboboxList></ComboboxContent>
      </Combobox>
    </Field>
  );
}

// @demo InputOTP One-time code
export function InputOTPDemo() {
  const { InputOTP, InputOTPGroup, InputOTPSlot, InputOTPSeparator } = window.EfolusiDesignSystem_4ffc3d;
  const [done, setDone] = React.useState('');
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 10, alignItems: 'center' }}>
      <label htmlFor="demo-otp" style={{ fontSize: 13, fontWeight: 600 }}>Enter the code we sent</label>
      <InputOTP id="demo-otp" maxLength={6} pattern="[0-9]*" onComplete={setDone}>
        <InputOTPGroup>{[0, 1, 2].map(index => <InputOTPSlot key={index} index={index} />)}</InputOTPGroup>
        <InputOTPSeparator />
        <InputOTPGroup>{[3, 4, 5].map(index => <InputOTPSlot key={index} index={index} />)}</InputOTPGroup>
      </InputOTP>
      {done ? <span style={{ fontSize: 13, color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>received: {done}</span> : null}
    </div>
  );
}

// @demo Field Accessible field composition
export function FieldDemo() {
  const { Field, FieldDescription, FieldError, FieldGroup, FieldLabel, FieldLegend, FieldSet, Input } = window.EfolusiDesignSystem_4ffc3d;
  return (
    <FieldSet style={{ width: 320 }}><FieldLegend>Workspace</FieldLegend><FieldDescription>Used on invoices and team invitations.</FieldDescription><FieldGroup><Field data-invalid><FieldLabel htmlFor="field-workspace">Workspace name</FieldLabel><Input id="field-workspace" defaultValue="a" aria-invalid /><FieldError>Use at least three characters.</FieldError></Field></FieldGroup></FieldSet>
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

// @demo Input Native and assisted fields
export function InputDemo() {
  const { Input } = window.EfolusiDesignSystem_4ffc3d;
  return (
    <div style={{ width: 320, display: 'grid', gap: 14 }}>
      <Input aria-label="Project name" placeholder="Project name" />
      <Input label="Work email" placeholder="ada@company.com" iconLeft="mail" hint="We only use this for run alerts." />
      <Input type="file" aria-label="Upload receipt" />
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
  const { InputGroup, InputGroupAddon, InputGroupButton, InputGroupInput, InputGroupText } = window.EfolusiDesignSystem_4ffc3d;
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 14, width: 360 }}>
      <InputGroup><InputGroupInput aria-label="Search projects" placeholder="Search projects…" /><InputGroupAddon><InputGroupText>⌕</InputGroupText></InputGroupAddon><InputGroupAddon align="inline-end"><InputGroupText>12 results</InputGroupText></InputGroupAddon></InputGroup>
      <InputGroup><InputGroupInput aria-label="Workspace URL" defaultValue="acme" /><InputGroupAddon><InputGroupText>https://</InputGroupText></InputGroupAddon><InputGroupAddon align="inline-end"><InputGroupButton>Copy</InputGroupButton></InputGroupAddon></InputGroup>
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

// @demo NumberInput Stepped and clamped
export function NumberInputDemo() {
  const { NumberInput } = window.EfolusiDesignSystem_4ffc3d;
  const [gb, setGb] = React.useState(8);
  return (
    <div style={{ display: 'flex', gap: 14, flexWrap: 'wrap' }}>
      <NumberInput label="Memory" min={0} max={128} step={8} value={gb} onChange={setGb} hint="GB, in steps of 8." style={{ width: 150 }} />
      <NumberInput label="Timeout" defaultValue={30} min={5} max={300} step={5} hint="Seconds." style={{ width: 150 }} />
    </div>
  );
}

// @demo Radio Exclusive choice
export function RadioDemo() {
  const { RadioGroup, RadioGroupItem, Label } = window.EfolusiDesignSystem_4ffc3d;
  return (
    <RadioGroup defaultValue="merge" name="deploy">
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}><RadioGroupItem id="deploy-merge" value="merge" /><Label htmlFor="deploy-merge">Deploy on merge</Label></div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}><RadioGroupItem id="deploy-review" value="review" /><Label htmlFor="deploy-review">Manual approval</Label></div>
    </RadioGroup>
  );
}

// @demo Questionnaire Multi-step planning flow
export function QuestionnaireDemo() {
  const { Questionnaire, QuestionnaireProgress, QuestionnaireItem, QuestionnaireTitle, QuestionnaireDescription, QuestionnaireChoices, QuestionnaireChoice, QuestionnaireInput, QuestionnaireError, QuestionnaireActions, QuestionnairePrevious, QuestionnaireSkip, QuestionnaireNext, QuestionnaireSubmit } = window.EfolusiDesignSystem_4ffc3d;
  const items = [
    { name: 'scope', required: true, prompt: 'What should this release include?', description: 'Choose the clearest boundary.', choices: [{ value: 'component', label: 'Component and tests' }, { value: 'feature', label: 'Complete feature area' }] },
    { name: 'notes', prompt: 'Any implementation constraints?', description: 'Add a note or skip this question.', choices: [{ value: 'dependencies', label: 'Do not add dependencies' }] },
  ];
  return <Questionnaire items={items} style={{ maxWidth: 560 }} onSubmit={event => event.preventDefault()}>
    <QuestionnaireProgress />
    {items.map(item => <QuestionnaireItem key={item.name} name={item.name} required={item.required}>
      <QuestionnaireTitle>{item.prompt}</QuestionnaireTitle>
      <QuestionnaireDescription>{item.description}</QuestionnaireDescription>
      <QuestionnaireChoices>
        {item.choices.map(choice => <QuestionnaireChoice key={choice.value} value={choice.value}>{choice.label}</QuestionnaireChoice>)}
        {item.name === 'notes' ? <QuestionnaireInput aria-label="Other constraint" placeholder="Describe another constraint…" /> : null}
      </QuestionnaireChoices>
      <QuestionnaireError />
    </QuestionnaireItem>)}
    <QuestionnaireActions><QuestionnairePrevious /><QuestionnaireSkip /><QuestionnaireNext /><QuestionnaireSubmit>Save plan</QuestionnaireSubmit></QuestionnaireActions>
  </Questionnaire>;
}

// @demo Select Composed popup select
export function SelectDemo() {
  const { Field, FieldLabel, FieldDescription, Select, SelectTrigger, SelectValue, SelectContent, SelectGroup, SelectLabel, SelectItem } = window.EfolusiDesignSystem_4ffc3d;
  return (
    <Field style={{ width: 280 }}>
      <FieldLabel htmlFor="role-select">Role</FieldLabel>
      <Select defaultValue="editor">
        <SelectTrigger id="role-select"><SelectValue placeholder="Choose a role" /></SelectTrigger>
        <SelectContent><SelectGroup><SelectLabel>Workspace roles</SelectLabel>{['Owner', 'Admin', 'Editor', 'Viewer'].map(role => <SelectItem key={role} value={role.toLowerCase()}>{role}</SelectItem>)}</SelectGroup></SelectContent>
      </Select>
      <FieldDescription>Owners can delete the workspace.</FieldDescription>
    </Field>
  );
}

// @demo NativeSelect Native options and groups
export function NativeSelectDemo() {
  const { NativeSelect, NativeSelectOptGroup, NativeSelectOption } = window.EfolusiDesignSystem_4ffc3d;
  return (
    <NativeSelect defaultValue="banana" aria-label="Fruit">
      <NativeSelectOptGroup label="Fruit">
        <NativeSelectOption value="apple">Apple</NativeSelectOption>
        <NativeSelectOption value="banana">Banana</NativeSelectOption>
      </NativeSelectOptGroup>
      <NativeSelectOptGroup label="Vegetables">
        <NativeSelectOption value="carrot">Carrot</NativeSelectOption>
      </NativeSelectOptGroup>
    </NativeSelect>
  );
}

// @demo Slider Value formatting
export function SliderDemo() {
  const { Slider } = window.EfolusiDesignSystem_4ffc3d;
  const [memoryWindow, setMemoryWindow] = React.useState([32, 96]);
  return (
    <div style={{ width: 320 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8, fontSize: 13, fontWeight: 600 }}><span>Autoscaling window</span><span style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', fontWeight: 400 }}>{memoryWindow.map(value => value + ' GB').join(' – ')}</span></div>
      <Slider aria-label="Autoscaling window" min={0} max={128} step={8} value={memoryWindow} onValueChange={setMemoryWindow} minStepsBetweenThumbs={1} />
    </div>
  );
}

// @demo Switch Settings toggle
export function SwitchDemo() {
  const { Switch } = window.EfolusiDesignSystem_4ffc3d;
  const [retry, setRetry] = React.useState(true);
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      <Switch checked={retry} onCheckedChange={setRetry} label="Auto-retry failed runs" />
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
  const { Icon, Toggle, ToggleGroup, ToggleGroupItem } = window.EfolusiDesignSystem_4ffc3d;
  return (
    <div style={{ display: 'flex', gap: 16, alignItems: 'center', flexWrap: 'wrap' }}>
      <Toggle defaultPressed><Icon name="sparkles" size={16} />Auto-fix</Toggle>
      <Toggle variant="outline" size="sm">Preview</Toggle>
      <ToggleGroup type="single" defaultValue="list" variant="outline" aria-label="Workspace view">
        <ToggleGroupItem value="list" aria-label="List view"><Icon name="menu" size={16} /></ToggleGroupItem>
        <ToggleGroupItem value="board" aria-label="Board view"><Icon name="layout-dashboard" size={16} /></ToggleGroupItem>
        <ToggleGroupItem value="grid" aria-label="Grid view"><Icon name="square" size={16} /></ToggleGroupItem>
      </ToggleGroup>
    </div>
  );
}
