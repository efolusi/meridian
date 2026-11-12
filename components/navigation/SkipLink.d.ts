export interface SkipLinkProps {
  /** Fragment of the target landmark. The link focuses it directly (adding tabIndex=-1 if needed) without changing location.hash. @default '#main' */
  href?: string;
  onClick?: React.MouseEventHandler<HTMLAnchorElement>;
  children?: React.ReactNode;
  style?: React.CSSProperties;
  className?: string;
}
export declare function SkipLink(props: SkipLinkProps): React.JSX.Element;
