'use client';
import React from 'react';
const _cache = {};
// One request per glyph: instances mounting together share the in-flight fetch.
const _inflight = {};
function base(){
  if (window.__efBase !== undefined) return window.__efBase;
  const s = [...document.querySelectorAll('script')].find(el => el.src && el.src.includes('_ds_bundle.js'));
  window.__efBase = s ? s.src.slice(0, s.src.indexOf('_ds_bundle.js')) : '';
  return window.__efBase;
}
// An unknown name renders an empty box, which reads as a styling bug and sends
// you looking in the wrong place. Say it plainly instead, once per name so a
// bad icon inside a list does not flood the console.
const _warned = new Set();
function warnMissing(name) {
  if (_warned.has(name) || typeof console === 'undefined') return;
  _warned.add(name);
  console.warn('[meridian] <Icon name="' + name + '"> is not a Meridian glyph, so nothing will render. Check the name against the icon gallery, or add ' + name + '.svg to assets/icons/.');
}

function warnNotSvg(name) {
  if (_warned.has(name) || typeof console === 'undefined') return;
  _warned.add(name);
  console.warn('[meridian] ' + base() + 'assets/icons/' + name + '.svg answered with something that is not an SVG, often an app\'s index.html, so <Icon name="' + name + '"> renders nothing. Serve assets/icons/ beside _ds_bundle.js, or in a bundled app use the registry or npm Icon, which inlines every glyph.');
}

export function Icon({ name, size = 16, strokeWidth = 1.5, title, className, style, ...rest }) {
  const [svg, setSvg] = React.useState(name in _cache ? _cache[name] : null);
  React.useEffect(() => {
    // `name in _cache` rather than a truthy check, so a name that 404s is
    // remembered as '' instead of being refetched by every later mount.
    if (name in _cache) { setSvg(_cache[name]); return; }
    let live = true;
    if (!_inflight[name]) {
      // A reset or dropped connection (busy static server, flaky network) is
      // retried twice with a short backoff before the glyph is given up on.
      const load = attempt => fetch(base() + 'assets/icons/' + name + '.svg')
        .catch(error => attempt < 2
          ? new Promise(r => setTimeout(r, 150 * (attempt + 1))).then(() => load(attempt + 1))
          : Promise.reject(error));
      _inflight[name] = load(0)
        .then(r => {
          // A served 404 means the name is wrong; anything else — offline, a
          // jsdom test with no base URL, a blocked request — is the environment,
          // not the call site, so it stays quiet rather than crying wolf on
          // every valid icon in a consumer's test run.
          if (r.status === 404) { warnMissing(name); _cache[name] = ''; return ''; }
          if (!r.ok) return '';
          // Only markup that is an SVG gets injected. A server without the file
          // can still answer 200 with its SPA fallback, index.html, which would
          // otherwise land inside the button as a whole document.
          return r.text().then(t => {
            if (/^\s*<svg[\s>]/.test(t)) return (_cache[name] = t);
            warnNotSvg(name);
            return (_cache[name] = '');
          });
        })
        // A network failure is not remembered, so a later mount tries again.
        .catch(() => '')
        .finally(() => { delete _inflight[name]; });
    }
    _inflight[name].then(t => { if (live) setSvg(t); });
    return () => { live = false; };
  }, [name]);
  const html = svg
    ? svg.replace('width="24"', 'width="' + size + '"').replace('height="24"', 'height="' + size + '"').replace('stroke-width="2"', 'stroke-width="' + strokeWidth + '"')
    : '';
  return <span {...rest} data-slot="icon" aria-hidden={title ? undefined : true} aria-label={title} role={title ? 'img' : undefined} className={className} style={{ display: 'inline-flex', flex: 'none', width: size, height: size, color: 'inherit', ...style }} dangerouslySetInnerHTML={{ __html: html }} />;
}
