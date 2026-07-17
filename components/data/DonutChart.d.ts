export interface DonutSlice { label: string; value: number; /** Defaults to brand palette */ color?: string; }
export interface DonutChartProps {
  data: DonutSlice[];
  /** Px @default 140 */
  size?: number;
  /** Ring thickness (viewBox units) @default 16 */
  thickness?: number;
  /** Center caption */
  centerLabel?: React.ReactNode;
  /** Center figure */
  centerValue?: React.ReactNode;
  /** Hover value formatter */
  format?: (value: number) => string;
  style?: React.CSSProperties;
  className?: string;
}
export declare function DonutChart(props: DonutChartProps): JSX.Element;
