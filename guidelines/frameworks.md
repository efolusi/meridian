# Framework guides

Meridian ships two ways from one source: the zero-build CDN bundle (the flagship) and `@efolusi/meridian` on npm (ES modules, types, for bundlers). `react` and `react-dom` are peer dependencies (`>=18`). Pick the row that matches your stack.

## Tailwind cascade order

Import Meridian before Tailwind. Meridian's `styles.css` registers the shared
layer order `theme, base, tw-preflight, meridian, components, utilities`, so
Tailwind base/preflight cannot erase component fills, foregrounds, padding, or
borders, while product utilities can still make deliberate layout overrides.

Tailwind v4:

```css
@import '@efolusi/meridian/styles.css';
@import 'tailwindcss';
```

Tailwind v3 preflight is emitted unlayered unless you wrap it. Keep it below
Meridian using the registered compatibility layer:

```css
@import '@efolusi/meridian/styles.css';
@layer tw-preflight { @tailwind base; }
@tailwind components;
@tailwind utilities;
```

Do not add product-side `a.ef-btn` color overrides. Anchor and native buttons
share one upstream interaction contract, including hover, focus, active,
disabled, loading, dark mode, and reduced motion.

## Next.js (App Router)

```bash
npm install @efolusi/meridian
```

Import the stylesheet once, in the root layout:

```tsx
// app/layout.tsx
import '@efolusi/meridian/styles.css';

export default function RootLayout({ children }) {
  return <html lang="en"><body>{children}</body></html>;
}
```

Then import components anywhere:

```tsx
import { Button, Dialog } from '@efolusi/meridian';
```

Every component module already carries the `"use client"` directive, so importing one into a Server Component is not a build error: the client boundary is handled for you, and you do not add `"use client"` yourself. Server-rendered HTML is styled on first paint (the component CSS is a static stylesheet, not injected by JS), so there is no unstyled flash and no hydration mismatch.

## Vite (or any React bundler)

```bash
npm install @efolusi/meridian
```

```jsx
// src/main.jsx
import '@efolusi/meridian/styles.css';
import { Button } from '@efolusi/meridian';
```

Nothing framework-specific. For the smallest graph, import per component:

```jsx
import { Button } from '@efolusi/meridian/forms/Button.js';
```

## Remix (Vite)

```bash
npm install @efolusi/meridian
```

Import the stylesheet in the root route so it loads on every page:

```tsx
// app/root.tsx
import '@efolusi/meridian/styles.css';
```

Components render on the client and hydrate cleanly. Peer deps and the `"use client"` handling are the same as Next.js.

## Plain HTML (zero-build, the flagship)

No install, no bundler. Four tags, and every component lands on one global:

```html
<link rel="stylesheet" href="https://meridian.efolusi.com/styles.css">
<script src="https://unpkg.com/react@18.3.1/umd/react.production.min.js" integrity="sha384-DGyLxAyjq0f9SPpVevD6IgztCFlnMF6oW/XQGmfe+IsZ8TqEiDrcHkMLKI6fiB/Z" crossorigin="anonymous"></script>
<script src="https://unpkg.com/react-dom@18.3.1/umd/react-dom.production.min.js" integrity="sha384-gTGxhz21lVGYNMcdJOyq01Edg0jhn/c22nsx0kyqP0TxaV5WVdsSH1fSDUf5YJj1" crossorigin="anonymous"></script>
<script src="https://meridian.efolusi.com/_ds_bundle.js"></script>
```

```js
const { Button, Card } = window.EfolusiDesignSystem_4ffc3d;
```

Pin React 18 for this path: React 19 dropped the UMD builds the bundle relies on. The React tags carry SRI hashes; the `meridian.efolusi.com` tags do not, because those URLs always serve the newest release. Self-host `styles.css` and `_ds_bundle.js` if you need every file pinned. `hello.html` in the repo is a complete runnable page.

## Owning the source

Any path can drop to vendoring: copy `components/<group>/<Name>.jsx` and its `.d.ts` straight into your codebase (Apache-2.0: keep the license notice). Each registry item at `site/registry/<name>.json` lists the sibling components it needs under `registryDependencies`, so a copied component brings its dependencies with it.

## Strict Content Security Policy

No Meridian component writes a `style` attribute of its own. Runtime sizes and positions go through the CSSOM, which a CSP does not block. What a strict policy (`style-src` without `'unsafe-inline'`) still blocks depends on how you install Meridian:

