The product sidebar: head (brand and one collapse button), grouped nav with icons and badges, and the foot (the account card and its menu). 240px on `--surface-subtle`, 72px when collapsed.

```jsx
<SideNav logoSrc="assets/meridian.svg" value={nav} onChange={setNav}
  groups={[
    { items: [{ id: 'overview', label: 'Overview', icon: 'layout-dashboard' }, { id: 'customers', label: 'Customers', icon: 'users', badge: 128 }] },
    { label: 'Products', items: [{ id: 'agent', label: 'AI agents', icon: 'bot' }] },
  ]}
  account={{ name: 'Ada Obi', email: 'ada@example.com' }}
  menuItems={[{ id: 'account', label: 'Account settings', icon: 'settings', onSelect: openAccount }]}
  onSignOut={signOut} />
```

**The foot is the same on every front** and no product builds its own. At rest it is ONE bordered `AccountCard` (avatar, name, email, a small chevron) and nothing else: no theme row, no sign-out row, no icon-only circles. The card is a button (`aria-haspopup="menu"`, `aria-expanded`). Pressing it, or Enter or Space on it, opens the account menu above it, built on `DropdownMenu` (arrows move, Escape closes and returns focus to the card):

1. **Theme**: a group heading with two radios, "Light" and "Dark", the current one checked. There is no "System" radio: the theme contract offers light and dark only (MD47, 1.31.0), and the device decides only until the person first chooses. Choosing one switches the page and closes the menu. The foot and the header `ThemeToggle` read and write the one theme contract, so they stay in step.
2. **Your items**: `menuItems={[{ id, label, icon, onSelect }]}` for what a product adds (Language, Account settings). They sit after the Theme group.
3. **Sign out**: last, set apart by a separator. It shows when `onSignOut` is given.

The foot shows when `account` is given.

- `lang="id"` writes the menu in Indonesian ("Tema", "Terang", "Gelap", "Keluar"). `labels` overrides any word.
- **The head** holds the brand and ONE icon button that collapses and expands the rail (`aria-expanded`, `aria-controls` the rail, label "Collapse sidebar" or "Expand sidebar", "Ciutkan sidebar" or "Perluas sidebar" with `lang="id"`; it also has a tooltip). There is no section tag by default: `brandBadge` stays an option for a product with a real need, and it is hidden while collapsed.
- **Collapsed** is the icon rail: nav rows show the icon only, each with a Meridian tooltip on hover and on keyboard focus, the card shows the avatar alone inside the same border and opens the same menu. Every label, the name and the email stay in the DOM as accessible names. A nav item with a `badge` shows a dot. The width animates by the `--dur-slow` and `--ease-standard` tokens and does not animate under reduced motion.
- **State.** Leave `collapsed` out and the rail keeps its own state: `defaultCollapsed` is the first state, and the choice is stored per viewer on this origin (`storageKey`, default `efolusi-sidenav-collapsed`; `null` stores nothing). The stored choice is read before the first paint and the width starts animating only after that frame, so a returning viewer never sees the rail slide into place. Server HTML shows `defaultCollapsed`; pass it from your own cookie if the first paint before scripts must match too. `collapsed` with `onCollapsedChange` is the controlled form (the product stores it); `collapsed` alone draws no button; `collapsible={false}` draws none either.
- **Phone.** Below 768px the rail is in a drawer at full width: the button is not drawn and an uncontrolled rail is never collapsed there.
- A polite status announces the new theme after a choice.
- On a phone put the same `SideNav` in a drawer at its full width, so the foot is the same there.
