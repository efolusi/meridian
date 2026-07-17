const R = React;
const NS = 'EfolusiDesignSystem_4ffc3d';
const ACCENTS = [
  { id: 'espresso', label: 'Espresso', chip: '#2C1709', def: true, light: {}, dark: {} },
  { id: 'forest', label: 'Forest', chip: '#1F5B43',
    light: { '--accent': '#1F5B43', '--accent-hover': '#174935', '--accent-active': '#103A2A', '--accent-subtle': '#E7F1EC', '--accent-subtle-border': '#C2DACD', '--text-link': '#216B4E', '--brand-700': '#216B4E', '--focus-ring': '0 0 0 2px rgba(31,91,67,.45)' },
    dark: { '--accent': '#8FC9AF', '--accent-hover': '#A8D8C2', '--accent-active': '#76B99B', '--accent-contrast': '#0F231A', '--accent-subtle': '#1E2B25', '--accent-subtle-border': '#2E4438', '--text-link': '#8FC9AF', '--brand-400': '#8FC9AF', '--focus-ring': '0 0 0 2px rgba(143,201,175,.5)' } },
  { id: 'indigo', label: 'Indigo', chip: '#3B3E8F',
    light: { '--accent': '#3B3E8F', '--accent-hover': '#32357C', '--accent-active': '#282A66', '--accent-subtle': '#EBECF7', '--accent-subtle-border': '#C6C8EA', '--text-link': '#4A4EA8', '--brand-700': '#4A4EA8', '--focus-ring': '0 0 0 2px rgba(59,62,143,.45)' },
    dark: { '--accent': '#A3A6E3', '--accent-hover': '#B8BAEC', '--accent-active': '#8E92D9', '--accent-contrast': '#191A33', '--accent-subtle': '#222338', '--accent-subtle-border': '#363863', '--text-link': '#A3A6E3', '--brand-400': '#A3A6E3', '--focus-ring': '0 0 0 2px rgba(163,166,227,.5)' } },
  { id: 'oxblood', label: 'Oxblood', chip: '#7A2E2A',
    light: { '--accent': '#7A2E2A', '--accent-hover': '#672420', '--accent-active': '#521B18', '--accent-subtle': '#F7EAE8', '--accent-subtle-border': '#E2C2BE', '--text-link': '#8A3B36', '--brand-700': '#8A3B36', '--focus-ring': '0 0 0 2px rgba(122,46,42,.45)' },
    dark: { '--accent': '#E3968F', '--accent-hover': '#ECABA5', '--accent-active': '#D77F77', '--accent-contrast': '#2B120F', '--accent-subtle': '#33201E', '--accent-subtle-border': '#55302C', '--text-link': '#E3968F', '--brand-400': '#E3968F', '--focus-ring': '0 0 0 2px rgba(227,150,143,.5)' } },
  { id: 'slate', label: 'Slate ink', chip: '#33404D',
    light: { '--accent': '#33404D', '--accent-hover': '#2A3540', '--accent-active': '#202932', '--accent-subtle': '#ECEFF2', '--accent-subtle-border': '#C9D2DA', '--text-link': '#465866', '--brand-700': '#465866', '--focus-ring': '0 0 0 2px rgba(51,64,77,.45)' },
    dark: { '--accent': '#A9BCCC', '--accent-hover': '#BCCDDA', '--accent-active': '#93A9BB', '--accent-contrast': '#141B21', '--accent-subtle': '#232A31', '--accent-subtle-border': '#38434E', '--text-link': '#A9BCCC', '--brand-400': '#A9BCCC', '--focus-ring': '0 0 0 2px rgba(169,188,204,.5)' } },
];
const RADII = [
  { id: 'square', label: 'Square', vars: { '--radius-sm': '0px', '--radius-md': '0px', '--radius-lg': '0px', '--radius-xl': '0px' } },
  { id: 'default', label: 'Default', def: true, vars: {} },
  { id: 'soft', label: 'Soft', vars: { '--radius-sm': '8px', '--radius-md': '12px', '--radius-lg': '16px', '--radius-xl': '22px' } },
];
function cssBlock(sel, vars) {
  const keys = Object.keys(vars);
  if (!keys.length) return '';
  return sel + ' {\n' + keys.map(k => '  ' + k + ': ' + vars[k] + ';').join('\n') + '\n}';
}
function buildCss(accent, radius) {
  const parts = [
    cssBlock(':root', { ...accent.light, ...radius.vars }),
    cssBlock('[data-theme="dark"]', accent.dark),
  ].filter(Boolean);
  return parts.length ? parts.join('\n\n') : '/* Meridian defaults — nothing to override. */';
}
function ThemeCustomizer() {
  const [ds, setDs] = R.useState(window[NS] || null);
  const [accentId, setAccentId] = R.useState('espresso');
  const [radiusId, setRadiusId] = R.useState('default');
  const [mode, setMode] = R.useState('light');
  const [density, setDensity] = R.useState('comfortable');
  const [copied, setCopied] = R.useState(false);
  R.useEffect(() => {
    if (ds) return;
    let n = 0;
    const t = setInterval(() => { if (window[NS]) { setDs(window[NS]); clearInterval(t); } else if (++n > 150) clearInterval(t); }, 80);
    return () => clearInterval(t);
  }, [ds]);
  if (!ds) return R.createElement('div', { style: { height: 600, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)', fontSize: 13.5 } }, 'Loading customizer…');
  const { SegmentedControl, Button, Badge, Stat, Input, Switch, BarChart, CodeBlock, Tag, Progress, Tabs, Link } = ds;
  const accent = ACCENTS.find(a => a.id === accentId);
  const radius = RADII.find(r => r.id === radiusId);
  const css = buildCss(accent, radius);
  const previewVars = { ...(mode === 'dark' ? accent.dark : accent.light), ...radius.vars };
  const copy = () => { try { navigator.clipboard.writeText(css); } catch (e) {} setCopied(true); setTimeout(() => setCopied(false), 1400); };
  const lbl = { fontSize: 11, fontWeight: 600, letterSpacing: '0.06em', textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: 8 };
  const h = R.createElement;
  return h('div', null,
    // controls bar
    h('div', { style: { display: 'flex', gap: 28, flexWrap: 'wrap', alignItems: 'flex-start', border: '1px solid var(--border-default)', borderRadius: 'var(--radius-lg)', background: 'var(--surface-card)', padding: '18px 22px' } },
      h('div', null, h('div', { style: lbl }, 'Accent'),
        h('div', { style: { display: 'flex', gap: 8 } }, ACCENTS.map(a =>
          h('button', {
            key: a.id, onClick: () => setAccentId(a.id), title: a.label, 'aria-label': a.label + ' accent', 'aria-pressed': a.id === accentId,
            style: { width: 30, height: 30, borderRadius: 'var(--radius-full)', background: a.chip, cursor: 'pointer', border: '2px solid ' + (a.id === accentId ? 'var(--text-primary)' : 'transparent'), boxShadow: a.id === accentId ? '0 0 0 2px var(--surface-card) inset' : 'inset 0 0 0 1px rgba(255,255,255,.25)' },
          })))),
      h('div', null, h('div', { style: lbl }, 'Radius'),
        h(SegmentedControl, { value: radiusId, onChange: setRadiusId, options: RADII.map(r => ({ id: r.id, label: r.label })) })),
      h('div', null, h('div', { style: lbl }, 'Mode'),
        h(SegmentedControl, { value: mode, onChange: setMode, options: [{ id: 'light', label: 'Light' }, { id: 'dark', label: 'Dark' }] })),
      h('div', null, h('div', { style: lbl }, 'Density'),
        h(SegmentedControl, { value: density, onChange: setDensity, options: [{ id: 'comfortable', label: 'Comfortable' }, { id: 'compact', label: 'Compact' }] })),
      h('div', { style: { marginLeft: 'auto', alignSelf: 'flex-end' } },
        h(Button, { variant: 'secondary', iconLeft: copied ? 'check' : 'copy', onClick: copy }, copied ? 'Copied' : 'Copy CSS'))),
    // preview + css
    h('div', { className: 'grid-2', style: { display: 'grid', gridTemplateColumns: 'minmax(0,1.6fr) minmax(0,1fr)', gap: 18, marginTop: 18, alignItems: 'start' } },
      h('div', { 'data-theme': mode, 'data-density': density, style: { ...previewVars, border: '1px solid var(--border-default)', borderRadius: 'var(--radius-lg)', overflow: 'hidden' } },
        h('div', { style: { background: 'var(--surface-page)', padding: 24, color: 'var(--text-primary)', fontFamily: 'var(--font-sans)' } },
          h('div', { style: { background: 'var(--surface-card)', border: '1px solid var(--border-default)', borderRadius: 'var(--radius-md)', padding: 20 } },
            h('div', { style: { display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' } },
              h('h3', { style: { fontFamily: 'var(--font-display)', fontWeight: 650, fontSize: 17, letterSpacing: '-0.01em', margin: 0 } }, 'Workspace overview'),
              h(Badge, { tone: 'success', dot: true }, 'Live'),
              h('div', { style: { marginLeft: 'auto', display: 'flex', gap: 8 } },
                h(Button, { variant: 'secondary', size: 'sm' }, 'Export'),
                h(Button, { size: 'sm', iconLeft: 'plus' }, 'New task'))),
            h('div', { style: { marginTop: 14 } },
              h(Tabs, { value: 'overview', onChange: () => {}, items: [{ id: 'overview', label: 'Overview' }, { id: 'runs', label: 'Runs', count: 12 }, { id: 'settings', label: 'Settings' }] })),
            h('div', { className: 'grid-3', style: { display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 14, margin: '16px 0', paddingBottom: 16, borderBottom: '1px solid var(--border-default)' } },
              h(Stat, { label: 'Revenue', value: '$48.2k', delta: '+12.4%', direction: 'up' }),
              h(Stat, { label: 'Active seats', value: '312', delta: '+3.1%', direction: 'up' }),
              h(Stat, { label: 'Failed runs', value: '4', delta: '−0.8%', direction: 'down' })),
            h(BarChart, { data: [42, 38, 51, 46, 62, 58, 71, 80], labels: ['Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct'], highlightLast: 2, height: 110 }),
            h('div', { style: { display: 'flex', gap: 8, flexWrap: 'wrap', margin: '16px 0' } },
              h(Tag, { icon: 'sparkles' }, 'auto-retry'), h(Tag, null, 'eu-west-1'), h(Tag, null, 'production')),
            h(Progress, { value: 72, label: 'Monthly budget', showValue: true }),
            h('div', { style: { display: 'flex', gap: 16, alignItems: 'flex-end', marginTop: 16, flexWrap: 'wrap' } },
              h('div', { style: { flex: '1 1 180px' } }, h(Input, { label: 'Workspace name', defaultValue: 'efolusi-hq' })),
              h('div', { style: { paddingBottom: 8 } }, h(Switch, { label: 'Email reports', defaultChecked: true })),
              h(Button, null, 'Save changes')),
            h('p', { style: { fontSize: 13.5, margin: '14px 0 0', color: 'var(--text-secondary)' } }, 'Read the ', h(Link, { href: '#' }, 'billing docs'), ' before upgrading.')))),
      h('div', null,
        h(CodeBlock, { lang: 'css', title: 'theme-override.css', maxHeight: 560 }, css),
        h('p', { style: { fontSize: 13, lineHeight: 1.6, color: 'var(--text-muted)', margin: '10px 2px 0' } }, 'Load this after styles.css. Semantic tokens only — components, kits, and blocks pick it up with no other change.'))));
}
module.exports = { ThemeCustomizer };
