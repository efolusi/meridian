# Section

Use `Section` for each full-width block of a marketing page. It sets the page rhythm from `--section-y` (link `landing.css` so it steps down on small screens) and centres its content at `--container-max`. `tone="band"` puts the block on the brand ground for one statement per page; `ruled` draws a hairline between two plain sections.

Open each section with `SectionHead`: an optional `eyebrow`, the `title`, and a short `lede`. Use `align="center"` for a centred page, and `as` to keep the heading order right. Pass both languages from your own dictionary; the component holds no copy.

```jsx
<Section ruled>
  <SectionHead eyebrow="Products" title="Tools that run on your own machine" lede="Open source, self-hosted, private by default." align="center" />
</Section>
<Section tone="band">
  <SectionHead title="Built in Indonesia, used everywhere." />
</Section>
```
