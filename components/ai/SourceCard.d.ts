export interface SourceCardProps {
  href?: string;
  title: React.ReactNode;
  description?: React.ReactNode;
  /** e.g. 'stripe.com' */
  domain?: string;
  /** Favicon URL; falls back to icon */
  favicon?: string;
  icon?: string;
  thumbnail?: string;
  /** 'card' | 'plain' */
  variant?: 'card' | 'plain';
  onClick?: (e: React.MouseEvent) => void;
  style?: React.CSSProperties;
  className?: string;
}
export declare function SourceCard(props: SourceCardProps): React.JSX.Element;
