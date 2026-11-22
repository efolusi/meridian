# FeatureCard

Use `FeatureGrid` with three `FeatureCard`s to say what a product is about at a glance. Give a card an `href` and the whole card is the link; `cta` adds the link label with an arrow. The `tone` fills (`peach`, `band`, `amber`) are the same for every product, from the `--tone-*` tokens; use each once per grid. Every card keeps a 1px hairline, so it reads as a shape on the page in every theme.

```jsx
<FeatureGrid>
  <FeatureCard tone="peach" icon="package" title="Products" body="Seven tools, one account." cta="See the portfolio" href="#products" />
  <FeatureCard tone="band" icon="coins" title="Token" body="Buyback and burn, on chain." cta="Read more" href="/token" />
  <FeatureCard tone="amber" icon="sparkles" title="Standard" body="Open source and self-hosted." cta="About us" href="/about" />
</FeatureGrid>
```
