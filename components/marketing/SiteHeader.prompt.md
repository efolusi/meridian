# SiteHeader

The header of every Efolusi product page. It brings the skip link, the brand, the primary links, an `actions` slot and a mobile menu below 860px (Escape closes it and returns focus to the button). Mark the page you are on with `current`, give every link a real destination, and point `skipHref` at the page's `<main id>`.

Meridian fetches nothing: the account entry, the `ThemeToggle` and the main call to action go in `actions`. `actions` renders twice, once in the bar and once in the mobile panel (only one shows at a time), so put no `id` inside it and keep any state it needs outside the slot. `languageSwitch` takes a `LanguageSwitch` (the same component the `SiteFooter` takes), shown before `actions` in the bar and in the mobile panel; it renders twice for the same reason, so give it no `id`. Set `lang="id"` for the Indonesian labels.

```jsx
<SiteHeader
  brand={<><img src="/logo.png" alt="" width="28" height="28" />Komando</>}
  links={[{ label: 'Docs', href: '/en/docs', current: true }, { label: 'Pricing', href: '/en/pricing' }]}
  languageSwitch={<LanguageSwitch current="en" languages={[{ code: 'id', label: 'ID', href: '/id/docs', name: 'Bahasa Indonesia' }, { code: 'en', label: 'EN', href: '/en/docs', name: 'English' }]} />}
  actions={<><ThemeToggle /><Button shape="pill" size="sm">Get in touch</Button></>}
/>
```

On a site without React, render the same markup and load `browser/marketing.js` for the menu; see [theming § Plain HTML sites](../../guidelines/theming.md#plain-html-sites).
