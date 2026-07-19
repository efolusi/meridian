export interface FileDropProps {
  /** Receives the dropped/picked File[] */
  onFiles?: (files: File[]) => void;
  /** input accept string, e.g. "image/*,.pdf" */
  accept?: string;
  /** @default true */
  multiple?: boolean;
  /** Replaces "Drop files here or browse" */
  title?: React.ReactNode;
  /** Muted line, e.g. "PNG, MP4, PDF — up to 2 GB" */
  hint?: React.ReactNode;
  style?: React.CSSProperties;
  className?: string;
}
export declare function FileDrop(props: FileDropProps): React.JSX.Element;
