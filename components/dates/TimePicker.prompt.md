Input + listbox of time slots every `stepMinutes` between `minTime`/`maxTime`. Typing filters the list; Enter picks the highlighted slot; a typed valid time ('9:5' becomes '09:05') commits on blur even off-grid. Value is always 24h 'HH:MM' — `format24={false}` only changes the labels to 12h AM/PM.

Use it for appointment starts, opening hours, reminders. Not for durations or seconds precision.

```jsx
<TimePicker label="Starts at" value={time} onChange={setTime} minTime="08:00" maxTime="18:00" />
<TimePicker label="Reminder" format24={false} stepMinutes={15} value={t} onChange={setT} />
```
