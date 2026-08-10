# DirectionProvider

Supplies `ltr` or `rtl` to Meridian components whose horizontal keyboard behavior must mirror. Set the same direction on the document so CSS and text flow agree with the component context.

```jsx
<html dir="rtl">
  <body>
    <DirectionProvider direction="rtl">
      <App />
    </DirectionProvider>
  </body>
</html>
```

Use `useDirection()` in custom components that need the current Meridian direction. Invalid provider values fall back to `ltr`.