| Install | Under a strict `style-src` | What to do |
|---|---|---|
| npm, `@efolusi/meridian` | Works: the component CSS is the static `styles.css` | Nothing |
| Registry copies, `npx meridian add` | Each component adds a `<style>` element when it renders, and the policy blocks it | Add `meridian-ssr-css` and import its `components.css`; components then skip the CSS it carries. A copy you edit adds its own CSS again, and that is blocked |
| CDN bundle, `_ds_bundle.js` | Each component adds a `<style>` element when it renders, and the policy blocks it | Allow `'unsafe-inline'` in `style-src`, or use the npm package |

One thing is blocked on every path:

- A `style` prop you pass is a `style` attribute in server-rendered HTML. The policy drops it, and hydration does not apply it again. In the browser, React sets it through the CSSOM, which works.

The colours a `ChartContainer` `config` sets (`color` or `theme`) are not blocked: `ChartStyle` writes them as `--color-<key>` custom properties on the chart element through the CSSOM, and a `theme` pair is a `light-dark()` value. A server render shows the series without those colours until the page hydrates. `light-dark()` needs Chrome 123, Firefox 120 or Safari 17.5, inside the [supported browsers](accessibility.md#browser-support-and-rtl). A browser without it shows a `theme` colour as black fill and no stroke; a single `color` works everywhere.

The theme script is a `script-src` matter: pass a nonce or allow its hash, as [theming.md](theming.md#server-layouts) describes.

## A 404 page on a static site

A static site needs a not-found page, and the host has to answer with it. Without one, an unknown path returns status 404 and an empty body, a blank white page with no way home. pay and the komando site did exactly that.

**The page.** The root `404.html` is the shared page, in English and Indonesian, light and dark. Copy it into the site and change three things: the mark, the product name in the `<title>`, and the `href` of the two home links. To keep one language, delete the other `<section>`. It needs one stylesheet, `styles.css` (the `.ef-notfound` rules live in `tokens/base.css`), and holds no script, no `<style>` and no `style` attribute, so a strict CSP that allows `'self'` renders it without `'unsafe-inline'`, a nonce or a hash. Do not add any of the three to it. It follows the operating system for light or dark, because a saved theme needs the theme script. The `not-found` block in `blocks/` is a different thing: a card inside an app, with search.

**The deploy.** The host must serve that page for every unknown path, with status `404` and the same response headers as any other page, the CSP header included. A 404 that skips the CSP is a page without the policy, and any URL reaches it.

| Host | What to set |
|---|---|
| Cloudflare Workers static assets | `"assets": { "not_found_handling": "404-page" }` in the Wrangler config. The Worker serves the nearest `404.html` with status 404, and the rules in `_headers` match the request path, so a `/*` rule with `Content-Security-Policy` covers it |
| A Worker with a script that fetches `env.ASSETS` | Return the assets response as it comes: its body and its 404 status. Never build `new Response(null, { status: 404 })`. Set the CSP on that response the same way you set it on a 200 |
| Another static host | Name `404.html` as the not-found file in the host's own setting, and set the CSP header for every path in the same place as for the other pages |

Check it with a path that does not exist, after every deploy and before a release that changes the Worker:

```sh
curl -si https://your-site.example/no-such-page
```

The first line must say `404`, the headers must include `content-security-policy`, and the body must contain `class="ef-notfound"`. A `404` with an empty body or a missing CSP header is a defect.

## Dark mode and density, everywhere

Independent of framework, set attributes on `<html>` or any subtree:

```html
<html data-theme="dark" data-density="compact">
```

Only semantic aliases remap. A `data-theme="dark"` subtree turns dark inside a light page, and a `data-theme="light"` subtree turns light inside a dark one: the light token block is `:root, [data-theme="light"]`.

With no `data-theme` on `<html>`, Meridian follows the operating system:
`prefers-color-scheme: dark` applies the dark tokens. `data-theme="dark"`
forces dark, and `data-theme="light"` forces light. An app with no dark styling
of its own should set `data-theme="light"` on `<html>`; otherwise a dark OS turns
Meridian components dark inside a light page. A theme script that switches to
light by removing the attribute must set `"light"` instead.

## Fonts

`styles.css` self-hosts Figtree, Bricolage Grotesque and JetBrains Mono with
`font-display: swap`. It also ships metric-matched fallback faces,
`Figtree Fallback` and `Bricolage Grotesque Fallback`: local Arial scaled with
`size-adjust`, `ascent-override` and `descent-override`, so text barely moves
when the web font arrives.

To start the download earlier, preload the faces your first screen uses. Point
the URL at wherever your build serves `assets/fonts/`:

```html
<link rel="preload" href="/assets/fonts/Figtree-Variable.woff2" as="font" type="font/woff2" crossorigin>
<link rel="preload" href="/assets/fonts/BricolageGrotesque-Variable.woff2" as="font" type="font/woff2" crossorigin>
```

`crossorigin` is required even on the same origin; without it the browser
downloads the font twice.
