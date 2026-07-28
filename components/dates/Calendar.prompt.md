Month grid — hairline today ring, ink selected day, ISO string in/out. `range` switches to a {from,to} pair: first pick sets from, second sets to (swapped when earlier), a third starts over; the days between paint as a tinted band.

```jsx
<Calendar value={date} onChange={setDate} />
<Calendar range value={{ from, to }} onChange={setRange} />
```

Pass `locale` (a BCP 47 tag) to localise month and weekday names via Intl — `locale="id"` renders "Januari", "Sen". Omit it for English. The grid stays Monday-first for every locale. `DatePicker` and `DateRangePicker` take the same `locale` and forward it to the calendar.

```jsx
<Calendar value={date} locale="id" onChange={setDate} />
```
