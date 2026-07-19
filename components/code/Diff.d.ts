export interface DiffLine {
  /** @default 'ctx' */
  type?: 'add' | 'del' | 'ctx';
  text: string;
}
export interface DiffProps {
  /** Header: file path etc. Shows +/− counts */
  title?: React.ReactNode;
/** Pre-computed rows. Omit and pass `from`/`to` instead. */
  lines?: DiffLine[];
  /** Original text; diffed against `to` when `lines` is omitted */
  from?: string;
  /** Changed text */
  to?: string;
  /** Multi-file diff; each file is diffed and collapsible */
  files?: Array<{ name: string; from?: string; to?: string; lines?: DiffLine[]; defaultOpen?: boolean }>;
  /** Highlight changed words inside a changed line @default true */
  wordLevel?: boolean;
  /** Unchanged lines kept around each hunk @default 3 */
  contextLines?: number;
  /** Scroll past this height */
  maxHeight?: number | string;
  style?: React.CSSProperties;
  className?: string;
}
export declare function Diff(props: DiffProps): React.JSX.Element;
