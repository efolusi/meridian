# Toggle

A two-state button with default and outline variants and `default`, `sm`, and `lg` sizes.

```jsx
<Toggle pressed={bookmarked} onPressedChange={setBookmarked}>Bookmark</Toggle>
<Toggle variant="outline" size="sm">Italic</Toggle>
```

`toggleVariants` returns class names for custom compositions. Meridian's icon-name helper,
legacy `md` size, and `ToggleGroup` remain additive; use Tabs for navigation and Switch for saved settings.
