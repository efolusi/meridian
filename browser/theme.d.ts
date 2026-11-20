// Generated from components/marketing/ThemeToggle.d.ts by scripts/build_browser.mjs. Do not edit.
export type ThemePreference = 'system' | 'light' | 'dark';
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
export declare const THEME_PREFERENCES: ThemePreference[];
export declare const THEME_STORAGE_KEY: 'efolusi-theme';
export declare const THEME_CHANGE_EVENT: 'efolusi-theme-change';
export declare const LABELS: Record<'en' | 'id', Record<ThemePreference | 'next', string>>;
