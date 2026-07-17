Range input with ink fill and hairline track; label + live value optional.

```jsx
<Slider label="Usage alert threshold" showValue format={v => v + '%'} defaultValue={80} />
```

Controlled via `value`/`onChange(n)`, or uncontrolled with `defaultValue`.
