Loading placeholder that accepts native div attributes, consumer classes, and refs. It is `aria-hidden` by default: say that content is loading on the region that will hold it (`aria-busy="true"` and a label on the parent), not on the placeholder. In Windows High Contrast it draws as a block in `GrayText`.

```jsx
<Skeleton style={{ width: 40, height: 40, borderRadius: 'var(--radius-full)' }} />
<section aria-busy="true" aria-label="Account details">
  <Skeleton style={{ width: '60%', height: 12 }} />
</section>
```

Pass `shimmer` for a light band that sweeps across the block instead of a pulse. With reduced motion both variants show a still block.

```jsx
<Skeleton shimmer style={{ width: '100%', height: 12 }} />
```

Compose repeated text placeholders explicitly so their rhythm and final-line width match the content they represent:

```jsx
<div style={{ display: 'grid', gap: 8 }}>
  <Skeleton style={{ width: '100%', height: 12 }} />
  <Skeleton style={{ width: '60%', height: 12 }} />
</div>
```
