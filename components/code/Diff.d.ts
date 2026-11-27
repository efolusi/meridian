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
  /** Default name of a single diff's scroll part when you give none and the title is not a string; the part is then a group. Translate it here @default 'Diff' */
  label?: string;
  /** Names the scroll part of a single diff and makes it a region; ignored with `files` */
  'aria-label'?: string;
  /** Names the scroll part of a single diff by another element and makes it a region; wins over `aria-label` */
  'aria-labelledby'?: string;
  style?: React.CSSProperties;
  className?: string;
}
export declare function Diff(props: DiffProps): React.JSX.Element;
