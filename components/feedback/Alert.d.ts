export interface AlertProps {
  /** @default 'info' */
  tone?: 'info' | 'success' | 'warning' | 'danger';
  /** Override the tone icon (Lucide name) */
  icon?: string;
  title?: React.ReactNode;
  description?: React.ReactNode;
  /** Right-aligned slot (button/link) */
  action?: React.ReactNode;
  children?: React.ReactNode;
  style?: React.CSSProperties;
  className?: string;
}
export declare function Alert(props: AlertProps): React.JSX.Element;
