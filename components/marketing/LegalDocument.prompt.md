# LegalDocument

The body of a terms or privacy page. Keep the copy in your dictionaries as plain strings: `[label](href)` makes a link and `**text**` makes it strong; nothing else is read and nothing renders as HTML. `{lang}` in an href becomes the page language, so one dictionary entry serves both. Only http, https, mailto and in-site links render as links.

Each section id is a stable link target that other pages point at (`/terms#refunds`). Give `contentsLabel` for the contents list. The component renders an `<article>`; the page keeps its own `<main>`.

```jsx
<main id="main">
  <LegalDocument lang="en" title="Privacy" meta="Effective 20 November 2026" contentsLabel="Contents"
    backLink={{ label: 'Back to home', href: '/en' }}
    intro={['We collect what we need to run your account. See the [terms](/{lang}/terms#accounts).']}
    sections={[{ id: 'data', head: 'What we collect', blocks: ['Your **email address**.'] }]} />
</main>
```
