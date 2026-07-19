export interface WebPreviewLog {
  /** 'log' | 'info' | 'warn' | 'error' */
  level?: 'log' | 'info' | 'warn' | 'error';
  text: React.ReactNode;
}
export interface WebPreviewProps {
  url?: string;
  /** Stage height in px. Default 340 */
  height?: number;
  /** Console entries; error count badges the toggle */
  logs?: WebPreviewLog[];
  defaultConsoleOpen?: boolean;
  /** Rendered instead of an iframe (mock content) */
  children?: React.ReactNode;
  onUrlChange?: (url: string) => void;
  style?: React.CSSProperties;
  className?: string;
}
export declare function WebPreview(props: WebPreviewProps): React.JSX.Element;
