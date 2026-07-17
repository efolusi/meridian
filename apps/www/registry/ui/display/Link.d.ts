export interface LinkProps extends React.AnchorHTMLAttributes<HTMLAnchorElement> {
  /** Opens in new tab + trailing ↗ */
  external?: boolean;
  /** Leading Lucide icon */
  icon?: string;
  /** 'quiet' inherits secondary text color @default 'default' */
  variant?: 'default' | 'quiet';
  /** Semibold + trailing → for standalone CTAs */
  standalone?: boolean;
  children?: React.ReactNode;
}
export declare function Link(props: LinkProps): JSX.Element;
