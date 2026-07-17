export interface TopNavProps {
  title?: React.ReactNode;
  /** Slot before the title (back button, breadcrumbs) */
  leading?: React.ReactNode;
  /** Right-aligned actions (search, bell, avatar) */
  children?: React.ReactNode;
  style?: React.CSSProperties;
  className?: string;
}
export declare function TopNav(props: TopNavProps): JSX.Element;
