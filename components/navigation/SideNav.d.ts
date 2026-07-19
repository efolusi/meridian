export interface SideNavItem { id: string; label: React.ReactNode; icon: string; badge?: React.ReactNode; }
export interface SideNavGroup { /** Uppercase group heading (omit for main nav) */ label?: string; items: SideNavItem[]; }
export interface SideNavProps {
  /** @default 'Efolusi' */
  brand?: string;
  /** Badge next to brand (e.g. 'Console') */
  brandBadge?: React.ReactNode;
  logoSrc?: string;
  groups: SideNavGroup[];
  /** Active item id */
  value: string;
  onChange?: (id: string) => void;
  /** Pinned bottom slot (account card…) */
  footer?: React.ReactNode;
  style?: React.CSSProperties;
  className?: string;
}
export declare function SideNav(props: SideNavProps): React.JSX.Element;
