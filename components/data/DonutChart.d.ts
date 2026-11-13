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
  /** BCP 47 locale for number formatting (fixed default keeps server and browser output identical) @default 'en-US' */
  locale?: string;
  /** Accessible name for the chart (role=img); defaults to a summary of the series. A visually hidden table carries every value. */
  'aria-label'?: string;
  style?: React.CSSProperties;
  className?: string;
}
export declare function DonutChart(props: DonutChartProps): React.JSX.Element;
