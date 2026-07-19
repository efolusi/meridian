export interface UsageMeterProps extends React.HTMLAttributes<HTMLDivElement> {
  used: number;
  limit: number;
  /** @default 'Usage' */
  label?: string;
  /** Appended to figures, e.g. 'tokens' */
  unit?: string;
  /** Mono figure bottom-right, e.g. '$4.82' */
  cost?: string;
  /** Muted note bottom-left */
  hint?: string;
  /** Warning tone threshold (0-1) @default 0.8 */
  warnAt?: number;
  /** Count the figure and bar up on mount/change */
  animated?: boolean;
  /** Figure formatter @default toLocaleString */
  format?: (v: number) => string;
  style?: React.CSSProperties;
  className?: string;
}
export declare function UsageMeter(props: UsageMeterProps): React.JSX.Element;
