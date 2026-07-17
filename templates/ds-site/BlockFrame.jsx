const R = React;
const NS = 'EfolusiDesignSystem_4ffc3d';
const srcCache2 = {};
function fetchBlockSrc(file) {
  if (!srcCache2[file]) srcCache2[file] = fetch(file).then(r => { if (!r.ok) throw new Error('Could not load ' + file); return r.text(); });
  return srcCache2[file];
}
const WIDTHS = [
  { id: 'desktop', icon: 'monitor', w: 1280, label: 'Desktop' },
  { id: 'tablet', icon: 'tablet', w: 768, label: 'Tablet' },
  { id: 'mobile', icon: 'smartphone', w: 390, label: 'Mobile' },
];
function BlockFrame({ file, title, height = 640 }) {
  const [tab, setTab] = R.useState('preview');
  const [size, setSize] = R.useState('desktop');
  const [code, setCode] = R.useState(null);
  const [err, setErr] = R.useState(null);
  const [cw, setCw] = R.useState(1104);
  const wrap = R.useRef(null);
  R.useEffect(() => {
    const measure = () => { if (wrap.current) setCw(wrap.current.clientWidth); };
    measure();
    window.addEventListener('resize', measure);
    return () => window.removeEventListener('resize', measure);
  }, []);
  R.useEffect(() => {
    let on = true;
    fetchBlockSrc(file).then(t => { if (on) setCode(t); }).catch(e => { if (on) setErr(String(e.message || e)); });
    return () => { on = false; };
  }, [file]);
  const ds = window[NS] || {};
  const { CodeBlock, Icon } = ds;
  const dev = WIDTHS.find(x => x.id === size);
  const scale = Math.min(1, cw / dev.w);
  const frameH = Math.ceil(height / scale);
  const tabStyle = on => ({
    appearance: 'none', border: 'none', background: 'none', cursor: 'pointer', padding: '8px 2px 9px', marginRight: 18,
    fontFamily: 'var(--font-sans)', fontSize: 13.5, fontWeight: on ? 600 : 450,
    color: on ? 'var(--text-primary)' : 'var(--text-muted)',
    boxShadow: on ? 'inset 0 -2px 0 var(--brand-700)' : 'none',
  });
  const devBtn = on => ({
    display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: 30, height: 26,
    border: 'none', borderRadius: 'var(--radius-sm)', cursor: 'pointer',
    background: on ? 'var(--surface-sunken)' : 'transparent', color: on ? 'var(--text-primary)' : 'var(--text-muted)',
  });
  return R.createElement('div', null,
    R.createElement('div', { style: { display: 'flex', alignItems: 'center', borderBottom: '1px solid var(--border-default)' } },
      R.createElement('button', { style: tabStyle(tab === 'preview'), onClick: () => setTab('preview') }, 'Preview'),
      R.createElement('button', { style: tabStyle(tab === 'code'), onClick: () => setTab('code') }, 'Code'),
      R.createElement('div', { style: { marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 4, paddingBottom: 4 } },
        tab === 'preview' ? WIDTHS.map(x => R.createElement('button', {
          key: x.id, title: x.label + ' · ' + x.w + 'px', 'aria-label': x.label, style: devBtn(size === x.id), onClick: () => setSize(x.id),
        }, Icon ? R.createElement(Icon, { name: x.icon, size: 15 }) : x.label[0])) : null,
        R.createElement('span', { style: { width: 1, height: 16, background: 'var(--border-default)', margin: '0 6px' } }),
        R.createElement('a', { href: file, target: '_blank', rel: 'noopener', title: 'Open full screen', style: { ...devBtn(false), textDecoration: 'none' } },
          Icon ? R.createElement(Icon, { name: 'arrow-up-right', size: 15 }) : '↗'))),
    tab === 'preview'
      ? R.createElement('div', { ref: wrap, style: { border: '1px solid var(--border-default)', borderTop: 'none', borderRadius: '0 0 var(--radius-md) var(--radius-md)', background: 'var(--surface-sunken)', height, overflow: 'hidden', position: 'relative' } },
          R.createElement('div', { style: { width: dev.w * scale, margin: '0 auto', height: '100%', overflow: 'hidden', background: 'var(--surface-page)', boxShadow: size !== 'desktop' ? '0 0 0 1px var(--border-default)' : 'none' } },
            R.createElement('iframe', { src: file, title, loading: 'lazy', style: { width: dev.w, height: frameH, border: 0, transform: 'scale(' + scale + ')', transformOrigin: 'top left', display: 'block' } })))
      : R.createElement('div', { style: { borderRadius: '0 0 var(--radius-md) var(--radius-md)', overflow: 'hidden' } },
          err ? R.createElement('div', { style: { padding: 20, color: 'var(--danger-600)', fontFamily: 'var(--font-mono)', fontSize: 12.5, border: '1px solid var(--border-default)', borderTop: 'none' } }, err)
            : code && CodeBlock ? R.createElement(CodeBlock, { lang: 'html', title: file.split('/').pop(), maxHeight: 460 }, code)
            : R.createElement('div', { style: { padding: 20, color: 'var(--text-muted)', fontSize: 13, border: '1px solid var(--border-default)', borderTop: 'none' } }, 'Loading source…')));
}
module.exports = { BlockFrame };
