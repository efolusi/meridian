Dashed dropzone: click or drag, with an ink border on hover/dragover.

```jsx
<FileDrop accept="image/*,video/*,.pdf" maxSize={2 * 1024 ** 3} hint="PNG, MP4, PDF, up to 2 GB"
  onFiles={enqueue} onReject={(files, reason) => toast(`${files.length} file(s) skipped: ${reason}`)} />
```

`accept`, `maxSize` and `multiple` apply to both the picker and drops. Anything left out goes to `onReject(files, reason)` with reason `'type'`, `'size'` or `'count'`, so say why a file did not arrive instead of dropping it silently.
