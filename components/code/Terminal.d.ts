export interface TerminalLine {
  text: string;
  /** cmd gets a $ prompt; ok/err/info are tinted */
  type?: 'cmd' | 'out' | 'ok' | 'err' | 'info';
  /** Muted timestamp prefix */
  time?: string;
}
export interface TerminalProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Header label, e.g. "deploy@efolusi-prod" */
  host?: string;
  /** Strings or line objects */
  lines?: Array<string | TerminalLine>;
  /** Blinking caret after the last line */
  live?: boolean;
  /** @default 260 */
  maxHeight?: number;
  style?: React.CSSProperties;
  className?: string;
}
export declare function Terminal(props: TerminalProps): React.JSX.Element;
