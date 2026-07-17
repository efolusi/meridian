export interface BannerProps {
  /** @default 'neutral' */
  tone?: 'neutral' | 'brand' | 'warning' | 'danger';
  /** Lucide icon name */
  icon?: string;
  /** Underlined action label */
  action?: string;
  onAction?: () => void;
  /** Shows a dismiss ✕ */
  onDismiss?: () => void;
  children?: React.ReactNode;
  style?: React.CSSProperties;
  className?: string;
}
export declare function Banner(props: BannerProps): JSX.Element;
