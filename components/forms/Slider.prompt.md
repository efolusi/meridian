Single, range, or multi-thumb numeric selection with horizontal and vertical layouts.

```jsx
<Slider defaultValue={[20, 80]} min={0} max={100} step={5} aria-label="Price range" />
```

Canonical values and callbacks are arrays: `value`, `defaultValue`,
`onValueChange`, and `onValueCommit`. Use `orientation="vertical"` when space is
tall rather than wide. Compose labels and formatted values beside the Slider.
