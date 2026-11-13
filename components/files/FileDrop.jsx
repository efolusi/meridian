import React from 'react';
import { Icon } from '../icons/Icon.jsx';
import { injectEfCss } from '../forms/Button.jsx';
const CSS = `
.ef-filedrop{display:flex;flex-direction:column;align-items:center;justify-content:center;gap:6px;padding:32px 24px;border:1px dashed var(--sand-300);border-radius:var(--radius-md);background:var(--surface-card);cursor:pointer;text-align:center;transition:border-color var(--dur-fast) var(--ease-out),background var(--dur-fast) var(--ease-out)}
.ef-filedrop:hover,.ef-filedrop--over{border-color:var(--accent);background:var(--surface-subtle)}
.ef-filedrop:focus-visible{outline:none;box-shadow:var(--focus-ring)}
.ef-filedrop__icon{color:var(--sand-400)}
.ef-filedrop--over .ef-filedrop__icon,.ef-filedrop:hover .ef-filedrop__icon{color:var(--text-primary)}
.ef-filedrop__title{font-size:var(--text-md);font-weight:var(--weight-semibold);color:var(--text-primary)}
.ef-filedrop__action{color:var(--text-link);font-weight:var(--weight-semibold)}
.ef-filedrop__hint{font-size:var(--text-xs);color:var(--text-muted)}
`;
// The file picker enforces accept and multiple; a drop does not, so apply the
// same rules here. Matches the accept syntax: .ext, type/*, type/subtype.
function accepts(file, accept) {
  if (!accept) return true;
  const name = (file.name || '').toLowerCase();
  const type = (file.type || '').toLowerCase();
  return accept.split(',').map(t => t.trim().toLowerCase()).filter(Boolean).some(t =>
    t.startsWith('.') ? name.endsWith(t) : t.endsWith('/*') ? type.startsWith(t.slice(0, -1)) : type === t);
}
export function FileDrop({ onFiles, onReject, accept, maxSize, multiple = true, title, hint, style, className, ...rest }) {
  injectEfCss('ef-css-filedrop', CSS);
  const [over, setOver] = React.useState(false);
  const inputRef = React.useRef(null);
  // Every file ends up in onFiles or in one onReject(files, reason) call;
  // reasons are checked in order: 'type', then 'size', then 'count'.
  const handle = files => {
    if (!files) return;
    const all = [...files];
    const wrongType = all.filter(f => !accepts(f, accept));
    const typed = all.filter(f => accepts(f, accept));
    const tooBig = maxSize != null ? typed.filter(f => f.size > maxSize) : [];
    const sized = typed.filter(f => !tooBig.includes(f));
    const ok = multiple ? sized : sized.slice(0, 1);
    const extra = sized.slice(ok.length);
    if (onReject) {
      if (wrongType.length) onReject(wrongType, 'type');
      if (tooBig.length) onReject(tooBig, 'size');
      if (extra.length) onReject(extra, 'count');
    }
    if (onFiles && ok.length) onFiles(ok);
  };
  return (
    <div {...rest} role="button" tabIndex={0} className={`ef-filedrop${over ? ' ef-filedrop--over' : ''}${className ? ' ' + className : ''}`} style={style}
      onClick={() => inputRef.current && inputRef.current.click()}
      onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); inputRef.current.click(); } }}
      onDragOver={e => { e.preventDefault(); setOver(true); }}
      onDragLeave={() => setOver(false)}
      onDrop={e => { e.preventDefault(); setOver(false); handle(e.dataTransfer.files); }}>
      <span className="ef-filedrop__icon"><Icon name="upload" size={22} /></span>
      <span className="ef-filedrop__title">{title || <span>Drop files here or <span className="ef-filedrop__action">browse</span></span>}</span>
      {hint ? <span className="ef-filedrop__hint">{hint}</span> : null}
      <input ref={inputRef} type="file" accept={accept} multiple={multiple} style={{ display: 'none' }} onChange={e => { handle(e.target.files); e.target.value = ''; }} />
    </div>
  );
}
