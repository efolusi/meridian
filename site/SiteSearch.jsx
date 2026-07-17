const R = React;
const NS = 'EfolusiDesignSystem_4ffc3d';
let regCache = null;
function loadRegistry() {
  if (!regCache) regCache = fetch('./registry.js').then(r => r.text()).then(t => {
    const i = t.indexOf('GROUPS = ');
    return JSON.parse(t.slice(i + 9, t.lastIndexOf(';')));
  }).catch(() => []);
  return regCache;
}
const PAGES = [
  { id: './DsSite.dc.html', label: 'Home', icon: 'house' },
  { id: './Docs.dc.html', label: 'Docs', icon: 'book-open' },
  { id: './Components.dc.html', label: 'Components', icon: 'package' },
  { id: './Blocks.dc.html', label: 'Blocks', icon: 'layout-dashboard' },
  { id: './Examples.dc.html', label: 'Examples', icon: 'bot' },
  { id: './Charts.dc.html', label: 'Charts', icon: 'chart-line' },
  { id: './Themes.dc.html', label: 'Themes', icon: 'sparkles' },
  { id: './Colors.dc.html', label: 'Colors', icon: 'sliders-horizontal' },
];
const DOCS = [
  ['introduction', 'Introduction'], ['installation', 'Installation'], ['theming', 'Theming'],
  ['dark-mode', 'Dark mode & density'], ['typography', 'Typography'], ['monorepo', 'Repository'],
  ['ai', 'AI & skills'], ['contributing', 'Contributing'], ['changelog', 'Changelog'],
];
function SiteSearch() {
  const [open, setOpen] = R.useState(false);
  const [groups, setGroups] = R.useState(null);
  R.useEffect(() => {
    const onKey = e => {
      if ((e.metaKey || e.ctrlKey) && String(e.key).toLowerCase() === 'k') { e.preventDefault(); setOpen(o => !o); }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);
  R.useEffect(() => {
    if (!open || groups) return;
    loadRegistry().then(gs => {
      const comps = [];
      (gs || []).forEach(g => (g.items || []).forEach(it => comps.push({ id: './Components.dc.html#' + g.id + '/' + it.name, label: it.name, hint: g.label })));
      setGroups([
        { group: 'Pages', items: PAGES.map(p => ({ id: p.id, label: p.label, icon: p.icon })) },
        { group: 'Docs', items: DOCS.map(d => ({ id: './Docs.dc.html#' + d[0], label: d[1], icon: 'book-open' })) },
        { group: 'Components', items: comps },
      ]);
    });
  }, [open, groups]);
  const ds = window[NS] || {};
  const CP = ds.CommandPalette;
  const Icon = ds.Icon;
  return R.createElement('span', null,
    R.createElement('button', {
      onClick: () => setOpen(true), 'aria-label': 'Search documentation', className: 'site-search',
      style: { display: 'flex', alignItems: 'center', gap: 8, height: 36, padding: '0 8px 0 10px', border: '1px solid var(--border-default)', borderRadius: 'var(--radius-sm)', background: 'var(--surface-card)', color: 'var(--text-muted)', fontFamily: 'var(--font-sans)', fontSize: 13, cursor: 'pointer', flex: 'none', justifyContent: 'flex-start' },
    },
      Icon ? R.createElement(Icon, { name: 'search', size: 14 }) : null,
      R.createElement('span', { className: 'site-search-label', style: { flex: 1, textAlign: 'left', whiteSpace: 'nowrap', overflow: 'hidden' } }, 'Search docs…'),
      R.createElement('span', { className: 'site-search-kbd', style: { fontFamily: 'var(--font-mono)', fontSize: 11, border: '1px solid var(--border-default)', borderRadius: 4, padding: '1px 5px', background: 'var(--surface-page)' } }, '⌘K')
    ),
    CP && groups ? R.createElement(CP, {
      open, onClose: () => setOpen(false), groups,
      placeholder: 'Search components, docs, pages…',
      onSelect: id => { setOpen(false); location.href = id; },
    }) : null
  );
}
module.exports = { SiteSearch };
