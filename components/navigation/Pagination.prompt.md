Semantic page navigation composed from links and list items.

```jsx
<Pagination>
  <PaginationContent>
    <PaginationItem><PaginationPrevious href="?page=1" /></PaginationItem>
    <PaginationItem><PaginationLink href="?page=2" isActive>2</PaginationLink></PaginationItem>
    <PaginationItem><PaginationEllipsis /></PaginationItem>
    <PaginationItem><PaginationNext href="?page=3" /></PaginationItem>
  </PaginationContent>
</Pagination>
```

Links are real anchors so routing, modified clicks, and copy-link behavior stay
native. Compose the visible page range explicitly from application state. Use the
`text` prop on `PaginationPrevious` and `PaginationNext` to localize their labels.
