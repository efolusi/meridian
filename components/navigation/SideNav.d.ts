export interface SideNavItem { id: string; label: React.ReactNode; icon: string; badge?: React.ReactNode; }
export interface SideNavGroup { /** Uppercase group heading (omit for main nav) */ label?: string; items: SideNavItem[]; }
export interface SideNavAccount {
  /** Display name. Without it the card shows the email on the first line only. */
  name?: string | null;
  email: string;
  /** Profile picture URL. Initials show when it is missing or fails to load. */
  image?: string | null;
}
export interface SideNavLabels {
  /** The theme row. @default 'Theme' ('Tema' with lang="id") */
  theme?: string;
  /** The state shown when the page is light. @default 'Light' ('Terang') */
  light?: string;
  /** The state shown when the page is dark. @default 'Dark' ('Gelap') */
  dark?: string;
  /** The sign-out row. @default 'Sign out' ('Keluar') */
  signOut?: string;
  /** The phrase before the other theme in the row's tooltip. @default 'Switch to' ('Ganti ke') */
  next?: string;
}
export interface SideNavProps {
  /** @default 'Meridian' */
  brand?: string;
  /** Badge next to brand (e.g. 'Console') */
  brandBadge?: React.ReactNode;
  logoSrc?: string;
  groups: SideNavGroup[];
  /** Active item id */
  value: string;
  onChange?: (id: string) => void;
  /** The icon rail: 72px wide, icons only, every label stays in the DOM as the accessible name. The product decides when; `SideNav` draws no toggle. @default false */
  collapsed?: boolean;
  /** The signed-in person. Draws the one bordered `AccountCard` at the foot. */
  account?: SideNavAccount;
  /** Draws the labelled sign-out row of the foot and calls this when it is pressed. */
  onSignOut?: () => void;
  /** Language of the foot's built-in labels. @default 'en' */
  lang?: 'en' | 'id';
  /** Override any label of the foot. */
  labels?: SideNavLabels;
  style?: React.CSSProperties;
  className?: string;
}
/** The rail: brand, grouped nav, and the foot. The foot is the same on every front: a theme row, a sign-out row, then one bordered account card. It shows when `account` or `onSignOut` is given. */
export declare function SideNav(props: SideNavProps): React.JSX.Element;
