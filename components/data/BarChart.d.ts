export interface BarChartProps {
  /** Numbers, or { value, label } for hover titles */
  data: Array<number | { value: number; label?: string }>;
  /** @default 140 */
  height?: number;
  /** Ink-fill the last N bars */
  highlightLast?: number;
  /** X-axis labels, spread edge to edge */
  labels?: string[];
  /** Hover value formatter */
  format?: (v: number) => string;
  /** @deprecated Use `format`. Alias kept for one major; `format` wins when both are passed. */
  formatValue?: (v: number) => string;
  style?: React.CSSProperties;
  className?: string;
}
export declare function BarChart(props: BarChartProps): React.JSX.Element;
