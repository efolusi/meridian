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
