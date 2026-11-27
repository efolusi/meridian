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
