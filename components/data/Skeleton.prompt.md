Loading placeholder that accepts native div attributes, consumer classes, and refs.

```jsx
<Skeleton style={{ width: 40, height: 40, borderRadius: 'var(--radius-full)' }} />
<Skeleton aria-label="Loading account details" style={{ width: '60%', height: 12 }} />
```

Compose repeated text placeholders explicitly so their rhythm and final-line width match the content they represent:

```jsx
<div style={{ display: 'grid', gap: 8 }}>
  <Skeleton style={{ width: '100%', height: 12 }} />
  <Skeleton style={{ width: '60%', height: 12 }} />
</div>
```
