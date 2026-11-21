# Counter

Use `Counter` for a stat number on a marketing page: it counts up from 0 to `value` over 1.2 s once it is 40% in view. The final value sits in the markup from the start, so server render, no JavaScript and screen readers get the real number, and reduced motion shows it at once. Pass the page's locale (`locale={lang}`): the default is `en`, fixed so the server and the browser print the same digits. `format` takes Intl.NumberFormat options. A counter already in view at load shows its final value and does not climb; a new `value` climbs from the number on screen; a value that is not a number renders as plain text. Use it for a number that is true (a count, a measured figure), never for an invented one, and not inside the product UI.

```jsx
<Counter value={12400} locale={lang} />
<Counter value={0.98} format={{ style: 'percent' }} />
```
