# ThemeToggle

One theme control for every Efolusi site, following the [theme contract](../../guidelines/theming.md#theme-contract). `ThemeToggle` is a single 44px button that cycles Light, Dark and System. On System it follows the operating system live. The choice is saved in the `efolusi_theme` cookie on `.efolusi.com`, so it carries across every subdomain; localStorage `efolusi-theme` mirrors it for when cookies are unavailable.

Put the output of `themeInitScript()` in an inline `<script>` in `<head>`, before the page paints. Without it, a dark-mode visitor sees a light flash. Set `lang="id"` for the Indonesian labels; the label names the current theme and the next one.

```jsx
// app/layout.jsx
<head><script dangerouslySetInnerHTML={{ __html: themeInitScript() }} /></head>

// header
<ThemeToggle lang={lang} />
```
