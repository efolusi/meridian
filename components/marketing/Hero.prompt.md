# Hero

Use `Hero` once, at the top of a marketing page: the `title`, a short `sub`, the `actions` (pill buttons, the main one `size="xl"`) and an optional `proof` line. It is centred by default; use `align="start"` beside an image. Link `landing.css` so the top and bottom spacing steps down on small screens.

`actions` stack below 640px, and a stacked pair has one width, the widest button's: pass the buttons as they are and delete your own pair CSS (`width`, `min-width`, `flex: 1` or `align-self` on the hero buttons). At 640px and above they sit in one row that wraps.

Wrap one word of the title in `HeroAccent` for the hand-drawn underline. It draws once and stays still with reduced motion. Pass every word from your own dictionary, in Indonesian and English.

```jsx
<Hero
  title={<>Tools that run on <HeroAccent>your own</HeroAccent> machine</>}
  sub="Open source, self-hosted and private by default."
  actions={<><Button shape="pill" size="xl" iconRight="arrow-right">Start free</Button><Button shape="pill" size="xl" variant="secondary">Read the docs</Button></>}
/>
```
