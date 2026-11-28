The signed-in person in one bordered card: avatar, name and email. It is static (not a button) and `SideNav` draws it at the foot of the rail, below the theme and sign-out rows. Use it on its own only where the same card is needed outside a rail, for example in a drawer.

```jsx
<AccountCard name="Ada Obi" email="ada@example.com" image="/avatars/ada.png" />
<AccountCard email="ada@example.com" />
<AccountCard name="Ada Obi" email="ada@example.com" compact />
```

The initials come from the first and last word of `name` (or the first two letters of the email), so a missing or broken `image` still shows a mark. The picture is decorative (`alt=""`) because the name sits beside it. `compact` keeps the card and its border and shows the avatar alone; the name and email stay in the DOM, visually hidden, so a screen reader still reads them.
