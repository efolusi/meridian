export interface ExceptionFrame {
  /** Function name */
  fn: string;
  /** e.g. 'api/users.ts:32:11' */
  loc: string;
  active?: boolean;
  /** Dimmed framework frame */
  internal?: boolean;
}
export interface ExceptionSourceLine {
  no: number;
  text: string;
  active?: boolean;
}
export interface ExceptionProps {
  /** e.g. 'TypeError' */
  type?: string;
  message: React.ReactNode;
  frames?: ExceptionFrame[];
  source?: { title: string; lines: ExceptionSourceLine[] };
  defaultOpen?: boolean;
  style?: React.CSSProperties;
  className?: string;
}
export declare function Exception(props: ExceptionProps): JSX.Element;
