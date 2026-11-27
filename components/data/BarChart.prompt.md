Hairline-minimal bar chart: quiet base bars, a highlight window of copper bars with a 1px accent-edge outline (the outline carries the highlight, not tone alone; the base bars have none), hover tint + title tooltip.

```jsx
<BarChart data={requests} height={150} highlightLast={4} labels={['Jun 18', 'Jul 2', 'Jul 16']} format={v => v.toLocaleString() + ' req'} />
```

Format displayed values with `format`, matching the other chart components.
