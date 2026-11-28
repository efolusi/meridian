The signed-in person in one bordered card: avatar, name and email. By default it is static (not a button). `SideNav` draws it at the foot of the rail as `interactive`: a button with a small chevron that opens the account menu above it. Use it on its own where the same card is needed outside a rail, for example in a drawer.

```jsx
<AccountCard name="Ada Obi" email="ada@example.com" image="/avatars/ada.png" />
<AccountCard email="ada@example.com" />
<AccountCard name="Ada Obi" email="ada@example.com" compact />
<DropdownMenuTrigger asChild><AccountCard interactive name="Ada Obi" email="ada@example.com" /></DropdownMenuTrigger>
```

The initials come from the first and last word of `name` (or the first two letters of the email), so a missing or broken `image` still shows a mark. The picture is decorative (`alt=""`) because the name sits beside it. `compact` keeps the card and its border and shows the avatar alone; the name and email stay in the DOM, visually hidden, so a screen reader still reads them. `interactive` renders a `button` (44px at a coarse pointer, focus ring, hover fill only on hover-capable pointers); give it the trigger props yourself or wrap it in `DropdownMenuTrigger asChild`.
