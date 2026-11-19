# SiteFooter

The footer of every Efolusi product page: the brand and a one-line tagline, social icon links, as many link columns as the site really has, and a bottom row for the rights line. Each column is a small `nav` named by its heading. Links to other sites open in a new tab and say so to screen readers (`lang="id"` for the Indonesian wording).

```jsx
<SiteFooter
  brand="Komando"
  tagline="Manage servers safely, from the terminal or your agent."
  columns={[{ heading: 'Product', links: [{ label: 'Docs', href: '/en/docs' }] }, { heading: 'Legal', links: [{ label: 'Privacy', href: '/en/privacy' }, { label: 'Terms', href: '/en/terms' }] }]}
  socials={[{ label: 'GitHub', href: 'https://github.com/efolusi', icon: <Icon name="github" size={20} aria-hidden="true" /> }]}
  bottom={<p>© 2026 Efolusi</p>}
/>
```
