# Counter

Use `Counter` for a stat number on a marketing page: it counts up from 0 to `value` over 1.2 s once it is 40% in view. The final value sits in the markup from the start, so server render, no JavaScript and screen readers get the real number, and reduced motion shows it at once. Format with `locale` and `format` (Intl.NumberFormat options). Use it for a number that is true (a count, a measured figure), never for an invented one, and not inside the product UI.

```jsx
<Counter value={12400} locale="en" />
<Counter value={0.98} format={{ style: 'percent' }} />
```
