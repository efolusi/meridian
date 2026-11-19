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

/** Cookie first, then the efolusi-theme localStorage mirror, else `system`. */
export declare function readThemePreference(doc?: Document, storage?: Storage): ThemePreference;
/** Writes the choice to the efolusi_theme cookie (a year, SameSite=Lax, Secure on https, Domain=.efolusi.com on its hosts) and the efolusi-theme localStorage mirror. */
export declare function writeThemePreference(value: ThemePreference, doc?: Document, storage?: Storage): ThemePreference;
export declare function resolveTheme(preference: ThemePreference, matchMedia?: (query: string) => MediaQueryList): 'light' | 'dark';
export declare function applyTheme(preference: ThemePreference, doc?: Document, matchMedia?: (query: string) => MediaQueryList): 'light' | 'dark';
/** The script to inline in <head> so the first paint has the stored or system theme. */
export declare function themeInitScript(): string;
