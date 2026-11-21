# ThemeToggle

One theme control for every Efolusi site, following the [theme contract](../../guidelines/theming.md#theme-contract). `ThemeToggle` is a single 44px button that cycles Light, Dark and System. On System it follows the operating system live. It keeps `data-theme` on `<html>` at the resolved `light` or `dark`; Light never removes the attribute, so test `getAttribute('data-theme') === 'dark'`, not `hasAttribute`. The choice is saved in localStorage `efolusi-theme`; the `efolusi_theme` cookie on `.efolusi.com` carries the resolved light or dark, so a first visit to another Efolusi site starts in the same theme.

Put the output of `themeInitScript()` (import it from `@efolusi/meridian/theme` in a server layout) in an inline `<script>` in `<head>`, before the page paints. Without it, a dark-mode visitor sees a light flash. Set `lang="id"` for the Indonesian labels; the label names the current theme and the next one.

```jsx
// app/layout.jsx: import { themeInitScript } from '@efolusi/meridian/theme';
<head><script dangerouslySetInnerHTML={{ __html: themeInitScript() }} /></head>

// header
<ThemeToggle lang={lang} />
```

Every `ThemeToggle` on a page stays in step: a choice made in one updates the others, and a choice made in another tab of the same site updates this one. A choice made on another `*.efolusi.com` product reaches this site only through the cookie, so it shows on the next page load here, not live.

On a site without React, load `browser/theme-init.js` and `browser/marketing.js` instead; see [theming § Plain HTML sites](../../guidelines/theming.md#plain-html-sites).
