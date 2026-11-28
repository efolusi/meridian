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
  /** The radio for the light theme. The menu has no System radio: the theme contract is light and dark only (MD47). @default 'Light' ('Terang') */
  light?: string;
  /** The radio for the dark theme. @default 'Dark' ('Gelap') */
  dark?: string;
  /** The sign-out item. @default 'Sign out' ('Keluar') */
  signOut?: string;
  /** The label and tooltip of the rail button while the rail is open. @default 'Collapse sidebar' ('Ciutkan sidebar') */
  collapse?: string;
  /** The label and tooltip of the rail button while the rail is collapsed. @default 'Expand sidebar' ('Perluas sidebar') */
  expand?: string;
}
export interface SideNavProps {
  /** @default 'Meridian' */
  brand?: string;
  /** An optional tag next to the brand (for example 'Console'). None by default: the head holds the brand and the collapse button only. It is hidden while the rail is collapsed. */
  brandBadge?: React.ReactNode;
  logoSrc?: string;
  groups: SideNavGroup[];
  /** Active item id */
  value: string;
  onChange?: (id: string) => void;
  /** The icon rail, controlled: 72px wide, icons only, every label stays in the DOM as the accessible name. Leave it out to let the rail keep its own state (see `defaultCollapsed`). A controlled rail draws the head button only when `onCollapsedChange` is given. */
  collapsed?: boolean;
  /** The first state of an uncontrolled rail. A choice the viewer stored on this origin wins over it (read before the first paint). @default false */
  defaultCollapsed?: boolean;
  /** Called with the new state when the head button is pressed. */
  onCollapsedChange?: (collapsed: boolean) => void;
  /** Draws the one icon button in the rail head (aria-expanded, aria-controls). It is never drawn on a phone (below 768px the rail lives in a drawer at full width, and an uncontrolled rail is never collapsed there). @default true */
  collapsible?: boolean;
  /** The localStorage key that remembers an uncontrolled rail per viewer. `null` stores nothing. @default 'efolusi-sidenav-collapsed' */
  storageKey?: string | null;
  /** The signed-in person. Draws the foot: one bordered `AccountCard` that is a button and opens the account menu above it. */
  account?: SideNavAccount;
  /** Product items of the account menu (for example Language, Account settings), after the Theme group and before Sign out. */
  menuItems?: SideNavMenuItem[];
  /** Adds the Sign out item, last and set apart, and calls this when it is chosen. */
  onSignOut?: () => void;
  /** Language of the built-in words (the menu and the rail button). @default 'en' */
  lang?: 'en' | 'id';
  /** Override any built-in word. */
  labels?: SideNavLabels;
  style?: React.CSSProperties;
  className?: string;
}
/** The rail: head (brand and the collapse button), grouped nav, and the foot. The foot is the same on every front: one bordered account card, and nothing else at rest. Pressing it opens the account menu (Theme, your items, Sign out). It shows when `account` is given. */
export declare function SideNav(props: SideNavProps): React.JSX.Element;
