# Toggle

A two-state button with default and outline variants and `default`, `sm`, and `lg` sizes.

```jsx
<Toggle pressed={bookmarked} onPressedChange={setBookmarked}>Bookmark</Toggle>
<Toggle variant="outline" size="sm">Italic</Toggle>
```

`toggleVariants` returns class names for custom compositions. Place `Icon` explicitly inside
the button when needed. Compose grouped controls exclusively with `ToggleGroup` and
`ToggleGroupItem`; use Tabs for navigation and Switch for saved settings.
