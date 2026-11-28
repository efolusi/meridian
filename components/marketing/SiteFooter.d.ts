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
  /** Who holds the copyright. With it the bottom row starts with `© {year} {name}`; without it no copyright line is printed. */
  name?: React.ReactNode;
  /** The copyright year. Left out, the footer reads `new Date().getFullYear()` at render, so nobody edits it every January. Pass it to pin the year (tests, and a server render that must match the browser across New Year). */
  year?: number;
  /** The first year, for a range: `since` before the year prints `{since} to {year}` (`sampai` in Indonesian). Not before the year, one year is printed. */
  since?: number;
  /** The legal row: terms, privacy notice and others, as a nav named "Legal" next to the copyright. Each link is 24px tall at least at a fine pointer and 44px at a coarse pointer. */
  legal?: SiteFooterLink[];
  /** The language slot of the bottom row: give it a `LanguageSwitch`. */
  languageSwitch?: React.ReactNode;
  /** The rest of the bottom row after the copyright, the legal links and the language switch: a made-in line. */
  bottom?: React.ReactNode;
  /** Language of the built-in labels (new tab, year range, legal nav). @default 'en' */
  lang?: 'en' | 'id';
  /** `newTab` is the hidden "(opens in a new tab)", `to` the word of a year range, `legal` the name of the legal nav. */
  labels?: Partial<Record<'newTab' | 'to' | 'legal', string>>;
}
/** A marketing footer: brand and tagline, social icons, link columns and a bottom row (copyright with a computed year, legal links, a language switch). Extra content goes in children, under the tagline. */
export declare const SiteFooter: React.ForwardRefExoticComponent<SiteFooterProps & React.RefAttributes<HTMLElement>>;
