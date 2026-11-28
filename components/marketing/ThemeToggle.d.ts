export type ThemePreference = 'light' | 'dark';

export interface ThemeToggleProps extends Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, 'onChange'> {
  /** Language of the built-in labels. @default 'en' */
  lang?: 'en' | 'id';
  /** Override any label: `light`, `dark`, and `next` (the "Switch to" phrase). */
  labels?: Partial<Record<ThemePreference | 'next', string>>;
  /** Called with the new theme after a click. */
  onChange?: (preference: ThemePreference) => void;
}
/** One button that shows the theme in use and flips to the other, Light or Dark. With no stored choice it follows the device live and stores nothing. */
export declare const ThemeToggle: React.ForwardRefExoticComponent<ThemeToggleProps & React.RefAttributes<HTMLButtonElement>>;

/** The efolusi-theme localStorage choice, then the efolusi_theme cookie (dark|light), else null: no choice, the device decides. A `system` value stored by an earlier release is read as null and removed once. */
export declare function readThemePreference(doc?: Document, storage?: Storage): ThemePreference | null;
/** Saves the choice in localStorage `efolusi-theme` and the `efolusi_theme` cookie. Anything but light or dark is refused and returns null. */
export declare function writeThemePreference(value: ThemePreference, doc?: Document, storage?: Storage): ThemePreference | null;
/** Writes light|dark to the `efolusi_theme` cookie: a year, Path=/, SameSite=Lax, Secure on https, Domain=.efolusi.com on efolusi.com hosts. */
export declare function writeThemeCookie(theme: ThemePreference, doc?: Document): void;
/** The choice itself, or with null the device's theme. */
export declare function resolveTheme(preference: ThemePreference | null, matchMedia?: (query: string) => MediaQueryList): 'light' | 'dark';
export declare function applyTheme(preference: ThemePreference | null, doc?: Document, matchMedia?: (query: string) => MediaQueryList): 'light' | 'dark';
/** Runs a theme swap with every transition off: sets `data-theme-switching` on <html>, runs `swap`, flushes the style and removes the attribute after two animation frames (the rule is in tokens/base.css). Returns what `swap` returns. */
export declare function swapTheme<T>(swap: () => T, doc?: Document): T;
/** The script to inline in <head> so the first paint has the stored, inherited or device theme. It stores nothing. */
export declare function themeInitScript(): string;
