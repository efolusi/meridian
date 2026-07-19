export interface CitationSource { title: string; url?: string; domain?: string; description?: string; }
export interface CitationProps {
  /** Superscript number */
  index: number;
  href?: string;
  /** Tooltip + aria label */
  title?: string;
  /** Hover preview card(s) with pager when 2+ */
  sources?: CitationSource[];
  onClick?: (e: React.MouseEvent) => void;
  style?: React.CSSProperties;
  className?: string;
}
export interface Source { index?: number; title: string; url?: string; domain?: string; }
export interface SourceListProps {
  sources: Source[];
  /** @default 'Sources' */
  title?: string;
  style?: React.CSSProperties;
  className?: string;
}
export declare function Citation(props: CitationProps): React.JSX.Element;
export declare function SourceList(props: SourceListProps): React.JSX.Element;
