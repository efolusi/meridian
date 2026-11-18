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

For series colours use the categorical tokens in order: `color: 'var(--chart-1)'`, then `--chart-2` and so on up to `--chart-5`. They already switch for dark mode, so `theme` is only needed for colours outside that set. Keep brand colours for UI, not for series. In light mode `--chart-3` and `--chart-5` sit under 3:1 on the card and page surfaces, so always render `ChartLegendContent` (or label series directly) rather than relying on colour alone.
