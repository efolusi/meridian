export interface StatProps {
  label: React.ReactNode;
  /** Pre-formatted, e.g. "$48.2k" */
  value: React.ReactNode;
  /** e.g. "12.4%" */
  delta?: React.ReactNode;
  /** Colors + arrows the delta @default 'flat' */
  direction?: 'up' | 'down' | 'flat';
  /** Muted line under the value */
  hint?: React.ReactNode;
  style?: React.CSSProperties;
  className?: string;
}
export declare function Stat(props: StatProps): JSX.Element;
