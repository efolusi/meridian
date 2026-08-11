# Hover Card

Composable rich preview for supplementary information about a link or other focusable target. Use `HoverCard`, `HoverCardTrigger`, and `HoverCardContent`; use `asChild` when the trigger already supplies its own semantic element.

```jsx
<HoverCard>
  <HoverCardTrigger asChild><a href="/people/amara">@amara</a></HoverCardTrigger>
  <HoverCardContent align="start">…profile summary…</HoverCardContent>
</HoverCard>
```

Content must be supplementary, never the only way to reach information or an action. For plain text hints use Tooltip.
