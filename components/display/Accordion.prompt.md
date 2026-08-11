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

Shorthand Meridian berbasis prop `items`, `multiple`, dan `defaultOpen` tetap tersedia untuk permukaan lama.
