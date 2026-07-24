# Framework guides

Meridian ships two ways from one source: the zero-build CDN bundle (the flagship) and `@efolusi/meridian` on npm (ES modules, types, for bundlers). `react` and `react-dom` are peer dependencies (`>=18`). Pick the row that matches your stack.

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
<script src="https://unpkg.com/react@18.3.1/umd/react.production.min.js"></script>
<script src="https://unpkg.com/react-dom@18.3.1/umd/react-dom.production.min.js"></script>
<script src="https://meridian.efolusi.com/_ds_bundle.js"></script>
```

```js
const { Button, Card } = window.EfolusiDesignSystem_4ffc3d;
```

Pin React 18 for this path: React 19 dropped the UMD builds the bundle relies on. `hello.html` in the repo is a complete runnable page.

## Owning the source

Any path can drop to vendoring: copy `components/<group>/<Name>.jsx` and its `.d.ts` straight into your codebase (MIT, no attribution). Each registry item at `site/registry/<name>.json` lists the sibling components it needs under `registryDependencies`, so a copied component brings its dependencies with it.

## Dark mode and density, everywhere

Independent of framework, set attributes on `<html>` or any subtree:

```html
<html data-theme="dark" data-density="compact">
```

Only semantic aliases remap, so a dark page can host a light card and back.
