export interface SkipLinkProps {
  /** Target landmark; it needs tabIndex={-1} to receive focus @default '#main' */
  href?: string;
  children?: React.ReactNode;
  style?: React.CSSProperties;
  className?: string;
}
export declare function SkipLink(props: SkipLinkProps): React.JSX.Element;
