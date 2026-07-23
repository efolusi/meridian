import React from 'react';
const _cache = {};
function base(){
  if (window.__efBase !== undefined) return window.__efBase;
  const s = [...document.querySelectorAll('script')].find(el => el.src && el.src.includes('_ds_bundle.js'));
  window.__efBase = s ? s.src.slice(0, s.src.indexOf('_ds_bundle.js')) : '';
  return window.__efBase;
}
export function Icon({ name, size = 16, strokeWidth = 1.5, title, className, style, ...rest }) {
  const [svg, setSvg] = React.useState(name in _cache ? _cache[name] : null);
  React.useEffect(() => {
    // `name in _cache` rather than a truthy check, so a name that 404s is
    // remembered as '' instead of being refetched by every later mount.
    if (name in _cache) { setSvg(_cache[name]); return; }
    let live = true;
    fetch(base() + 'assets/icons/' + name + '.svg')
      .then(r => r.ok ? r.text() : Promise.reject(new Error('HTTP ' + r.status)))
      .then(t => { _cache[name] = t; if (live) setSvg(t); })
      .catch(err => {
        _cache[name] = '';
        // Without this an unknown name renders an empty box and looks like a
        // styling bug; say plainly that the glyph is missing.
        if (typeof console !== 'undefined') {
          console.warn('[meridian] <Icon name="' + name + '"> could not be loaded (' + err.message + '). Add ' + name + '.svg to assets/icons/, or check the name against the icon gallery.');
        }
        if (live) setSvg('');
      });
    return () => { live = false; };
  }, [name]);
  const html = svg
    ? svg.replace('width="24"', 'width="' + size + '"').replace('height="24"', 'height="' + size + '"').replace('stroke-width="2"', 'stroke-width="' + strokeWidth + '"')
    : '';
  return <span {...rest} aria-hidden={title ? undefined : true} aria-label={title} role={title ? 'img' : undefined} className={className} style={{ display: 'inline-flex', flex: 'none', width: size, height: size, color: 'inherit', ...style }} dangerouslySetInnerHTML={{ __html: html }} />;
}
