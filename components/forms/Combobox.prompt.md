Searchable select — single, or multi with removable chips. Keyboard: arrows + Enter, Backspace removes last chip.

```jsx
<Combobox label="Assignee" options={people} value={who} onChange={setWho} />
<Combobox label="Surfaces" multiple options={['AI agents','Infrastructure','Automation']} value={sel} onChange={setSel} />
```
