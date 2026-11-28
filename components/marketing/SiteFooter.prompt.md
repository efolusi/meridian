# SiteFooter

The footer of every Efolusi product page: the brand and a one-line tagline, social icon links, as many link columns as the site really has, and a bottom row: the copyright, the legal links and the language switch. Each column is a small `nav` named by its heading. Links to other sites open in a new tab and say so to screen readers (`lang="id"` for the Indonesian wording).

The bottom row is `© {year} {name}`, then the `legal` links (terms, privacy notice and others, a `nav` named "Legal"), then the `languageSwitch` slot (a `LanguageSwitch`), then `bottom` for anything else. Never type the year: `year` is read from `new Date().getFullYear()` at render. Pass `year` only to pin it (tests, a server render that must match the browser across New Year). `since` makes a range, `{since} to {year}` (`{since} sampai {year}` with `lang="id"`), when it is before the year. A legal link is 24px tall at least at a fine pointer and 44px at a coarse pointer.

```jsx
<SiteFooter
  brand="Komando"
  tagline="Manage servers safely, from the terminal or your agent."
  columns={[{ heading: 'Product', links: [{ label: 'Docs', href: '/en/docs' }, { label: 'Pricing', href: '/en/pricing' }] }]}
  socials={[{ label: 'GitHub', href: 'https://github.com/efolusi', icon: <Icon name="github" size={20} aria-hidden="true" /> }]}
  name="PT Efolusi Dunia Teknologi"
  since={FOUNDED_YEAR}
  legal={[{ label: 'Platform terms', href: '/en/terms' }, { label: 'Privacy notice', href: '/en/privacy' }]}
  languageSwitch={<LanguageSwitch size="sm" current="en" languages={languages} />}
/>
```
