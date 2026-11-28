The action button: primary for the one main action per view, secondary/ghost for the rest.

```jsx
<Button iconRight="arrow-right">Create workspace</Button>
<Button variant="secondary" iconLeft="download">Export</Button>
<Button variant="ghost">Cancel</Button>
```

Variants: `primary` (espresso ink), `secondary` (white + border), `ghost`, `danger`, `brand` (cocoa, for marketing/brand moments only), `band` (for a button on a `Section tone="band"`, see below). Sizes `sm|md|lg` (28/36/44px), and `xl` (52px) for the hero call to action on a marketing page. `loading` swaps in a spinner; labels are verbs in sentence case ("Save changes", never "Submit").

To make every pressable thing on the page a pill, set `data-shape="pill"` once on `<html>` or `<body>` instead of passing `shape` to each Button: the corners change for Button, IconButton, Tag and Badge, and for the text fields, with no change to padding. Without the attribute nothing changes. See `guidelines/theming.md`, section Shape.

On marketing pages, `shape="pill"` rounds the ends and widens the side padding. Use it for every pressable call to action on the page, and keep the default shape inside the product UI.

```jsx
<Button shape="pill" size="xl" iconRight="arrow-right">Start free</Button>
<Button shape="pill" variant="secondary">Read the docs</Button>
```

### Arrow bubble

`iconBubble` puts a round bubble with an arrow at the end of the button. Use it for the one hero or closing call to action of a marketing page, never on every button. The bubble is the button's label colour and the arrow is the button's own colour, so the bubble reads on the button (6.37:1 on a primary, 3:1 needed) and the arrow reads on the bubble (4.5:1 needed) in light and dark. The bubble button is always a pill, replaces `iconRight`, and draws at `md`, `lg` and `xl` (36, 44, 52px) on `primary`, `secondary`, `brand`, `danger` and `band`; on `ghost`, `link` and the smaller sizes the glyph is a plain trailing icon. On hover or keyboard focus (with a fine pointer) the arrow moves: `arrow-up-right` turns 45 degrees to point along the line, any other arrow nudges toward the end of the line by `--shift-sm`. Under reduced motion, and on a touch screen, it stays.

```jsx
<Button shape="pill" size="xl" iconBubble="arrow-right">Start free</Button>
<Button size="lg" variant="secondary" iconBubble="arrow-right">Read the docs</Button>
```

`arrow-up-right` is the one that turns, so it is the arrow for a call to action that leaves the page or opens a section:

```jsx
<Button shape="pill" size="xl" iconBubble="arrow-up-right">See what we've built</Button>
```

For a link, build the classes with `buttonVariants` and put the bubble after the label (the icon is 20px, 16px at `md`). Write `data-turn` on the bubble when the icon is `arrow-up-right`, so it turns:

```jsx
<a className={buttonVariants({ size: 'xl', bubble: true })} href="/start">Start free<span className="ef-btn__bubble" aria-hidden="true"><Icon name="arrow-right" size={20} /></span></a>
```

### On a band

A band is the brand-colour section (`Section tone="band"`): cream in light, dark in dark. A copper `primary` still works there (its accent edge is the boundary). `variant="band"` is the cream button for it: a cream fill with dark ink in both themes. On the cream band the fill is 1.09:1 against the band, so the accent edge is the boundary (3.81:1); on the dark band the fill is 13.2:1.

```jsx
<Section tone="band">
  <Button variant="band" shape="pill" size="xl" iconBubble="arrow-right">See the products</Button>
</Section>
```
