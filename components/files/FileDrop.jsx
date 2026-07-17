import React from 'react';
import { Icon } from '../icons/Icon.jsx';
import { injectEfCss } from '../forms/Button.jsx';
const CSS = `
.ef-filedrop{display:flex;flex-direction:column;align-items:center;justify-content:center;gap:6px;padding:32px 24px;border:1px dashed var(--sand-300);border-radius:var(--radius-md);background:var(--surface-card);cursor:pointer;text-align:center;transition:border-color var(--dur-fast) var(--ease-out),background var(--dur-fast) var(--ease-out)}
.ef-filedrop:hover,.ef-filedrop--over{border-color:var(--sand-950);background:var(--surface-subtle)}
.ef-filedrop:focus-visible{outline:none;box-shadow:var(--focus-ring)}
.ef-filedrop__icon{color:var(--sand-400)}
.ef-filedrop--over .ef-filedrop__icon,.ef-filedrop:hover .ef-filedrop__icon{color:var(--text-primary)}
.ef-filedrop__title{font-size:var(--text-md);font-weight:var(--weight-semibold);color:var(--text-primary)}
.ef-filedrop__title u{text-decoration-color:var(--caramel-500);text-underline-offset:3px}
.ef-filedrop__hint{font-size:var(--text-xs);color:var(--text-muted)}
`;
export function FileDrop({ onFiles, accept, multiple = true, title, hint, style, className }) {
  injectEfCss('ef-css-filedrop', CSS);
  const [over, setOver] = React.useState(false);
  const inputRef = React.useRef(null);
  const handle = files => { if (onFiles && files && files.length) onFiles([...files]); };
  return (
    <div role="button" tabIndex={0} className={`ef-filedrop${over ? ' ef-filedrop--over' : ''}${className ? ' ' + className : ''}`} style={style}
      onClick={() => inputRef.current && inputRef.current.click()}
      onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); inputRef.current.click(); } }}
      onDragOver={e => { e.preventDefault(); setOver(true); }}
      onDragLeave={() => setOver(false)}
      onDrop={e => { e.preventDefault(); setOver(false); handle(e.dataTransfer.files); }}>
      <span className="ef-filedrop__icon"><Icon name="upload" size={22} /></span>
      <span className="ef-filedrop__title">{title || <span>Drop files here or <u>browse</u></span>}</span>
      {hint ? <span className="ef-filedrop__hint">{hint}</span> : null}
      <input ref={inputRef} type="file" accept={accept} multiple={multiple} style={{ display: 'none' }} onChange={e => { handle(e.target.files); e.target.value = ''; }} />
    </div>
  );
}
