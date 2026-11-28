# ThemeToggle

One theme control for every Efolusi site, following the [theme contract](../../guidelines/theming.md#theme-contract). `ThemeToggle` is a single button, 36px at a fine pointer (30px in compact density) and 44px at a coarse pointer, that shows the theme in use and flips to the other, Light or Dark; there is no system option. With no stored choice it follows the device live and stores nothing. It keeps `data-theme` on `<html>` at `light` or `dark`; Light never removes the attribute, so test `getAttribute('data-theme') === 'dark'`, not `hasAttribute`. The person's choice is saved in localStorage `efolusi-theme` when they switch; the `efolusi_theme` cookie on `.efolusi.com` carries it, so a first visit to another Efolusi site starts in the same theme. A `system` value stored by an earlier release is read as no choice and removed.

Put the output of `themeInitScript()` (import it from `@efolusi/meridian/theme` in a server layout) in an inline `<script>` in `<head>`, before the page paints. Without it, a dark-mode visitor sees a light flash. Set `lang="id"` for the Indonesian labels; the label names the action, such as "Switch to dark theme".

```jsx
// app/layout.jsx: import { themeInitScript } from '@efolusi/meridian/theme';
<head><script dangerouslySetInnerHTML={{ __html: themeInitScript() }} /></head>

// header
<ThemeToggle lang={lang} />
```

Every `ThemeToggle` on a page stays in step: a choice made in one updates the others, and a choice made in another tab of the same site updates this one. A choice made on another `*.efolusi.com` product reaches this site only through the cookie, so it shows on the next page load here, not live.

On a site without React, load `browser/theme-init.js` and `browser/marketing.js` instead; see [theming § Plain HTML sites](../../guidelines/theming.md#plain-html-sites).
