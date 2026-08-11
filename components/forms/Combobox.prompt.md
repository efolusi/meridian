Composable autocomplete with single or multiple selection, grouped results, clear controls, chips, controlled state, and complete listbox keyboard semantics.

```jsx
<Combobox items={regions} value={region} onValueChange={setRegion}>
  <ComboboxInput placeholder="Select a region" showClear />
  <ComboboxContent>
    <ComboboxEmpty>No regions found.</ComboboxEmpty>
    <ComboboxList>{region => <ComboboxItem value={region}>{region}</ComboboxItem>}</ComboboxList>
  </ComboboxContent>
</Combobox>
```

For multiple selection, set `multiple`, render current values with `ComboboxChips` and `ComboboxChip`, and use `ComboboxChipsInput`. Compose groups from `ComboboxGroup`, `ComboboxLabel`, and `ComboboxSeparator`. `useComboboxAnchor()` supports an external popup anchor.
