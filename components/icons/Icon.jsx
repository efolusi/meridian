import React from 'react';
const _cache = {};
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

export function Icon({ name, size = 16, strokeWidth = 1.5, title, className, style, ...rest }) {
  const [svg, setSvg] = React.useState(name in _cache ? _cache[name] : null);
  React.useEffect(() => {
    // `name in _cache` rather than a truthy check, so a name that 404s is
    // remembered as '' instead of being refetched by every later mount.
    if (name in _cache) { setSvg(_cache[name]); return; }
    let live = true;
    fetch(base() + 'assets/icons/' + name + '.svg')
      .then(r => {
        // A served 404 means the name is wrong; anything else — offline, a
        // jsdom test with no base URL, a blocked request — is the environment,
        // not the call site, so it stays quiet rather than crying wolf on
        // every valid icon in a consumer's test run.
        if (!r.ok) { warnMissing(name); return Promise.reject(new Error('HTTP ' + r.status)); }
        return r.text();
      })
      .then(t => { _cache[name] = t; if (live) setSvg(t); })
      .catch(() => { _cache[name] = ''; if (live) setSvg(''); });
    return () => { live = false; };
  }, [name]);
  const html = svg
    ? svg.replace('width="24"', 'width="' + size + '"').replace('height="24"', 'height="' + size + '"').replace('stroke-width="2"', 'stroke-width="' + strokeWidth + '"')
    : '';
  return <span {...rest} aria-hidden={title ? undefined : true} aria-label={title} role={title ? 'img' : undefined} className={className} style={{ display: 'inline-flex', flex: 'none', width: size, height: size, color: 'inherit', ...style }} dangerouslySetInnerHTML={{ __html: html }} />;
}
