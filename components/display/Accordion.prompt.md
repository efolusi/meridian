# Accordion

Disclosure list composable dengan mode `single` atau `multiple`, state controlled maupun uncontrolled, navigasi keyboard, dan dukungan disabled.

```jsx
<Accordion type="single" collapsible>
  <AccordionItem value="billing">
    <AccordionTrigger>How does billing work?</AccordionTrigger>
    <AccordionContent>Per seat, monthly.</AccordionContent>
  </AccordionItem>
</Accordion>
```

Gunakan `type="multiple"` dan `defaultValue` untuk disclosure multi-select yang tidak dikontrol.
