export interface SiteHeaderLink {
  label: React.ReactNode;
  href: string;
  /** Marks the page you are on (aria-current="page"). */
  current?: boolean;
}
export interface SiteHeaderProps extends React.HTMLAttributes<HTMLElement> {
  /** The logo and name. Give `brandLabel` when the brand is an image only. */
  brand: React.ReactNode;
  /** @default '/' */
  brandHref?: string;
  brandLabel?: string;
  /** Primary links. Each needs a real destination. */
  links?: SiteHeaderLink[];
  /** The product's own controls: account entry, ThemeToggle, the main call to action. Rendered twice (the bar and the mobile panel; one is hidden), so put no `id` inside and keep any state outside. */
  actions?: React.ReactNode;
  /** The language slot, before `actions`: give it a `LanguageSwitch`. Rendered twice like `actions` (the bar and the mobile panel; one is hidden). */
  languageSwitch?: React.ReactNode;
  /** Language of the built-in labels (menu, skip link, nav name). @default 'en' */
  lang?: 'en' | 'id';
  labels?: Partial<Record<'menu' | 'skip' | 'nav', string>>;
  /** Target of the skip link, the id of the page's <main>. @default '#main' */
  skipHref?: string;
}
/** A sticky marketing header with a skip link, primary links, an actions slot and a mobile menu (Escape closes it). */
export declare const SiteHeader: React.ForwardRefExoticComponent<SiteHeaderProps & React.RefAttributes<HTMLElement>>;
