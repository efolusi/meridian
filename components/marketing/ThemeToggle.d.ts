export type ThemePreference = 'system' | 'light' | 'dark';

export interface ThemeToggleProps extends Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, 'onChange'> {
  /** Language of the built-in labels. @default 'en' */
  lang?: 'en' | 'id';
  /** Override any label: `system`, `light`, `dark`, and `next` (the "switch to" phrase). */
  labels?: Partial<Record<ThemePreference | 'next', string>>;
  /** Called with the new preference after a click. */
  onChange?: (preference: ThemePreference) => void;
}
/** One button that cycles Light, Dark and System; follows the OS live while on System. */
export declare const ThemeToggle: React.ForwardRefExoticComponent<ThemeToggleProps & React.RefAttributes<HTMLButtonElement>>;

/** The efolusi-theme localStorage choice, then the efolusi_theme cookie (dark|light), else `system`. */
export declare function readThemePreference(doc?: Document, storage?: Storage): ThemePreference;
/** Saves the choice in localStorage `efolusi-theme` and its resolved light|dark in the `efolusi_theme` cookie. */
export declare function writeThemePreference(value: ThemePreference, doc?: Document, storage?: Storage, matchMedia?: (query: string) => MediaQueryList): ThemePreference;
/** Writes the resolved theme to the `efolusi_theme` cookie: a year, Path=/, SameSite=Lax, Secure on https, Domain=.efolusi.com on efolusi.com hosts. Never `system`. */
export declare function writeThemeCookie(theme: 'light' | 'dark', doc?: Document): void;
export declare function resolveTheme(preference: ThemePreference, matchMedia?: (query: string) => MediaQueryList): 'light' | 'dark';
/** With the choice on System here, rewrites the `efolusi_theme` cookie to the theme shown now. */
export declare function refreshSystemCookie(doc?: Document, storage?: Storage, matchMedia?: (query: string) => MediaQueryList): void;
export declare function applyTheme(preference: ThemePreference, doc?: Document, matchMedia?: (query: string) => MediaQueryList): 'light' | 'dark';
/** The script to inline in <head> so the first paint has the stored or system theme. */
export declare function themeInitScript(): string;
