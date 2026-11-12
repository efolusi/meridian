# @efolusi/meridian-icons

The [Meridian](https://meridian.efolusi.com) icon set as a standalone package: 115 Lucide-derived SVGs (24×24, 2px stroke) and three filled brand marks (GitHub, LinkedIn, X), framework-agnostic. Raw SVG files plus a name-to-svg index. For teams who want the icons without the React components.

Built from the same source as `@efolusi/meridian`, in lockstep versions.

```bash
npm install @efolusi/meridian-icons
```

```js
import { icons, getIcon, iconNames } from '@efolusi/meridian-icons';
element.innerHTML = getIcon('check'); // the raw <svg> string
```

Or reference a file directly (bundlers, `<img>`, build tools):

```js
import checkUrl from '@efolusi/meridian-icons/svg/check.svg';
```

MIT for the packaging; the icons are Lucide-derived and carry the ISC/MIT Lucide licence (`LICENSE-Lucide.txt`). The three brand marks depict trademarks of GitHub, LinkedIn and X; use them only to link to those services.
