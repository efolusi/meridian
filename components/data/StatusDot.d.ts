export interface StatusDotProps extends Omit<React.HTMLAttributes<HTMLSpanElement>, 'children'> {
  /** @default 'ok' */
  status?: 'ok' | 'warn' | 'err' | 'busy' | 'off';
  /** @deprecated use `status` */
  state?: 'ok' | 'warn' | 'err' | 'busy' | 'off';
  label?: React.ReactNode;
  /** Text announced for the status; defaults to OK / Warning / Error / Busy / Offline */
  statusLabel?: string;
  /** @deprecated use `statusLabel` */
  stateLabel?: string;
  /** Radiating pulse for live states */
  pulse?: boolean;
  style?: React.CSSProperties;
  className?: string;
}
export declare function StatusDot(props: StatusDotProps): React.JSX.Element;
