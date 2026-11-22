# TabBar

Use `TabBar` on phone screens for three to five top destinations. It floats above the home indicator as chrome glass and hides from 720px up, where `TopNav` carries the same links. Give it an `aria-label` and the `value` of the current destination; that item gets `aria-current="page"`. Leave room at the bottom of the page (about 88px) so the last content is not under it.

```jsx
<TabBar aria-label="Screens" value="docs" items={[
  { id: 'home', label: 'Products', href: '/' },
  { id: 'docs', label: 'Docs', href: '/docs' },
  { id: 'settings', label: 'Settings', href: '/settings' },
]} />
```
