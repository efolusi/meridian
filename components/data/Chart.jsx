'use client';
import React from 'react';
import * as RechartsPrimitive from 'recharts';
import { injectEfCss, mergeRefs, styleRef, useIsoLayoutEffect } from '../runtime/runtime.jsx';

const CSS = `
.ef-chart{display:flex;aspect-ratio:16/9;min-height:200px;width:100%;justify-content:center;color:var(--text-secondary);font-size:var(--text-xs)}
.ef-chart .recharts-cartesian-axis-tick text{fill:var(--text-muted)}.ef-chart .recharts-cartesian-grid line{stroke:var(--border-default)}.ef-chart .recharts-curve.recharts-tooltip-cursor{stroke:var(--border-default)}.ef-chart .recharts-dot{stroke:transparent}.ef-chart .recharts-layer,.ef-chart .recharts-sector,.ef-chart .recharts-surface{outline:none}.ef-chart .recharts-rectangle.recharts-tooltip-cursor{fill:var(--surface-sunken)}
.ef-chart-tooltip{display:grid;min-width:128px;gap:var(--space-2);padding:var(--space-2) var(--space-3);border:1px solid var(--border-default);border-radius:var(--radius-md);background:var(--surface-card);box-shadow:var(--shadow-lg);font-size:var(--text-xs)}.ef-chart-tooltip__label{font-weight:var(--weight-medium);color:var(--text-primary)}.ef-chart-tooltip__items{display:grid;gap:var(--space-2)}.ef-chart-tooltip__item{display:flex;align-items:center;gap:var(--space-2)}.ef-chart-tooltip__indicator{flex:none;width:10px;height:10px;border-radius:var(--radius-xs);background:var(--chart-indicator)}.ef-chart-tooltip__indicator--line{width:4px;height:14px}.ef-chart-tooltip__indicator--dashed{width:0;height:14px;border-inline-start:2px dashed var(--chart-indicator);background:transparent}.ef-chart-tooltip__name{color:var(--text-muted)}.ef-chart-tooltip__value{margin-inline-start:auto;color:var(--text-primary);font-family:var(--font-mono);font-weight:var(--weight-medium);font-variant-numeric:tabular-nums}
.ef-chart-legend{display:flex;align-items:center;justify-content:center;gap:var(--space-4)}.ef-chart-legend--top{padding-bottom:var(--space-3)}.ef-chart-legend--bottom{padding-top:var(--space-3)}.ef-chart-legend__item{display:flex;align-items:center;gap:var(--space-2)}.ef-chart-legend__mark{width:8px;height:8px;border-radius:var(--radius-xs)}
`;

const INITIAL_DIMENSION = { width: 320, height: 200 };
const ChartContext = React.createContext(null);

export function useChart() {
  const context = React.useContext(ChartContext);
  if (!context) throw new Error('useChart must be used within a <ChartContainer />');
  return context;
}

// The colours a ChartContainer config sets, as custom properties. They are written
// through the CSSOM, so no <style> element or style attribute is in server HTML and a
// strict CSP (style-src without 'unsafe-inline') does not block them. A `theme` pair
// becomes light-dark(), which follows the color-scheme the tokens set for data-theme and
// for a dark OS with no data-theme, so the colour needs no selector of its own. A pair
// with one side missing uses that side in both themes.
function chartVars(config) {
  const vars = {};
  for (const [key, item] of Object.entries(config || {})) {
    if (!item) continue;
    const light = item.theme ? item.theme.light : item.color;
    const dark = item.theme ? item.theme.dark : item.color;
    if (!light && !dark) continue;
    vars[`--color-${key}`] = light && dark && light !== dark ? `light-dark(${light}, ${dark})` : (light || dark);
  }
  return vars;
}

// Writes the colours on `node` and returns the cleanup that takes them off again.
function writeChartVars(node, vars) {
  const names = Object.keys(vars);
  for (const name of names) node.style.setProperty(name, vars[name]);
  return () => { for (const name of names) node.style.removeProperty(name); };
}

// A standalone ChartStyle has no node of its own: it looks for the chart element with
// its `data-chart` id in the document. A ChartContainer does not use it; it writes on
// its own node, so a chart in a shadow root or a detached tree gets its colours too.
// The id is compared as text, not put in a selector: a caller id may hold a quote.
export function ChartStyle({ id, config }) {
  const key = JSON.stringify(chartVars(config));
  useIsoLayoutEffect(() => {
    const chart = Array.from(document.querySelectorAll('[data-chart]')).find(node => node.dataset.chart === id);
    return chart ? writeChartVars(chart, JSON.parse(key)) : undefined;
  }, [id, key]);
  return null;
}

