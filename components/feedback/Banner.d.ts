export interface BannerProps {
  /** @default 'neutral' */
  tone?: 'neutral' | 'brand' | 'warning' | 'danger';
  /** Lucide icon name */
  icon?: string;
  /** Action slot: a node (rendered as-is) or, deprecated, a string label used with `onAction`. */
  action?: React.ReactNode;
  /** @deprecated pass a node to `action` instead */
  onAction?: () => void;
  /** Shows a dismiss ✕ */
  onDismiss?: () => void;
  children?: React.ReactNode;
  style?: React.CSSProperties;
  className?: string;
}
export declare function Banner(props: BannerProps): React.JSX.Element;
