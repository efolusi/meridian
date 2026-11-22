export interface TopNavProps {
  title?: React.ReactNode;
  /** Slot before the title (back button, breadcrumbs) */
  leading?: React.ReactNode;
  /** Right-aligned actions (search, bell, avatar) */
  children?: React.ReactNode;
  /** A pill inset from the edges (default). false keeps a full-width bar. Both are chrome glass. */
  floating?: boolean;
  style?: React.CSSProperties;
  className?: string;
}
export declare function TopNav(props: TopNavProps): React.JSX.Element;
