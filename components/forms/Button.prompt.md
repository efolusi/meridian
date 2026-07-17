The action button — primary for the one main action per view, secondary/ghost for the rest.

```jsx
<Button iconRight="arrow-right">Create workspace</Button>
<Button variant="secondary" iconLeft="download">Export</Button>
<Button variant="ghost">Cancel</Button>
```

Variants: `primary` (espresso ink), `secondary` (white + border), `ghost`, `danger`, `brand` (cocoa — marketing/brand moments only). Sizes `sm|md|lg` (28/36/44px). `loading` swaps in a spinner; labels are verbs in sentence case ("Save changes", never "Submit").
