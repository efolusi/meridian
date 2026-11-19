# Hero

Use `Hero` once, at the top of a marketing page: the `title`, a short `sub`, the `actions` (pill buttons, the main one `size="xl"`) and an optional `proof` line. It is centred by default; use `align="start"` beside an image. Link `landing.css` so the top and bottom spacing steps down on small screens.

Wrap one word of the title in `HeroAccent` for the hand-drawn underline. It draws once and stays still with reduced motion. Pass every word from your own dictionary, in Indonesian and English.

```jsx
<Hero
  title={<>Tools that run on <HeroAccent>your own</HeroAccent> machine</>}
  sub="Open source, self-hosted and private by default."
  actions={<><Button shape="pill" size="xl" iconRight="arrow-right">Start free</Button><Button shape="pill" size="xl" variant="secondary">Read the docs</Button></>}
/>
```
