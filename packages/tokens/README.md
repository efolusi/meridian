# @efolusi/meridian-tokens

The [Meridian](https://meridian.efolusi.com) design tokens as a standalone package: CSS custom properties, DTCG `tokens.json`, and a Tailwind preset, with the self-hosted fonts. For Style Dictionary, Figma Variables, or Tailwind users who want the token layer without the React components.

Built from the same source as `@efolusi/meridian`, in lockstep versions.

```bash
npm install @efolusi/meridian-tokens
```

```css
@import "@efolusi/meridian-tokens/styles.css"; /* the whole token layer, light + dark + compact */
```

```js
// tailwind.config.js
module.exports = { presets: [require('@efolusi/meridian-tokens/tailwind.preset.cjs')] };
```

`tokens.json` is DTCG-format for Style Dictionary / Figma Variables. MIT licensed; the bundled fonts (SIL OFL) keep their own licences.
