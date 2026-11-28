# Card

CardTitle is a heading (`h2` by default; pass `as="h3"` for the level the page needs), so a page of cards has a heading outline. Compose Card from header, title, description, action, content, and footer parts. Use `size="sm"` for compact surfaces or set `--card-spacing` on the root when a layout needs a deliberate custom inset.

```jsx
<Card>
  <CardHeader>
    <CardTitle>Deployment</CardTitle>
    <CardDescription>Production release readiness.</CardDescription>
    <CardAction><Button size="sm">Review</Button></CardAction>
  </CardHeader>
  <CardContent>All checks passed.</CardContent>
  <CardFooter><Button>Deploy</Button></CardFooter>
</Card>
```

`CardTitle size="display"` sets the title in the display face at `--text-2xl`, for a section card on an account or settings page; the default is the sans `--text-lg`. The title of the page itself is `<h1 className="ef-page-title">`: the display face, `--text-3xl` to `--text-4xl`, balanced. Marketing pages use `Hero` and `SectionHead` instead.

```jsx
<h1 className="ef-page-title">Billing</h1>
<Card><CardHeader><CardTitle size="display">Subscriptions</CardTitle></CardHeader></Card>
```

`elevated` raises the card above the page: `--surface-elevated` and `--shadow-elevated` (in dark a lighter surface, a visible ring and a soft darkness under it; in light the card colour and a soft shadow). Use it for the one card that lifts off the page, not for every card in a list: cards in a list keep the flat `--surface-card` and the hairline. The card keeps a transparent 1px border under the ring so forced colours still draw an edge. A block inside an elevated card that has only a `--surface-sunken` fill (a muted `Item`, a secondary `Badge`, a secondary `Bubble`, an icon `EmptyState` media, an `Attachment` or `FileTile` icon) gets a `--border-default` edge from the card; a well of your own inside it writes `border: 1px solid var(--border-default)`, because the fill alone is 1.01:1 from the dark elevated surface.

```jsx
<Card elevated>
  <CardHeader><CardTitle>Current plan</CardTitle></CardHeader>
  <CardContent>Team, billed yearly.</CardContent>
</Card>
```
