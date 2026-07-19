export interface ProgressProps {
  /** @default 0 */
  value?: number;
  /** @default 100 */
  max?: number;
  label?: string;
  /** Show value right of the label (default = percent) */
  showValue?: boolean;
  format?: (value: number, max: number) => string;
  /** @default 'default' (ink) */
  tone?: 'default' | 'warning' | 'danger';
  style?: React.CSSProperties;
  className?: string;
}
export declare function Progress(props: ProgressProps): React.JSX.Element;
