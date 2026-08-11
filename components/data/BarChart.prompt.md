Hairline-minimal bar chart: sand bars, ink highlight window, hover tint + title tooltip.

```jsx
<BarChart data={requests} height={150} highlightLast={4} labels={['Jun 18', 'Jul 2', 'Jul 16']} format={v => v.toLocaleString() + ' req'} />
```

Format displayed values with `format`, matching the other chart components.
