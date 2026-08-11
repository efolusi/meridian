Native text input with ref forwarding, file-input styling, disabled and invalid states. It renders bare by default, or as a full field when `label`/`hint`/`error` are set.

```jsx
<Input label="Work email" placeholder="you@company.com" iconLeft="mail" />
<Input label="Password" type="password" error="At least 12 characters needed." />
<Input type="file" aria-label="Upload receipt" />
```

`error` implies invalid styling and an accessible alert. `iconLeft` takes a Meridian icon name. Visual sizes `sm|md|lg` are additive; a numeric `size` is forwarded as the native input width.
