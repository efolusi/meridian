export interface LinkProps extends React.AnchorHTMLAttributes<HTMLAnchorElement> {
  /** Opens in new tab + trailing ↗ */
  external?: boolean;
  /** Leading Lucide icon */
  icon?: string;
  /** 'quiet' is secondary text, plain at rest and underlined on hover and focus: for navigation and footers, never running text @default 'default' */
  variant?: 'default' | 'quiet';
  /** Semibold + trailing → for standalone CTAs */
  standalone?: boolean;
  children?: React.ReactNode;
}
export declare function Link(props: LinkProps): React.JSX.Element;
