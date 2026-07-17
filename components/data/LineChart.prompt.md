SVG line chart with hover crosshair + tooltip; soft area fill by default.

```jsx
<LineChart data={days.map(d => ({ label: d.date, value: d.requests }))} height={150} format={v => v.toLocaleString()} />
```
