# Alert

Notifikasi inline composable dengan varian `default`, `success`, `warning`, dan `danger`. Susun `AlertTitle`, `AlertDescription`, dan `AlertAction` sebagai children. Setiap varian punya ikon bawaan (`info`, `circle-check`, `triangle-alert`, `circle-alert`) supaya status tidak hanya dibawa warna; beri `icon="nama"` untuk ikon lain, `icon={false}` tanpa ikon, atau tulis `<Icon>` sebagai child untuk menggantinya. Tanpa ikon, teks mulai di tepi kiri tanpa celah.

```jsx
<Alert variant="danger">
  <AlertTitle>Deploy failed</AlertTitle>
  <AlertDescription>Image digest mismatch.</AlertDescription>
</Alert>
```

Untuk warna status khusus, berikan `className` pada root dan tulis ikonnya sebagai child eksplisit.
