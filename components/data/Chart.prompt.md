# Chart

Meridian's Chart family composes directly with Recharts 3. It does not wrap the chart engine: use Recharts primitives for marks, axes, grids, and accessibility, then add Meridian's container, tooltip content, and legend content.

```jsx
<ChartContainer config={chartConfig} style={{ minHeight: 240 }}>
  <BarChart accessibilityLayer data={data}>
    <CartesianGrid vertical={false} />
    <XAxis dataKey="month" />
    <ChartTooltip content={<ChartTooltipContent />} />
    <ChartLegend content={<ChartLegendContent />} />
    <Bar dataKey="desktop" fill="var(--color-desktop)" radius={4} />
  </BarChart>
</ChartContainer>
```

Give `ChartContainer` a measurable height or minimum height. Configure labels, icons, and either `color` or light/dark `theme` values in `ChartConfig`; reference them as `var(--color-KEY)` from Recharts.
