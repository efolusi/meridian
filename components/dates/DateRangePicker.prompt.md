Field-style trigger + range Calendar popover for a check-in/check-out pair. Shows "from — to" once picked, an inline clear button while a range exists; closes when both ends are set, on outside click, ESC. `min`/`max` (ISO) drop picks outside the window.

Use it for a stay, a report window, a billing period — two dates that belong together. Not for a single date (DatePicker) or two unrelated dates (two DatePickers).

```jsx
<DateRangePicker label="Stay" value={range} onChange={setRange} />
<DateRangePicker label="Report window" min="2026-01-01" max="2026-12-31" value={r} onChange={setR} hint="This fiscal year." />
```
