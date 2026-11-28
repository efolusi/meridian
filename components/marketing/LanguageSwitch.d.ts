export interface LanguageSwitchLanguage {
  /** The language code. It becomes `lang` on the item and `hreflang` on the link (`id`, `en`). */
  code: string;
  /** The short text shown: `ID`, `EN`. */
  label: string;
  /** The same page in this language. The current language's `href` is not used. */
  href: string;
  /** The language spelled in itself, for the accessible name: `Bahasa Indonesia`, `English`. Known for `en` and `id`; other codes fall back to Intl, then to `label`. */
  name?: string;
}
export interface LanguageSwitchProps extends React.HTMLAttributes<HTMLElement> {
  /** One entry per language the page exists in, including the current one. */
  languages: LanguageSwitchLanguage[];
  /** The `code` of the language the page is in. It is shown as the current item (`aria-current="true"`), not as a link. */
  current: string;
  /** `md` is a 44px target at every pointer, as the ThemeToggle. `sm` is 28px at a fine pointer (24px in compact density) and 44px at a coarse pointer. @default 'md' */
  size?: 'sm' | 'md';
  /** Language of the built-in nav name. @default 'en' */
  lang?: 'en' | 'id';
  labels?: Partial<Record<'nav', string>>;
}
/** The language switch: one short code per language, each a link (`hreflang`, `lang`, the language's own name as its accessible name) to the same page in that language; the language in use is marked `aria-current="true"` and is not a link. */
export declare const LanguageSwitch: React.ForwardRefExoticComponent<LanguageSwitchProps & React.RefAttributes<HTMLElement>>;
