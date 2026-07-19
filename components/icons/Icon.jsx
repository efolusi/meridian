import React from 'react';
const _cache = {};
function base(){
  if (window.__efBase !== undefined) return window.__efBase;
  const s = [...document.querySelectorAll('script')].find(el => el.src && el.src.includes('_ds_bundle.js'));
  window.__efBase = s ? s.src.slice(0, s.src.indexOf('_ds_bundle.js')) : '';
  return window.__efBase;
}
export function Icon({ name, size = 16, strokeWidth = 1.5, title, className, style, ...rest }) {
  const [svg, setSvg] = React.useState(_cache[name] || null);
  React.useEffect(() => {
    if (_cache[name]) { setSvg(_cache[name]); return; }
    let live = true;
    fetch(base() + 'assets/icons/' + name + '.svg')
      .then(r => r.ok ? r.text() : Promise.reject(new Error('icon ' + name)))
      .then(t => { _cache[name] = t; if (live) setSvg(t); })
      .catch(() => { if (live) setSvg(''); });
    return () => { live = false; };
  }, [name]);
  const html = svg
    ? svg.replace('width="24"', 'width="' + size + '"').replace('height="24"', 'height="' + size + '"').replace('stroke-width="2"', 'stroke-width="' + strokeWidth + '"')
    : '';
  return <span {...rest} aria-hidden={title ? undefined : true} aria-label={title} role={title ? 'img' : undefined} className={className} style={{ display: 'inline-flex', flex: 'none', width: size, height: size, color: 'inherit', ...style }} dangerouslySetInnerHTML={{ __html: html }} />;
}
