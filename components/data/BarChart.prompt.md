Hairline-minimal bar chart: sand bars, ink highlight window, hover tint + title tooltip.

```jsx
<BarChart data={requests} height={150} highlightLast={4} labels={['Jun 18', 'Jul 2', 'Jul 16']} formatValue={v => v.toLocaleString() + ' req'} />
```
