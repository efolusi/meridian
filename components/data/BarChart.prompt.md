Hairline-minimal bar chart: quiet base bars, a highlight window of copper bars with a 1px accent-edge outline (the outline carries the highlight, not tone alone; the base bars have none), hover tint + title tooltip.

```jsx
<BarChart data={requests} height={150} highlightLast={4} labels={['Jun 18', 'Jul 2', 'Jul 16']} format={v => v.toLocaleString() + ' req'} />
```

Format displayed values with `format`, matching the other chart components.

The highlighted BarChart bar is told apart by hue plus a 1px edge, about 1.3:1 by tone in light, weak for colour-blind readers: pair it with a label or a legend.
