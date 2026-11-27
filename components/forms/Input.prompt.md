Native text input with ref forwarding, file-input styling, disabled and invalid states. It renders bare by default, or as a full field when `label`/`hint`/`error` are set. `glass` makes a search field in a bar or toolbar clear glass.

```jsx
<Input label="Work email" placeholder="you@company.com" iconLeft="mail" />
<Input label="Password" type="password" error="At least 12 characters needed." />
<Input type="file" aria-label="Upload receipt" />
```

`error` implies invalid styling and an accessible alert. `iconLeft` takes a Meridian icon name. Under `data-shape="pill"` on an ancestor the corners follow `--field-radius` (`--radius-lg`, not a full pill, so a multi-line Textarea reads the same); see `guidelines/theming.md`, section Shape. Visual sizes `sm|md|lg|xl` are additive (28, 36, 44 and 52px; `md` is the default). `xl` is the Button `xl` height, 52px, for the main form of a page such as sign-in, so the field and its submit button line up; on touch the sizes up to `lg` grow to 44px and `xl` stays 52px. A numeric `size` is forwarded as the native input width.
