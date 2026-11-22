export interface TopNavProps {
  title?: React.ReactNode;
  /** Slot before the title (back button, breadcrumbs) */
  leading?: React.ReactNode;
  /** Right-aligned actions (search, bell, avatar) */
  children?: React.ReactNode;
  /** A pill inset from the edges. Default false: a full-width bar. */
  floating?: boolean;
  /** Stays at the top while content scrolls under it, and blurs it. Default false. Sets scroll-padding so focus is never hidden. */
  sticky?: boolean;
  /** Language of the built-in landmark name */
  lang?: 'en' | 'id';
  /** Override the landmark name: { header } */
  labels?: { header?: string };
  style?: React.CSSProperties;
  className?: string;
}
export declare function TopNav(props: TopNavProps): React.JSX.Element;
