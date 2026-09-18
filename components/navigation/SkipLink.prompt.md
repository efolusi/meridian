First focusable element on the page: one Tab press jumps a keyboard user past the header into the content. Hidden until focused.

```jsx
<SkipLink />
<main id="main" tabIndex={-1}>…</main>
```

The target needs `tabIndex={-1}`, or Safari and Firefox scroll without moving focus and the next Tab lands back in the navigation.
