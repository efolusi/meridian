# TabBar

Use `TabBar` on phone screens for three to five top destinations. It floats above the home indicator as chrome glass and hides from 720px up, where `TopNav` carries the same links. Give it the `value` of the current destination; that item gets `aria-current="page"`. Give the page `padding-block-end: var(--ef-tabbar-space)` on phones so the last content is not under it; while the bar shows, Meridian sets `scroll-padding-block-end` to the same space, so a focused element is never scrolled under it. Without an `aria-label` the landmark is named "Main navigation" (`lang="id"`: "Navigasi utama").

```jsx
<TabBar aria-label="Screens" value="docs" items={[
  { id: 'home', label: 'Products', href: '/' },
  { id: 'docs', label: 'Docs', href: '/docs' },
  { id: 'settings', label: 'Settings', href: '/settings' },
]} />
```
