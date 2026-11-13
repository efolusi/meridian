export interface FileDropProps {
  /** Receives the dropped/picked File[] */
  onFiles?: (files: File[]) => void;
  /** Files left out, grouped by reason: 'type' (not in accept), 'size' (over maxSize), 'count' (beyond one when multiple is false) */
  onReject?: (files: File[], reason: 'type' | 'size' | 'count') => void;
  /** Largest accepted file, in bytes */
  maxSize?: number;
  /** input accept string, e.g. "image/*,.pdf". Also filters dropped files; non-matching drops are ignored. */
  accept?: string;
  /** @default true */
  multiple?: boolean;
  /** Replaces "Drop files here or browse" */
  title?: React.ReactNode;
  /** Muted line, e.g. "PNG, MP4, PDF, up to 2 GB" */
  hint?: React.ReactNode;
  style?: React.CSSProperties;
  className?: string;
}
export declare function FileDrop(props: FileDropProps): React.JSX.Element;
