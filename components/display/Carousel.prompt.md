# Carousel

Composable, swipe-friendly scroll-snap carousel with keyboard controls and an event API.

```jsx
<Carousel opts={{ align: 'start', loop: true }}>
  <CarouselContent>
    {cards.map(card => <CarouselItem key={card.id}>{card}</CarouselItem>)}
  </CarouselContent>
  <CarouselPrevious />
  <CarouselNext />
</Carousel>
```

Use `orientation="vertical"` for vertical collections and `setApi` for slide counts or selection events. Size items through their `style.flexBasis` or a project utility class. Not for primary navigation.

The scrolling `CarouselContent` is a keyboard-focusable `group`, not a second region: the `Carousel` root is already the carousel region. Name the root with `aria-label` or `aria-labelledby`; the group is then named after it plus `label` (`Featured work Slides`, `label` defaults to `Slides`), so the root's name is not read twice. For another word order, pass `aria-label` or `aria-labelledby` on `CarouselContent`: it replaces the whole name.
