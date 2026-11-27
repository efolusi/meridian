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
