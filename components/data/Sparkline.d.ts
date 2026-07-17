export interface SparklineProps {
  /** Series values */
  data: number[];
  /** @default 120 */ width?: number;
  /** @default 32 */ height?: number;
  /** Color override; inferred from first vs last value */
  direction?: 'up' | 'down' | 'flat';
  /** @default 1.5 */ strokeWidth?: number;
  /** Faint area fill @default true */
  area?: boolean;
  style?: React.CSSProperties;
  className?: string;
}
export declare function Sparkline(props: SparklineProps): JSX.Element;
