export interface LinePoint { label?: string; value: number; }
export interface LineChartProps {
  data: LinePoint[];
  /** Px @default 150 */
  height?: number;
  /** Soft fill under the line @default true */
  showArea?: boolean;
  /** Dot on every point @default false */
  showDots?: boolean;
  /** Tooltip value formatter */
  format?: (value: number) => string;
  /** BCP 47 locale for number formatting (fixed default keeps server and browser output identical) @default 'en-US' */
  locale?: string;
  /** Accessible name for the chart (role=img); defaults to a summary of the series. A visually hidden table carries every value. */
  'aria-label'?: string;
  style?: React.CSSProperties;
  className?: string;
}
export declare function LineChart(props: LineChartProps): React.JSX.Element;
