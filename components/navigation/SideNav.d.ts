export interface SideNavItem { id: string; label: React.ReactNode; icon: string; badge?: React.ReactNode; }
export interface SideNavGroup { /** Uppercase group heading (omit for main nav) */ label?: string; items: SideNavItem[]; }
export interface SideNavAccount {
  /** Display name. Without it the card shows the email on the first line only. */
  name?: string | null;
  email: string;
  /** Profile picture URL. Initials show when it is missing or fails to load. */
  image?: string | null;
}
export interface SideNavMenuItem {
  id: string;
  label: React.ReactNode;
  /** A Meridian icon name drawn before the label. */
  icon?: string;
  /** Called when the item is chosen; the menu then closes. */
  onSelect?: (event: React.SyntheticEvent) => void;
}
export interface SideNavLabels {
  /** The heading of the theme group in the account menu. @default 'Theme' ('Tema' with lang="id") */
  theme?: string;
  /** The radio for the light theme. @default 'Light' ('Terang') */
  light?: string;
  /** The radio for the dark theme. @default 'Dark' ('Gelap') */
  dark?: string;
  /** The sign-out item. @default 'Sign out' ('Keluar') */
  signOut?: string;
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
  /** The icon rail: 72px wide, icons only, every label stays in the DOM as the accessible name. The foot shows the avatar alone and opens the same menu. The product decides when; `SideNav` draws no toggle. @default false */
  collapsed?: boolean;
  /** The signed-in person. Draws the foot: one bordered `AccountCard` that is a button and opens the account menu above it. */
  account?: SideNavAccount;
  /** Product items of the account menu (for example Language, Account settings), after the Theme group and before Sign out. */
  menuItems?: SideNavMenuItem[];
  /** Adds the Sign out item, last and set apart, and calls this when it is chosen. */
  onSignOut?: () => void;
  /** Language of the menu's built-in words. @default 'en' */
  lang?: 'en' | 'id';
  /** Override any built-in word of the menu. */
  labels?: SideNavLabels;
  style?: React.CSSProperties;
  className?: string;
}
/** The rail: brand, grouped nav, and the foot. The foot is the same on every front: one bordered account card, and nothing else at rest. Pressing it opens the account menu (Theme, your items, Sign out). It shows when `account` is given. */
export declare function SideNav(props: SideNavProps): React.JSX.Element;
