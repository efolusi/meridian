export interface ConsoleEntry {
  /** 'log' | 'info' | 'warn' | 'error' | 'debug' */
  level?: 'log' | 'info' | 'warn' | 'error' | 'debug';
  time?: string;
  text: React.ReactNode;
  /** Collapsible stack trace */
  stack?: string;
  /** Right-aligned origin, e.g. 'app.js:12' */
  source?: string;
}
export interface ConsoleProps {
  title?: string;
  entries: ConsoleEntry[];
  /** Viewport height in px. Default 240 */
  height?: number;
  style?: React.CSSProperties;
  className?: string;
}
export declare function Console(props: ConsoleProps): React.JSX.Element;
