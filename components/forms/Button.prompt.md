The action button: primary for the one main action per view, secondary/ghost for the rest.

```jsx
<Button iconRight="arrow-right">Create workspace</Button>
<Button variant="secondary" iconLeft="download">Export</Button>
<Button variant="ghost">Cancel</Button>
```

Variants: `primary` (espresso ink), `secondary` (white + border), `ghost`, `danger`, `brand` (cocoa, for marketing/brand moments only). Sizes `sm|md|lg` (28/36/44px), and `xl` (52px) for the hero call to action on a marketing page. `loading` swaps in a spinner; labels are verbs in sentence case ("Save changes", never "Submit").

On marketing pages, `shape="pill"` rounds the ends and widens the side padding. Use it for every pressable call to action on the page, and keep the default shape inside the product UI.

```jsx
<Button shape="pill" size="xl" iconRight="arrow-right">Start free</Button>
<Button shape="pill" variant="secondary">Read the docs</Button>
```
