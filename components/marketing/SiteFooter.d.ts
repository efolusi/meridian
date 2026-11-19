export interface SiteFooterLink {
  label: React.ReactNode;
  href: string;
  /** Opens in a new tab with a hidden "(opens in a new tab)". @default true for http(s) links */
  external?: boolean;
}
export interface SiteFooterProps extends React.HTMLAttributes<HTMLElement> {
  brand?: React.ReactNode;
  /** @default '/' */
  brandHref?: string;
  tagline?: React.ReactNode;
  /** Link groups, each a small nav with its own heading. */
  columns?: { heading: string; links: SiteFooterLink[] }[];
  /** Icon links; `icon` is the glyph, `label` its accessible name. */
  socials?: { label: string; href: string; icon: React.ReactNode }[];
  /** The bottom row: rights line, made-in line. */
  bottom?: React.ReactNode;
  /** Language of the "(opens in a new tab)" label. @default 'en' */
  lang?: 'en' | 'id';
  labels?: Partial<Record<'newTab', string>>;
}
/** A marketing footer: brand and tagline, social icons, link columns and a bottom row. Extra content goes in children, under the tagline. */
export declare const SiteFooter: React.ForwardRefExoticComponent<SiteFooterProps & React.RefAttributes<HTMLElement>>;
