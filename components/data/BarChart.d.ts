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
  /** BCP 47 locale for number formatting (fixed default keeps server and browser output identical) @default 'en-US' */
  locale?: string;
  /** Accessible name for the chart (role=img); defaults to a summary of the series. A visually hidden table carries every value. */
  'aria-label'?: string;
  style?: React.CSSProperties;
  className?: string;
}
export declare function BarChart(props: BarChartProps): React.JSX.Element;
