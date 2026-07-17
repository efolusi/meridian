export interface DiffLine {
  /** @default 'ctx' */
  type?: 'add' | 'del' | 'ctx';
  text: string;
}
export interface DiffProps {
  /** Header: file path etc. Shows +/− counts */
  title?: React.ReactNode;
  lines: DiffLine[];
  /** Scroll past this height */
  maxHeight?: number | string;
  style?: React.CSSProperties;
  className?: string;
}
export declare function Diff(props: DiffProps): JSX.Element;
