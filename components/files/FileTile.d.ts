export interface FileTileProps {
  name: string;
  /** e.g. "4.2 MB" */
  size?: string;
  /** Icon family; inferred from extension when omitted */
  kind?: 'image' | 'video' | 'audio' | 'code' | 'archive' | 'doc';
  /** Meta text after size, e.g. "Converted" */
  status?: string;
  /** 0–100 shows an upload bar instead of meta */
  progress?: number;
  /** Red meta line */
  error?: string;
  onRemove?: () => void;
  /** Extra right-side controls */
  actions?: React.ReactNode;
  style?: React.CSSProperties;
  className?: string;
}
export declare function FileTile(props: FileTileProps): JSX.Element;
