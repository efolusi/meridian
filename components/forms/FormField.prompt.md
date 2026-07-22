Label, hint, error and required chrome around a control, and the owner of the `id` that ties them together. Use it when a control has no `label` prop of its own, when several controls share one label, or when the control is not from this system.

Input, Textarea and InputGroup already take `label` / `hint` / `error` directly, Select and Combobox take `label` / `hint`, and DigitEntry takes `label` — for a single one of those, keep using the prop. `FormField` is the general case underneath.

```jsx
<FormField label="Work email" hint="We only use this for receipts." required>
  <Input type="email" placeholder="ada@company.com" />
</FormField>

<FormField label="Plan" error="Pick a plan to continue.">
  <Select options={['Starter', 'Growth', 'Scale']} />
</FormField>
```

`error` wins over `hint` and marks the control invalid, so you do not pass both `error` and `invalid`.

For a set of controls that share one label, `group` swaps the `<label>` for `role="group"` + `aria-labelledby` — five checkboxes cannot share a single `htmlFor`:

```jsx
<FormField group label="Notify me about" hint="Choose any.">
  <Checkbox label="Mentions" />
  <Checkbox label="Replies" />
</FormField>
```

For a control this system does not own, take the wiring as a function and spread it yourself:

```jsx
<FormField label="Card number" error={err}>
  {({ controlProps }) => <StripeCardElement {...controlProps} />}
</FormField>
```

## FormField.useFormState

Zero-dependency form state for a whole form: values, per-field wiring, and the validation timing guidelines/forms.md prescribes (blur first, then re-validate on change, then everything on submit). Published as a static, like `Toaster.useToast`.

```jsx
const form = FormField.useFormState({
  initial: { name: '', seats: 3 },
  validate: v => {
    const errors = {};
    if (!v.name.trim()) errors.name = 'Name the workspace to continue.';
    if (v.seats == null) errors.seats = 'How many seats?';
    return errors; // empty object = valid
  },
});

<form onSubmit={form.handleSubmit(save)}>
  <Input label="Workspace name" {...form.field('name')} />
  <NumberInput label="Seats" min={1} max={50} {...form.field('seats')} />
  <Button type="submit" loading={form.submitting}>Create</Button>
</form>
```

`field(name)` returns `{ value, onChange, onBlur, invalid, error }` — spread it on any control here (`onChange` takes a change event or a raw value, so `Input` and `NumberInput` both work). `error` only surfaces after that field blurs or a submit attempt; `form.errors` always holds the raw `validate` result. `handleSubmit(fn)` validates everything, marks all fields touched, and only calls `fn(values)` when clean — an async `fn` sets `form.submitting` around its promise, which feeds `Button loading` directly. `set(name, value)` writes a field imperatively; `reset()` returns to `initial`.

Use it for a form of two or more validated fields. A single self-contained control does not need it — pass `error` yourself.
