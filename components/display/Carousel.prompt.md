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

The scrolling `CarouselContent` is a keyboard-focusable `region`, separate from the `Carousel` root, which is already a named carousel. Name the root with `aria-label` or `aria-labelledby`; the content then takes that name plus ` slides` (`Featured work slides`), so the two regions never share a name. Without a root name it is `Slides`. An `aria-label` or `aria-labelledby` on `CarouselContent` wins.
