# Breadcrumb

Path trail composable dengan root navigasi, ordered list, item, link, halaman aktif, separator, dan ellipsis.

```jsx
<Breadcrumb>
  <BreadcrumbList>
    <BreadcrumbItem><BreadcrumbLink href="/docs">Docs</BreadcrumbLink></BreadcrumbItem>
    <BreadcrumbSeparator />
    <BreadcrumbItem><BreadcrumbPage>Components</BreadcrumbPage></BreadcrumbItem>
  </BreadcrumbList>
</Breadcrumb>
```

Adapter array `Breadcrumbs items={…}` tetap tersedia untuk permukaan Meridian lama.
