Hairline disclosure list (FAQs, docs). Single-open by default; `multiple` allows several.

```jsx
<Accordion defaultOpen={['billing']} items={[
  { id: 'billing', title: 'How does billing work?', content: 'Per seat, monthly. Usage is metered daily.' },
  { id: 'cancel', title: 'Can I cancel anytime?', content: 'Yes — your workspace stays readable forever.' },
]} />
```
