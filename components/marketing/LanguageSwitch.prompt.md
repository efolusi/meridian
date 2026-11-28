# LanguageSwitch

The language switch of every Efolusi site: one short code per language (ID, EN), each a link to the same page in that language.

Put it in the `actions` of `SiteHeader` beside `ThemeToggle`, or in the language slot of `SiteFooter`. It lives in the marketing group with the header and footer that hold it. Use it where a page can be read in more than one language.

Give every language its own `href` (the product knows the other URL; Meridian fetches and stores nothing). Each link carries `hreflang` and `lang` with the language's code, and an accessible name that spells the language in itself and ends with the visible code: `Bahasa Indonesia (ID)`, `English (EN)`, so a voice user can say "click ID". The language in use is marked `aria-current="true"` and is not a link: a link to the page you are on does nothing. Pass `name` for any code other than `en` and `id`.

Each target is 44px at a coarse pointer. At a fine pointer `size="md"` (default) is 44px as the `ThemeToggle`, and `size="sm"` is 28px (24px in compact density), never less than 24px. The focus ring comes from the library, and the only motion is the colour transition.

```jsx
<LanguageSwitch
  lang="id"
  current="id"
  languages={[
    { code: 'id', label: 'ID', href: '/id/docs', name: 'Bahasa Indonesia' },
    { code: 'en', label: 'EN', href: '/en/docs', name: 'English' },
  ]}
/>
```

It renders plain `<a>` elements, as `SiteHeader` and `SiteFooter` do: a language change loads the page in the other language, so a full navigation is right. With Next.js, build each `href` from the locale route; `next/link` is not needed. `SiteHeader` renders `actions` twice (the bar and the mobile panel), so the switch uses no `id`.

On a site without React, copy the markup: `<nav class="ef-language-switch" data-size="md" aria-label="Language"><ul class="ef-language-switch__list"><li><span class="ef-language-switch__item" role="link" aria-disabled="true" aria-current="true" lang="id" aria-label="Bahasa Indonesia (ID)">ID</span></li><li><a class="ef-language-switch__item" href="/en/" hreflang="en" lang="en" aria-label="English (EN)">EN</a></li></ul></nav>`.
