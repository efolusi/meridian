export interface BannerProps {
  /** @default 'neutral' */
  tone?: 'neutral' | 'brand' | 'warning' | 'danger';
  /** Lucide icon name */
  icon?: string;
  /** Action slot, rendered as-is. */
  action?: React.ReactNode;
  /** Shows a dismiss ✕ */
  onDismiss?: () => void;
  children?: React.ReactNode;
  style?: React.CSSProperties;
  className?: string;
}
export declare function Banner(props: BannerProps): React.JSX.Element;
