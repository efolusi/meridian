Month grid — hairline today ring, ink selected day, ISO string in/out. `range` switches to a {from,to} pair: first pick sets from, second sets to (swapped when earlier), a third starts over; the days between paint as a tinted band.

```jsx
<Calendar value={date} onChange={setDate} />
<Calendar range value={{ from, to }} onChange={setRange} />
```
