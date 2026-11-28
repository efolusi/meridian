The product sidebar: brand row, grouped nav with icons and badges, and the foot. 240px on `--surface-subtle`, 72px when `collapsed`.

```jsx
<SideNav logoSrc="assets/meridian.svg" brandBadge="Console" value={nav} onChange={setNav}
  groups={[
    { items: [{ id: 'overview', label: 'Overview', icon: 'layout-dashboard' }, { id: 'customers', label: 'Customers', icon: 'users', badge: 128 }] },
    { label: 'Products', items: [{ id: 'agent', label: 'AI agents', icon: 'bot' }] },
  ]}
  account={{ name: 'Ada Obi', email: 'ada@example.com' }}
  onSignOut={signOut} />
```

**The foot is the same on every front** and no product builds its own. From the top it is: a theme row (icon, "Theme", and the state "Light" or "Dark"), a sign-out row ("Sign out"), then one bordered `AccountCard`. The rows use the nav row style (`.ef-sidenav__item`, 34px, 44px at a coarse pointer), not icon-only circles and not a second toggle style. The header `ThemeToggle` keeps its own borderless icon; the foot's theme row is a labelled row, and both read and write the one theme contract, so they stay in step. The foot shows when `account` or `onSignOut` is given; give both.

- `lang="id"` writes the foot in Indonesian ("Tema", "Terang", "Gelap", "Keluar"). `labels` overrides any word.
- `collapsed` draws the icon rail: rows show the icon only, the card shows the avatar alone inside the same border. Every label, the name and the email stay in the DOM as accessible names, and the nav rows and foot rows carry a `title`. A nav item with a `badge` shows a dot. The component draws no collapse button: the product decides when to collapse.
- The theme row's accessible name is "Theme: Dark" and its tooltip says what a press does. A polite status announces the new theme after a press.
- On a phone put the same `SideNav` in a drawer at its full width, so the foot is the same there.
