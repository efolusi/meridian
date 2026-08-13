# Alert

Notifikasi inline composable dengan varian `default` dan `destructive`. Susun ikon, `AlertTitle`, `AlertDescription`, dan `AlertAction` sebagai children.

```jsx
<Alert variant="destructive">
  <Icon name="circle-alert" />
  <AlertTitle>Deploy failed</AlertTitle>
  <AlertDescription>Image digest mismatch.</AlertDescription>
</Alert>
```

Untuk warna status khusus, berikan `className` pada root dan tetap tulis ikon sebagai child eksplisit.
