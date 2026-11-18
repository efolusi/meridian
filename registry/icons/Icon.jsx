'use client';
// The Icon that ships to bundler consumers: the npm package (scripts/build_npm.mjs)
// and the copy-in registry (scripts/build_registry.py) both use this file in
// place of components/icons/Icon.jsx. That one fetches each SVG from a base URL
// only the zero-build site has; here every glyph is in ./_svg.js, generated from
// assets/icons/ by scripts/build_registry.py, so nothing depends on where the app
// is served from. Keep the props and the output markup identical to the original.
import React from 'react';
import { SVGS } from './_svg.js';

// Every name is known at build time here, so a miss is always a typo or a
// glyph that was never added. Saying so beats rendering an empty box in
// silence, which reads as a styling bug and sends you looking in the wrong
// place. Once per name, so a bad icon in a list does not flood the console.
const _warned = new Set();
function warnMissing(name) {
  if (_warned.has(name) || typeof console === 'undefined') return;
  _warned.add(name);
  console.warn('[meridian] <Icon name="' + name + '"> is not a Meridian glyph, so nothing will render. Check the name against the icon gallery, or add ' + name + '.svg to assets/icons/.');
}

export function Icon({ name, size = 16, strokeWidth = 1.5, title, className, style, ...rest }) {
  const svg = SVGS[name] || '';
  if (!svg) warnMissing(name);
  const html = svg
    ? svg.replace('width="24"', 'width="' + size + '"').replace('height="24"', 'height="' + size + '"').replace('stroke-width="2"', 'stroke-width="' + strokeWidth + '"')
    : '';
  return React.createElement('span', {
    ...rest,
    'data-slot': 'icon',
    'aria-hidden': title ? undefined : true,
    'aria-label': title,
    role: title ? 'img' : undefined,
    className,
    style: { display: 'inline-flex', flex: 'none', width: size, height: size, color: 'inherit', ...style },
    dangerouslySetInnerHTML: { __html: html },
  });
}
