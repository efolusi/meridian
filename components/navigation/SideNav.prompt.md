The product sidebar: brand row, grouped nav with icons and badges, and the foot (the account card and its menu). 240px on `--surface-subtle`, 72px when `collapsed`.

```jsx
<SideNav logoSrc="assets/meridian.svg" brandBadge="Console" value={nav} onChange={setNav}
  groups={[
    { items: [{ id: 'overview', label: 'Overview', icon: 'layout-dashboard' }, { id: 'customers', label: 'Customers', icon: 'users', badge: 128 }] },
    { label: 'Products', items: [{ id: 'agent', label: 'AI agents', icon: 'bot' }] },
  ]}
  account={{ name: 'Ada Obi', email: 'ada@example.com' }}
  menuItems={[{ id: 'account', label: 'Account settings', icon: 'settings', onSelect: openAccount }]}
  onSignOut={signOut} />
```

**The foot is the same on every front** and no product builds its own. At rest it is ONE bordered `AccountCard` (avatar, name, email, a small chevron) and nothing else: no theme row, no sign-out row, no icon-only circles. The card is a button (`aria-haspopup="menu"`, `aria-expanded`). Pressing it, or Enter or Space on it, opens the account menu above it, built on `DropdownMenu` (arrows move, Escape closes and returns focus to the card):

1. **Theme**: a group heading with two radios, "Light" and "Dark", the current one checked. Choosing one switches the page and closes the menu. The foot and the header `ThemeToggle` read and write the one theme contract, so they stay in step.
2. **Your items**: `menuItems={[{ id, label, icon, onSelect }]}` for what a product adds (Language, Account settings). They sit after the Theme group.
3. **Sign out**: last, set apart by a separator. It shows when `onSignOut` is given.

The foot shows when `account` is given.

- `lang="id"` writes the menu in Indonesian ("Tema", "Terang", "Gelap", "Keluar"). `labels` overrides any word.
- `collapsed` draws the icon rail: nav rows show the icon only, the card shows the avatar alone inside the same border and opens the same menu. Every label, the name and the email stay in the DOM as accessible names, and the nav rows carry a `title`. A nav item with a `badge` shows a dot. The component draws no collapse button: the product decides when to collapse.
- A polite status announces the new theme after a choice.
- On a phone put the same `SideNav` in a drawer at its full width, so the foot is the same there.
