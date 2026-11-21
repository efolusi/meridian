# Decor

Use `Decor` for a decorative backdrop behind a hero or a section: `mesh` (a soft gradient from the accent tokens, so a rebrand and dark mode reach it), `noise` (fine grain), `grid` (hairlines) or `dots`. It is CSS only, `aria-hidden`, never animated, and hidden in forced-colors mode. Put it inside a parent with `position: relative; isolation: isolate`; it sits behind the content. `fade` fades it out toward the bottom edge.

Body text in `--text-primary` or `--text-secondary` keeps 4.5:1 over every pattern in light and dark (a test measures the strongest point). Do not put `--text-muted` or small light text on it. Use one pattern per section, and only where the page gains something from it: a pattern that decorates nothing is noise.

```jsx
{/* The parent needs both position: relative and isolation: isolate, or the block sits behind the page background. */}
<section style={{ position: 'relative', isolation: 'isolate' }}>
  <Decor pattern="mesh" fade />
  <h2>Plans</h2>
</section>
```