export const ChartContainer = React.forwardRef(function ChartContainer({ id, className, children, config = {}, initialDimension = INITIAL_DIMENSION, ...props }, ref) {
  injectEfCss('ef-css-chart', CSS);
  const uniqueId = React.useId();
  const chartId = `chart-${id || uniqueId.replace(/:/g, '')}`;
  const ResponsiveContainer = RechartsPrimitive && RechartsPrimitive.ResponsiveContainer;
  const node = React.useRef(null);
  const colorsKey = JSON.stringify(chartVars(config));
  useIsoLayoutEffect(() => (node.current ? writeChartVars(node.current, JSON.parse(colorsKey)) : undefined), [colorsKey]);
  return <ChartContext.Provider value={{ config }}><div ref={mergeRefs(ref, node)} data-slot="chart" data-chart={chartId} className={`ef-chart${className ? ` ${className}` : ''}`} {...props}>
    {ResponsiveContainer ? <ResponsiveContainer initialDimension={initialDimension}>{children}</ResponsiveContainer> : children}
  </div></ChartContext.Provider>;
});

export function ChartTooltip(props) {
  const Tooltip = RechartsPrimitive && RechartsPrimitive.Tooltip;
  return Tooltip ? <Tooltip {...props} /> : null;
}

function payloadConfig(config, payload, key) {
  if (!payload || typeof payload !== 'object') return undefined;
  const nested = payload.payload && typeof payload.payload === 'object' ? payload.payload : undefined;
  const mapped = typeof payload[key] === 'string' ? payload[key] : nested && typeof nested[key] === 'string' ? nested[key] : key;
  return config[mapped] || config[key];
}

export function ChartTooltipContent({ active, payload, locale = 'en-US', className, indicator = 'dot', hideLabel = false, hideIndicator = false, label, labelFormatter, labelClassName, formatter, color, nameKey, labelKey }) {
  injectEfCss('ef-css-chart', CSS);
  const { config } = useChart();
  if (!active || !payload || !payload.length) return null;
  const first = payload[0];
  const labelConfig = payloadConfig(config, first, `${labelKey || first.dataKey || first.name || 'value'}`);
  const labelValue = !labelKey && typeof label === 'string' ? (config[label]?.label || label) : labelConfig?.label;
  const labelNode = hideLabel || !labelValue ? null : <div className={`ef-chart-tooltip__label${labelClassName ? ` ${labelClassName}` : ''}`}>{labelFormatter ? labelFormatter(labelValue, payload) : labelValue}</div>;
  const nestLabel = payload.length === 1 && indicator !== 'dot';
  return <div className={`ef-chart-tooltip${className ? ` ${className}` : ''}`}>{!nestLabel ? labelNode : null}<div className="ef-chart-tooltip__items">
    {payload.filter(item => item.type !== 'none').map((item, index) => {
      const configItem = payloadConfig(config, item, `${nameKey || item.name || item.dataKey || 'value'}`);
      const indicatorColor = color || item.payload?.fill || item.color;
      return <div className="ef-chart-tooltip__item" key={index}>{formatter && item.value !== undefined && item.name ? formatter(item.value, item.name, item, index, item.payload) : <>
        {configItem?.icon ? React.createElement(configItem.icon) : !hideIndicator ? <span className={`ef-chart-tooltip__indicator ef-chart-tooltip__indicator--${indicator}`} ref={styleRef({ '--chart-indicator': indicatorColor })} /> : null}
        <span className="ef-chart-tooltip__name">{nestLabel ? labelNode : null}{configItem?.label || item.name}</span>
        {item.value != null ? <span className="ef-chart-tooltip__value">{typeof item.value === 'number' ? new Intl.NumberFormat(locale).format(item.value) : String(item.value)}</span> : null}
      </>}</div>;
    })}
  </div></div>;
}

export function ChartLegend(props) {
  const Legend = RechartsPrimitive && RechartsPrimitive.Legend;
  return Legend ? <Legend {...props} /> : null;
}

export function ChartLegendContent({ className, hideIcon = false, payload, verticalAlign = 'bottom', nameKey }) {
  injectEfCss('ef-css-chart', CSS);
  const { config } = useChart();
  if (!payload || !payload.length) return null;
  return <div className={`ef-chart-legend ef-chart-legend--${verticalAlign}${className ? ` ${className}` : ''}`}>{payload.filter(item => item.type !== 'none').map((item, index) => {
    const configItem = payloadConfig(config, item, `${nameKey || item.dataKey || 'value'}`);
    return <div className="ef-chart-legend__item" key={index}>{configItem?.icon && !hideIcon ? React.createElement(configItem.icon) : <span className="ef-chart-legend__mark" ref={styleRef({ 'background-color': item.color })} />}{configItem?.label}</div>;
  })}</div>;
}
