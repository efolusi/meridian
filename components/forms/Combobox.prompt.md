Searchable select — single, or multi with removable chips. Keyboard: arrows + Enter, Backspace removes last chip.

```jsx
<Combobox label="Assignee" options={people} value={who} onChange={setWho} />
<Combobox label="Products" multiple options={['Agent','Infra','Node']} value={sel} onChange={setSel} />
```
