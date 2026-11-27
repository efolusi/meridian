export interface DiffProps {
  /** Header: file path etc. Shows +/− counts */
  title?: React.ReactNode;
  /** Original text; diffed against `to` */
  from?: string;
  /** Changed text */
  to?: string;
  /** Multi-file diff; each file is diffed and collapsible */
  files?: Array<{ name: string; from?: string; to?: string; defaultOpen?: boolean }>;
  /** Highlight changed words inside a changed line @default true */
  wordLevel?: boolean;
  /** Unchanged lines kept around each hunk @default 3 */
  contextLines?: number;
  /** Scroll past this height */
  maxHeight?: number | string;
  /** Names the scroll region of a single diff (or use `aria-labelledby`); a `files` diff names each region after its file @default the title when it is a string, else 'Diff' */
  'aria-label'?: string;
  /** Names the scroll region of a single diff by another element; wins over `aria-label` */
  'aria-labelledby'?: string;
  style?: React.CSSProperties;
  className?: string;
}
export declare function Diff(props: DiffProps): React.JSX.Element;
