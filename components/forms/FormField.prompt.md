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
