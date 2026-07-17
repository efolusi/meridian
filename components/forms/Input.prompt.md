Text input; renders bare, or as a full field when `label`/`hint`/`error` are set.

```jsx
<Input label="Work email" placeholder="you@company.com" iconLeft="mail" />
<Input label="Password" type="password" error="At least 12 characters needed." />
```

`error` implies invalid styling (red border + message with alert icon). `iconLeft` takes a Lucide name. Sizes `sm|md|lg`.
