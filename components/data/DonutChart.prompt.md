Donut with center figure + legend; hover highlights a slice. Slices take `--chart-1`..`--chart-5` in order; keep it to five slices and fold the rest into "Other".

```jsx
<DonutChart centerValue="$8.4k" centerLabel="This month" data={[
  { label: 'AI agents', value: 4200 }, { label: 'Infrastructure', value: 2600 }, { label: 'Automation', value: 1600 },
]} />
```
