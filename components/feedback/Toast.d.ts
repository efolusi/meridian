export interface ToastProps {
  /** @default 'info' */
  tone?: 'info' | 'success' | 'warning' | 'danger';
  title: React.ReactNode;
  description?: React.ReactNode;
  actionLabel?: string;
  onAction?: () => void;
  /** Shows a dismiss ✕ */
  onClose?: () => void;
  style?: React.CSSProperties;
  className?: string;
}
export declare function Toast(props: ToastProps): JSX.Element;

export interface ToastStackProps {
  /** Toasts, stacked fixed bottom-right */
  children?: React.ReactNode;
  style?: React.CSSProperties;
  className?: string;
}
export declare function ToastStack(props: ToastStackProps): JSX.Element;
