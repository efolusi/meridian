# Reveal

Wrap a block in `Reveal` to fade and lift it in once it scrolls into view. Siblings stagger by 70ms each. Content stays visible without JavaScript, and appears at once with reduced motion. Use it on marketing sections, not inside the product UI, and not on the hero's title.

```jsx
<FeatureGrid>
  <Reveal><FeatureCard tone="peach" title="Products" /></Reveal>
  <Reveal><FeatureCard tone="cocoa" title="Token" /></Reveal>
</FeatureGrid>
```
