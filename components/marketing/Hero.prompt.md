# Hero

Use `Hero` once, at the top of a marketing page: the `title`, a short `sub`, the `actions` (pill buttons, the main one `size="xl"`) and an optional `proof` line. It is centred by default; use `align="start"` beside an image. Link `landing.css` so the top and bottom spacing steps down on small screens.

`actions` stack at 640px and below (every set of actions, a short pair that fitted on one row included), and a stacked pair has one width, the widest button's: pass the buttons as they are and delete your own pair CSS (`width`, `min-width`, `flex: 1` or `align-self` on the hero buttons). From 641px up they sit in one row that wraps. A child of `actions` that is not a button (a text link, a wrapper) is stretched to the widest button when stacked.

Wrap one word of the title in `HeroAccent` for the hand-drawn underline. It draws once and stays still with reduced motion. Pass every word from your own dictionary, in Indonesian and English.

```jsx
<Hero
  title={<>Tools that run on <HeroAccent>your own</HeroAccent> machine</>}
  sub="Open source, self-hosted and private by default."
  actions={<><Button shape="pill" size="xl" iconRight="arrow-right">Start free</Button><Button shape="pill" size="xl" variant="secondary">Read the docs</Button></>}
/>
```
