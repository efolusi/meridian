Hairline-minimal bar chart: sand bars, ink highlight window, hover tint + title tooltip.

```jsx
<BarChart data={requests} height={150} highlightLast={4} labels={['Jun 18', 'Jul 2', 'Jul 16']} format={v => v.toLocaleString() + ' req'} />
```

Vocabulary: state-carrying selection fires `onChange`; command menus fire `onSelect`; placement is `side` (top/bottom/left/right). `formatValue` is a deprecated alias for `format` (one major, matching the other charts); `format` wins when both are passed.
