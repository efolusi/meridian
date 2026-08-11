# Alert

Notifikasi inline composable dengan varian `default` dan `destructive`. Susun ikon, `AlertTitle`, dan `AlertDescription` sebagai children untuk kontrol penuh.

```jsx
<Alert variant="destructive">
  <Icon name="circle-alert" />
  <AlertTitle>Deploy failed</AlertTitle>
  <AlertDescription>Image digest mismatch.</AlertDescription>
</Alert>
```

Prop shorthand Meridian `tone`, `icon`, `title`, `description`, dan `action` tetap tersedia untuk permukaan lama.
