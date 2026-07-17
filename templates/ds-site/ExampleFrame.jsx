const R = React;
const NS = 'EfolusiDesignSystem_4ffc3d';
const srcCache = {};
function fetchSrc(file) {
  if (!srcCache[file]) srcCache[file] = fetch(file).then(r => { if (!r.ok) throw new Error('Could not load ' + file); return r.text(); });
  return srcCache[file];
}
function waitBabel() {
  return new Promise((res, rej) => {
    let n = 0;
    const t = () => { if (window.Babel) return res(window.Babel); if (++n > 120) return rej(new Error('Babel not available')); setTimeout(t, 80); };
    t();
  });
}
function waitNS() {
  return new Promise((res, rej) => {
    let n = 0;
    const t = () => { if (window[NS]) return res(window[NS]); if (++n > 150) return rej(new Error('Component bundle not loaded')); setTimeout(t, 80); };
    t();
  });
}
function extract(src, exp) {
  const chunks = String(src).split('// @demo ');
  for (let i = 1; i < chunks.length; i++) {
    const nl = chunks[i].indexOf('\n');
    const body = chunks[i].slice(nl + 1);
    const m = body.match(/export function (\w+)/);
    if (m && m[1] === exp) return body.replace('export function', 'function').trim();
  }
  throw new Error('Demo "' + exp + '" not found');
}
const compiled = {};
function getDemo(file, exp) {
  const key = file + '#' + exp;
  if (!compiled[key]) compiled[key] = (async () => {
    try { return await buildDemo(file, exp); } catch (e) { delete compiled[key]; throw e; }
  })();
  return compiled[key];
}
async function buildDemo(file, exp) {
  const [src] = await Promise.all([fetchSrc(file), waitBabel(), waitNS()]);
  const code = extract(src, exp);
  const js = window.Babel.transform(code, { presets: ['react'] }).code;
  return { code, Comp: new Function('React', js + '\nreturn ' + exp + ';')(R) };
}
class Boundary extends R.Component {
  constructor(p) { super(p); this.state = { err: null }; }
  static getDerivedStateFromError(e) { return { err: e }; }
  componentDidUpdate(prev) { if (prev.resetKey !== this.props.resetKey && this.state.err) this.setState({ err: null }); }
  render() {
    if (this.state.err) return R.createElement('div', { style: { color: 'var(--danger-600)', fontFamily: 'var(--font-mono)', fontSize: 12.5, padding: 20 } }, 'Render error: ' + String(this.state.err.message || this.state.err));
    return this.props.children;
  }
}
function ExampleFrame({ file, exp, minHeight }) {
  const [tab, setTab] = R.useState('preview');
  const [demo, setDemo] = R.useState(null);
  const [err, setErr] = R.useState(null);
  R.useEffect(() => {
    let on = true;
    setDemo(null); setErr(null); setTab('preview');
    getDemo(file, exp).then(d => { if (on) setDemo(d); }).catch(e => { if (on) setErr(String(e.message || e)); });
    return () => { on = false; };
  }, [file, exp]);
  const ds = window[NS] || {};
  const CodeBlock = ds.CodeBlock;
  const tabStyle = on => ({
    appearance: 'none', border: 'none', background: 'none', cursor: 'pointer', padding: '8px 2px 9px', marginRight: 18,
    fontFamily: 'var(--font-sans)', fontSize: 13.5, fontWeight: on ? 600 : 450,
    color: on ? 'var(--text-primary)' : 'var(--text-muted)',
    boxShadow: on ? 'inset 0 -2px 0 var(--brand-700)' : 'none',
  });
  return R.createElement('div', { style: { marginTop: 4 } },
    R.createElement('div', { style: { display: 'flex', alignItems: 'center', borderBottom: '1px solid var(--border-default)' } },
      R.createElement('button', { style: tabStyle(tab === 'preview'), onClick: () => setTab('preview') }, 'Preview'),
      R.createElement('button', { style: tabStyle(tab === 'code'), onClick: () => setTab('code') }, 'Code')
    ),
    tab === 'preview'
      ? R.createElement('div', { style: { border: '1px solid var(--border-default)', borderTop: 'none', borderRadius: '0 0 var(--radius-md) var(--radius-md)', background: 'var(--surface-card)', minHeight: minHeight || 300, padding: '44px 34px', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'auto' } },
          err ? R.createElement('div', { style: { color: 'var(--danger-600)', fontFamily: 'var(--font-mono)', fontSize: 12.5 } }, err)
            : demo ? R.createElement('div', { style: { width: '100%', display: 'flex', justifyContent: 'center' } }, R.createElement(Boundary, { resetKey: file + exp }, R.createElement(demo.Comp)))
            : R.createElement('div', { style: { color: 'var(--text-muted)', fontSize: 13 } }, 'Loading example…'))
      : R.createElement('div', { style: { borderRadius: '0 0 var(--radius-md) var(--radius-md)', overflow: 'hidden', marginTop: 0 } },
          demo && CodeBlock ? R.createElement(CodeBlock, { lang: 'jsx', maxHeight: 420 }, demo.code)
            : demo ? R.createElement('pre', { style: { margin: 0, padding: 16, fontFamily: 'var(--font-mono)', fontSize: 12.5, whiteSpace: 'pre-wrap', border: '1px solid var(--border-default)', borderTop: 'none' } }, demo.code)
            : R.createElement('div', { style: { padding: 20, color: 'var(--text-muted)', fontSize: 13, border: '1px solid var(--border-default)', borderTop: 'none' } }, err || 'Loading…'))
  );
}
module.exports = { ExampleFrame };
