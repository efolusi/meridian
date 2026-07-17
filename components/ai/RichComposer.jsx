import React from 'react';
import { injectEfCss } from '../forms/Button.jsx';
import { Icon } from '../icons/Icon.jsx';
const CSS = `
.ef-richcomposer{position:relative;border:1px solid var(--border-strong);border-radius:var(--radius-lg,14px);background:var(--surface-card);transition:border-color var(--dur-fast) var(--ease-out),box-shadow var(--dur-fast) var(--ease-out)}
.ef-richcomposer:focus-within{border-color:var(--text-muted);box-shadow:var(--focus-ring)}
.ef-richcomposer__input{min-height:44px;max-height:200px;overflow-y:auto;padding:12px 14px 4px;font-family:var(--font-sans);font-size:14px;line-height:1.6;color:var(--text-primary);outline:none;white-space:pre-wrap;word-break:break-word}
.ef-richcomposer__input:empty::before{content:attr(data-placeholder);color:var(--text-muted);pointer-events:none}
.ef-richcomposer__chip{display:inline-flex;align-items:center;gap:4px;margin:0 1px;padding:1px 7px;border-radius:var(--radius-sm);background:var(--accent-subtle);border:1px solid var(--accent-subtle-border);color:var(--text-primary);font-size:13px;white-space:nowrap;user-select:none}
.ef-richcomposer__bar{display:flex;align-items:center;gap:8px;padding:8px 10px 10px}
.ef-richcomposer__hint{font-size:12px;color:var(--text-muted)}
.ef-richcomposer__send{margin-left:auto;display:inline-flex;align-items:center;justify-content:center;width:32px;height:32px;border:none;border-radius:var(--radius-full);background:var(--accent);color:var(--accent-contrast);cursor:pointer;transition:background var(--dur-fast) var(--ease-out),opacity var(--dur-fast) var(--ease-out)}
.ef-richcomposer__send:hover{background:var(--accent-hover)}
.ef-richcomposer__send:disabled{opacity:.35;cursor:default}
.ef-richcomposer__send:focus-visible{outline:none;box-shadow:var(--focus-ring)}
.ef-richcomposer__pop{position:absolute;bottom:calc(100% + 6px);left:0;right:0;z-index:40;max-height:260px;overflow-y:auto;padding:4px;border:1px solid var(--border-default);border-radius:var(--radius-md);background:var(--surface-card);box-shadow:var(--shadow-lg,0 8px 24px rgba(0,0,0,.12))}
.ef-richcomposer__group{padding:7px 10px 3px;font-size:11px;font-weight:var(--weight-semibold);letter-spacing:.04em;text-transform:uppercase;color:var(--text-muted)}
.ef-richcomposer__item{display:flex;align-items:center;gap:9px;width:100%;padding:7px 10px;border:none;background:none;cursor:pointer;text-align:left;border-radius:var(--radius-sm);font-family:var(--font-sans);font-size:13.5px;color:var(--text-primary)}
.ef-richcomposer__item--hi{background:var(--surface-sunken)}
.ef-richcomposer__itemicon{display:inline-flex;flex:none;color:var(--text-muted)}
.ef-richcomposer__itemdesc{margin-left:auto;font-size:12px;color:var(--text-muted);white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.ef-richcomposer__empty{padding:8px 10px;font-size:13px;color:var(--text-muted)}
`;
function findTrigger(root) {
  const s = window.getSelection();
  if (!s || !s.rangeCount || !s.isCollapsed) return null;
  const node = s.anchorNode;
  if (!node || node.nodeType !== 3 || !root.contains(node)) return null;
  const before = node.textContent.slice(0, s.anchorOffset);
  const m = before.match(/(^|\s)([@\/])([\w./-]*)$/);
  if (!m) return null;
  return { node, offset: s.anchorOffset, char: m[2], query: m[3] };
}
export function RichComposer({ placeholder = 'Message… use @ to mention, / for commands', mentions = [], commands = [], hint, actions, disabled, autoFocus, onSubmit, onCommand, style, className }) {
  injectEfCss('ef-css-richcomposer', CSS);
  const edRef = React.useRef(null);
  const [pop, setPop] = React.useState(null);
  const [empty, setEmpty] = React.useState(true);
  const items = React.useMemo(() => {
    if (!pop) return [];
    const src = pop.char === '@' ? mentions : commands;
    const q = pop.query.toLowerCase();
    return src.filter(it => !q || it.label.toLowerCase().includes(q) || (it.keywords || []).some(k => k.toLowerCase().includes(q)));
  }, [pop, mentions, commands]);
  const refresh = () => {
    const ed = edRef.current;
    if (!ed) return;
    setEmpty(ed.textContent.trim().length === 0 && !ed.querySelector('[data-chip-id]'));
    const t = findTrigger(ed);
    setPop(t ? { char: t.char, query: t.query, hi: 0 } : null);
  };
  const removeTrigger = () => {
    const ed = edRef.current;
    const t = findTrigger(ed);
    if (!t) return null;
    const range = document.createRange();
    range.setStart(t.node, t.offset - t.query.length - 1);
    range.setEnd(t.node, t.offset);
    range.deleteContents();
    return range;
  };
  const pick = it => {
    const ed = edRef.current;
    if (!ed || !pop) return;
    const range = removeTrigger();
    if (pop.char === '/') {
      setPop(null); refresh();
      if (onCommand) onCommand(it);
      return;
    }
    if (!range) return;
    const chip = document.createElement('span');
    chip.className = 'ef-richcomposer__chip';
    chip.contentEditable = 'false';
    chip.setAttribute('data-chip-id', it.id);
    chip.textContent = '@' + it.label;
    range.insertNode(chip);
    const space = document.createTextNode('\u00A0');
    chip.after(space);
    const sel = window.getSelection();
    const r = document.createRange();
    r.setStartAfter(space); r.collapse(true);
    sel.removeAllRanges(); sel.addRange(r);
    setPop(null);
    refresh();
  };
  const serialize = () => {
    const ed = edRef.current;
    const found = [];
    let text = '';
    const walk = n => {
      n.childNodes.forEach(c => {
        if (c.nodeType === 3) text += c.textContent;
        else if (c.getAttribute && c.getAttribute('data-chip-id')) { found.push({ id: c.getAttribute('data-chip-id'), label: c.textContent.replace(/^@/, '') }); text += c.textContent; }
        else if (c.nodeName === 'BR') text += '\n';
        else { if (text && (c.nodeName === 'DIV' || c.nodeName === 'P')) text += '\n'; walk(c); }
      });
    };
    walk(ed);
    return { text: text.replace(/\u00A0/g, ' ').trim(), mentions: found };
  };
  const submit = () => {
    const v = serialize();
    if (!v.text) return;
    if (onSubmit) onSubmit(v);
    edRef.current.innerHTML = '';
    setEmpty(true); setPop(null);
    edRef.current.focus();
  };
  const onKey = e => {
    if (pop && items.length) {
      if (e.key === 'ArrowDown') { e.preventDefault(); setPop(p => ({ ...p, hi: Math.min(items.length - 1, p.hi + 1) })); return; }
      if (e.key === 'ArrowUp') { e.preventDefault(); setPop(p => ({ ...p, hi: Math.max(0, p.hi - 1) })); return; }
      if (e.key === 'Enter' || e.key === 'Tab') { e.preventDefault(); pick(items[pop.hi]); return; }
      if (e.key === 'Escape') { e.preventDefault(); setPop(null); return; }
    }
    if (e.key === 'Enter' && !e.shiftKey && !e.nativeEvent.isComposing) { e.preventDefault(); submit(); }
  };
  React.useEffect(() => { if (autoFocus && edRef.current) edRef.current.focus(); }, [autoFocus]);
  let lastGroup = null;
  return (
    <div className={`ef-richcomposer${className ? ' ' + className : ''}`} style={style}>
      {pop ? (
        <div className="ef-richcomposer__pop" role="listbox">
          {!items.length ? <div className="ef-richcomposer__empty">No matches for {pop.char}{pop.query}</div> : null}
          {items.map((it, i) => {
            const head = it.group && it.group !== lastGroup ? <div key={'g' + it.group} className="ef-richcomposer__group">{it.group}</div> : null;
            lastGroup = it.group;
            return (
              <React.Fragment key={it.id}>
                {head}
                <button type="button" role="option" aria-selected={i === pop.hi} className={`ef-richcomposer__item${i === pop.hi ? ' ef-richcomposer__item--hi' : ''}`} onMouseEnter={() => setPop(p => ({ ...p, hi: i }))} onMouseDown={e => e.preventDefault()} onClick={() => pick(it)}>
                  {it.icon ? <span className="ef-richcomposer__itemicon"><Icon name={it.icon} size={14} /></span> : null}
                  <span>{pop.char === '/' ? '/' + it.label : it.label}</span>
                  {it.description ? <span className="ef-richcomposer__itemdesc">{it.description}</span> : null}
                </button>
              </React.Fragment>
            );
          })}
        </div>
      ) : null}
      <div ref={edRef} className="ef-richcomposer__input" contentEditable={!disabled} suppressContentEditableWarning data-placeholder={placeholder}
        role="textbox" aria-multiline="true" spellCheck={false}
        onInput={refresh} onKeyUp={refresh} onClick={refresh} onKeyDown={onKey} onBlur={() => setTimeout(() => setPop(null), 120)}></div>
      <div className="ef-richcomposer__bar">
        {actions}
        {hint ? <span className="ef-richcomposer__hint">{hint}</span> : null}
        <button type="button" className="ef-richcomposer__send" aria-label="Send" disabled={empty || disabled} onClick={submit}><Icon name="send" size={14} /></button>
      </div>
    </div>
  );
}
