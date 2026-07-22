import React from 'react';
import { injectEfCss } from '../forms/Button.jsx';
import { Icon } from '../icons/Icon.jsx';
const CSS = `
.ef-diff{border:1px solid var(--border-default);border-radius:var(--radius-md);background:var(--surface-card);overflow:hidden;font-family:var(--font-mono);font-size:12.5px;line-height:1.7}
.ef-diff__head{display:flex;align-items:center;gap:10px;padding:8px 13px;background:var(--surface-subtle);border-bottom:1px solid var(--border-default);font-size:12px;color:var(--text-secondary);font-family:var(--font-sans)}
.ef-diff__counts{margin-left:auto;display:inline-flex;gap:8px;font-size:11.5px;font-family:var(--font-mono);font-variant-numeric:tabular-nums}
.ef-diff__plus{color:var(--success-600)}
.ef-diff__minus{color:var(--danger-600)}
.ef-diff__scroll{overflow:auto}
.ef-diff__line{display:flex;white-space:pre}
.ef-diff__no{flex:none;width:38px;padding:0 8px;text-align:right;color:var(--text-muted);font-size:11px;user-select:none;background:var(--surface-subtle);border-right:1px solid var(--border-default)}
.ef-diff__sign{flex:none;width:20px;text-align:center;user-select:none;color:var(--text-muted)}
.ef-diff__text{flex:1;padding-right:14px;color:var(--text-secondary)}
.ef-diff__line--add{background:var(--success-100)}
.ef-diff__line--add .ef-diff__sign,.ef-diff__line--add .ef-diff__text{color:var(--success-600)}
.ef-diff__line--del{background:var(--danger-100)}
.ef-diff__line--del .ef-diff__sign,.ef-diff__line--del .ef-diff__text{color:var(--danger-600)}
.ef-diff__word--add{background:var(--success-300);border-radius:3px}
.ef-diff__word--del{background:var(--danger-300);border-radius:3px}
.ef-diff__skip{display:flex;align-items:center;gap:10px;padding:2px 0;color:var(--text-muted);font-size:11px;user-select:none}
.ef-diff__skipno{flex:none;width:76px;text-align:center;background:var(--surface-subtle);border-right:1px solid var(--border-default)}
.ef-diff__file{border-top:1px solid var(--border-default)}
.ef-diff__file:first-child{border-top:none}
.ef-diff__filehead{display:flex;align-items:center;gap:9px;width:100%;padding:8px 13px;border:none;background:var(--surface-subtle);cursor:pointer;text-align:left;font-family:var(--font-mono);font-size:12px;color:var(--text-primary)}
.ef-diff__filehead:focus-visible{outline:none;box-shadow:var(--focus-ring)}
.ef-diff__filechev{display:inline-flex;color:var(--text-muted);transition:transform var(--dur-fast) var(--ease-out)}
.ef-diff__filechev--open{transform:rotate(90deg)}
`;
function lcsOps(a, b) {
  const m = a.length, n = b.length;
  if (m * n > 400000) {
    const ops = [];
    a.forEach(v => ops.push(['del', v]));
    b.forEach(v => ops.push(['add', v]));
    return ops;
  }
  const w = n + 1, dp = new Uint16Array((m + 1) * w);
  for (let i = m - 1; i >= 0; i--) for (let j = n - 1; j >= 0; j--)
    dp[i * w + j] = a[i] === b[j] ? dp[(i + 1) * w + j + 1] + 1 : Math.max(dp[(i + 1) * w + j], dp[i * w + j + 1]);
  const ops = [];
  let i = 0, j = 0;
  while (i < m && j < n) {
    if (a[i] === b[j]) { ops.push(['ctx', a[i]]); i++; j++; }
    else if (dp[(i + 1) * w + j] >= dp[i * w + j + 1]) { ops.push(['del', a[i]]); i++; }
    else { ops.push(['add', b[j]]); j++; }
  }
  while (i < m) { ops.push(['del', a[i]]); i++; }
  while (j < n) { ops.push(['add', b[j]]); j++; }
  return ops;
}
function wordSegs(del, add) {
  const ta = del.split(/(\s+)/).filter(s => s !== ''), tb = add.split(/(\s+)/).filter(s => s !== '');
  const ops = lcsOps(ta, tb), d = [], a = [];
  for (const [t, v] of ops) {
    if (t === 'ctx') { d.push({ v }); a.push({ v }); }
    else if (t === 'del') d.push({ v, m: 1 });
    else a.push({ v, m: 1 });
  }
  return { d, a };
}
function splitLines(s) {
  const arr = String(s).split('\n');
  if (arr[arr.length - 1] === '') arr.pop();
  return arr;
}
export function computeDiff(from, to, { wordLevel = true, contextLines = 3 } = {}) {
  const ops = lcsOps(splitLines(from), splitLines(to));
  const rows = [];
  let oldNo = 0, newNo = 0, adds = 0, dels = 0;
  for (let i = 0; i < ops.length; i++) {
    const [t, text] = ops[i];
    if (t === 'ctx') { oldNo++; newNo++; rows.push({ type: 'ctx', text, oldNo, newNo }); continue; }
    if (t === 'del') {
      const delRun = [];
      while (i < ops.length && ops[i][0] === 'del') { delRun.push(ops[i][1]); i++; }
      const addRun = [];
      while (i < ops.length && ops[i][0] === 'add') { addRun.push(ops[i][1]); i++; }
      i--;
      const max = Math.max(delRun.length, addRun.length);
      for (let k = 0; k < max; k++) {
        const dl = delRun[k], al = addRun[k];
        const pair = wordLevel && dl !== undefined && al !== undefined ? wordSegs(dl, al) : null;
        if (dl !== undefined) { oldNo++; dels++; rows.push({ type: 'del', text: dl, oldNo, segs: pair && pair.d }); }
        if (al !== undefined) { newNo++; adds++; rows.push({ type: 'add', text: al, newNo, segs: pair && pair.a }); }
      }
      continue;
    }
    newNo++; adds++; rows.push({ type: 'add', text, newNo });
  }
  if (contextLines != null) {
    const out = [];
    let run = [];
    const flush = (leading, trailing) => {
      const keepStart = leading ? 0 : contextLines;
      const keepEnd = trailing ? 0 : contextLines;
      const skip = run.length - keepStart - keepEnd;
      if (skip > (leading || trailing ? 0 : 1)) {
        for (let k = 0; k < keepStart; k++) out.push(run[k]);
        out.push({ type: 'skip', count: skip });
        for (let k = run.length - keepEnd; k < run.length; k++) out.push(run[k]);
      } else run.forEach(r => out.push(r));
      run = [];
    };
    let seenChange = false;
    rows.forEach((r, idx) => {
      if (r.type === 'ctx') { run.push(r); if (idx === rows.length - 1) flush(!seenChange, true); }
      else { if (run.length) flush(!seenChange, false); seenChange = true; out.push(r); }
    });
    if (run.length) flush(!seenChange, true);
    return { rows: out, adds, dels };
  }
  return { rows, adds, dels };
}
function Rows({ rows }) {
  return rows.map((l, i) => {
    if (l.type === 'skip') return (
      <div key={i} className="ef-diff__skip"><span className="ef-diff__skipno">⋯</span><span>{l.count} unchanged lines</span></div>
    );
    const t = l.type || 'ctx';
    return (
      <div key={i} className={`ef-diff__line${t !== 'ctx' ? ' ef-diff__line--' + t : ''}`}>
        <span className="ef-diff__no">{t === 'add' ? '' : l.oldNo}</span>
        <span className="ef-diff__no">{t === 'del' ? '' : l.newNo}</span>
        <span className="ef-diff__sign">{t === 'add' ? '+' : t === 'del' ? '−' : ''}</span>
        <span className="ef-diff__text">{l.segs ? l.segs.map((s, k) => s.m ? <span key={k} className={`ef-diff__word--${t}`}>{s.v}</span> : s.v) : l.text}</span>
      </div>
    );
  });
}
function Counts({ adds, dels }) {
  return <span className="ef-diff__counts"><span className="ef-diff__plus">+{adds}</span><span className="ef-diff__minus">−{dels}</span></span>;
}
function DiffFile({ file, wordLevel, contextLines }) {
  const [open, setOpen] = React.useState(file.defaultOpen !== false);
  const r = React.useMemo(() => file.lines ? legacy(file.lines) : computeDiff(file.from || '', file.to || '', { wordLevel, contextLines }), [file, wordLevel, contextLines]);
  return (
    <div className="ef-diff__file">
      <button type="button" className="ef-diff__filehead" aria-expanded={open} onClick={() => setOpen(!open)}>
        <span className={`ef-diff__filechev${open ? ' ef-diff__filechev--open' : ''}`}><Icon name="chevron-right" size={12} /></span>
        <span style={{ flex: 1, minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis' }}>{file.name}</span>
        <Counts adds={r.adds} dels={r.dels} />
      </button>
      {open ? <div className="ef-diff__scroll"><Rows rows={r.rows} /></div> : null}
    </div>
  );
}
function legacy(lines) {
  let oldNo = 0, newNo = 0, adds = 0, dels = 0;
  const rows = lines.map(l => {
    const t = l.type || 'ctx';
    if (t !== 'add') oldNo++;
    if (t !== 'del') newNo++;
    if (t === 'add') adds++;
    if (t === 'del') dels++;
    return { type: t, text: l.text, oldNo, newNo };
  });
  return { rows, adds, dels };
}
export function Diff({ title, lines, from, to, files, wordLevel = true, contextLines = 3, maxHeight, style, className, ...rest }) {
  injectEfCss('ef-css-diff', CSS);
  const single = React.useMemo(() => {
    if (files) return null;
    if (lines) return legacy(lines);
    return computeDiff(from || '', to || '', { wordLevel, contextLines: from !== undefined ? contextLines : null });
  }, [lines, from, to, files, wordLevel, contextLines]);
  return (
    <div {...rest} className={`ef-diff${className ? ' ' + className : ''}`} style={style}>
      {title && single ? (
        <div className="ef-diff__head">{title}<Counts adds={single.adds} dels={single.dels} /></div>
      ) : null}
      {files ? files.map((f, i) => <DiffFile key={f.name || i} file={f} wordLevel={wordLevel} contextLines={contextLines} />) : (
        <div className="ef-diff__scroll" style={maxHeight ? { maxHeight } : null}><Rows rows={single.rows} /></div>
      )}
    </div>
  );
}
