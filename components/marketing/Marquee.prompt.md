# Marquee

Use `Marquee` once per page, under the hero, for a slow strip of short labels (product names, what you stand for). It loops on its own, pauses on hover, on keyboard focus and with its own pause button, and stands still with reduced motion. Screen readers get the items once, as a list named by `label`; the moving copy is hidden from them.

Pass the items in the page's language, and `lang="id"` for the Indonesian pause labels.

```jsx
<Marquee label="What we build" items={['Open source', 'Self-hosted', 'Private', 'Secure']} />
```

On a site without React, render the same markup with `data-duration` and load `browser/marketing.js` for the pause button; see [theming § Plain HTML sites](../../guidelines/theming.md#plain-html-sites).
