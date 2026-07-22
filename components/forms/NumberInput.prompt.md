Numeric field with stepper buttons; renders bare, or as a full field when `label`/`hint`/`error` are set. It is a text input with `inputmode="decimal"` — not `type=number` — so typing stays free-form and the value only commits on blur: parse, clamp to `min`/`max`, snap to the `step` grid (float noise rounded away). An emptied field commits `null`.

```jsx
<NumberInput label="Seats" min={1} max={50} defaultValue={4} />
<NumberInput label="Memory" min={0} max={128} step={8} value={gb} onChange={setGb} hint="GB, in steps of 8." />
```

Keyboard: ArrowUp/ArrowDown step, Shift+Arrow steps by 10× `step`, Home/End jump to `min`/`max` when finite. The steppers disable at the rails and carry "Increase"/"Decrease" labels.

`onChange(value, e)` fires with a number on every commit and `null` when cleared — guard for `null` before doing math. Controlled via `value` (where `null` means empty), or uncontrolled via `defaultValue`.

`format` renders the committed value ("128 GB"); if the formatted text is not parseable as a plain number, pass a matching `parse`:

```jsx
<NumberInput label="Price" format={n => '$' + n} parse={t => Number(t.replace(/[$,]/g, '')) || null} />
```

Pairs with `FormField.useFormState` — `field()` hands it `value` / `onChange` / `onBlur` / `invalid` / `error` directly:

```jsx
<NumberInput label="Seats" min={1} max={50} {...form.field('seats')} />
```

Use when the value is a number a user tunes in small moves (quantities, limits, thresholds). Not for phone numbers, codes or IDs (use `Input` or `DigitEntry` — those are digit strings, not quantities), and not for coarse picks along a visual range (use `Slider`).
