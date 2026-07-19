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
  style?: React.CSSProperties;
  className?: string;
}
export declare function LineChart(props: LineChartProps): React.JSX.Element;
