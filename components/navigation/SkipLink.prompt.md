First focusable element on the page: one Tab press jumps a keyboard user past the header into the content. Hidden until focused.

```jsx
<SkipLink />
<main id="main" tabIndex={-1}>…</main>
```

The link moves focus to the target itself and does not change `location.hash`, so hash-based routers are not triggered. A target without a `tabindex` gets `tabIndex={-1}` on first use; setting it yourself, as above, keeps the markup explicit.
