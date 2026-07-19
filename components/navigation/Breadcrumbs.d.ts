export interface BreadcrumbItem {
  label: React.ReactNode;
  href?: string;
  onClick?: (e: React.MouseEvent) => void;
}
export interface BreadcrumbsProps {
  /** Last item renders as the current page */
  items: BreadcrumbItem[];
  style?: React.CSSProperties;
  className?: string;
}
export declare function Breadcrumbs(props: BreadcrumbsProps): React.JSX.Element;
