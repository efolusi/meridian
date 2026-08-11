# Field

Compose accessible form layout with `Field`, `FieldLabel`, `FieldDescription`, and `FieldError`. Use `FieldSet`/`FieldLegend` for related controls, `FieldGroup` for spacing, and `FieldContent` for horizontal or responsive layouts.

```jsx
<Field data-invalid={invalid}>
  <FieldLabel htmlFor="email">Email</FieldLabel>
  <Input id="email" aria-invalid={invalid} />
  <FieldError>{invalid ? 'Enter a valid email.' : null}</FieldError>
</Field>
```
