export interface StatusDotProps {
  /** @default 'ok' */
  state?: 'ok' | 'warn' | 'err' | 'busy' | 'off';
  label?: React.ReactNode;
  /** Radiating pulse for live states */
  pulse?: boolean;
  style?: React.CSSProperties;
  className?: string;
}
export declare function StatusDot(props: StatusDotProps): JSX.Element;
