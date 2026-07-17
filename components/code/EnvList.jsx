import React from 'react';
import { injectEfCss } from '../forms/Button.jsx';
import { Icon } from '../icons/Icon.jsx';
const CSS = `
.ef-env{border:1px solid var(--border-default);border-radius:var(--radius-md);background:var(--surface-card);font-family:var(--font-sans)}
.ef-env__head{display:flex;align-items:center;gap:9px;padding:10px 14px}
.ef-env__glyph{display:inline-flex;color:var(--text-muted)}
.ef-env__title{flex:1;min-width:0;font-size:13.5px;font-weight:var(--weight-semibold);color:var(--text-primary)}
.ef-env__btn{display:inline-flex;align-items:center;justify-content:center;width:28px;height:28px;border:none;background:none;cursor:pointer;color:var(--text-muted);border-radius:var(--radius-sm);transition:color var(--dur-fast) var(--ease-out),background var(--dur-fast) var(--ease-out)}
.ef-env__btn:hover{color:var(--text-primary);background:var(--surface-subtle)}
.ef-env__btn:focus-visible{outline:none;box-shadow:var(--focus-ring)}
.ef-env__btn--done{color:var(--success-600)}
.ef-env__list{padding:0 6px 6px}
.ef-env__row{display:flex;align-items:center;gap:12px;padding:5px 8px;border-radius:var(--radius-sm)}
.ef-env__row:hover{background:var(--surface-subtle)}
.ef-env__name{flex:none;font-family:var(--font-mono);font-size:12.5px;color:var(--text-muted)}
.ef-env__val{flex:1;min-width:0;margin-left:auto;text-align:right;font-family:var(--font-mono);font-size:12.5px;color:var(--text-primary);white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.ef-env__row .ef-env__btn{opacity:0;width:24px;height:24px}
.ef-env__row:hover .ef-env__btn,.ef-env__row .ef-env__btn:focus-visible,.ef-env__row .ef-env__btn--done{opacity:1}
`;
const MASK = '••••••••';
function Row({ v, visible }) {
  const [copied, setCopied] = React.useState(false);
  const masked = v.secret && !visible;
  const copy = () => {
    if (navigator.clipboard) navigator.clipboard.writeText(v.value).catch(() => {});
    setCopied(true); setTimeout(() => setCopied(false), 1200);
  };
  return (
    <div className="ef-env__row">
      <span className="ef-env__name">{v.name}</span>
      <span className="ef-env__val">{masked ? MASK : v.value}</span>
      <button type="button" className={`ef-env__btn${copied ? ' ef-env__btn--done' : ''}`} aria-label={'Copy ' + v.name} onClick={copy}><Icon name={copied ? 'check' : 'copy'} size={13} /></button>
    </div>
  );
}
export function EnvList({ title = 'Environment', vars = [], defaultVisible = false, style, className }) {
  injectEfCss('ef-css-env', CSS);
  const [visible, setVisible] = React.useState(!!defaultVisible);
  const hasSecrets = vars.some(v => v.secret);
  return (
    <div className={`ef-env${className ? ' ' + className : ''}`} style={style}>
      <div className="ef-env__head">
        <span className="ef-env__glyph"><Icon name="key" size={14} /></span>
        <span className="ef-env__title">{title}</span>
        {hasSecrets ? <button type="button" className="ef-env__btn" aria-label={visible ? 'Hide secrets' : 'Reveal secrets'} aria-pressed={visible} onClick={() => setVisible(!visible)}><Icon name={visible ? 'eye-off' : 'eye'} size={14} /></button> : null}
      </div>
      <div className="ef-env__list">
        {vars.map((v, i) => <Row key={i} v={v} visible={visible} />)}
      </div>
    </div>
  );
}
