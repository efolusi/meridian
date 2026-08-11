Compose mutually exclusive choices with `RadioGroup` and `RadioGroupItem`.

```jsx
<RadioGroup defaultValue="starter" aria-label="Plan">
  <RadioGroupItem id="starter" value="starter" />
  <Label htmlFor="starter">Starter</Label>
  <RadioGroupItem id="growth" value="growth" />
  <Label htmlFor="growth">Growth</Label>
</RadioGroup>
```

Use `value`/`onValueChange` for controlled state. Group-level `name`, `required`,
`disabled`, and `orientation` propagate to native radio inputs. `Radio` remains
an additive shorthand with integrated label and description.
