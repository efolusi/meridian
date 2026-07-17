# EnvList

Environment variables card — secrets masked as •••••••• with a single reveal toggle in the header; per-row copy always copies the real value.

```jsx
<EnvList vars={[
  { name: 'DATABASE_URL', value: 'postgres://…', secret: true },
  { name: 'NODE_ENV', value: 'production' },
]} />
```
