export interface StatusDotProps extends Omit<React.HTMLAttributes<HTMLSpanElement>, 'children'> {
  /** @default 'ok' */
  state?: 'ok' | 'warn' | 'err' | 'busy' | 'off';
  label?: React.ReactNode;
  /** Text announced for the state; defaults to OK / Warning / Error / Busy / Offline */
  stateLabel?: string;
  /** Radiating pulse for live states */
  pulse?: boolean;
  style?: React.CSSProperties;
  className?: string;
}
export declare function StatusDot(props: StatusDotProps): React.JSX.Element;
