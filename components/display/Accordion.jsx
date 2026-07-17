import React from 'react';
import { Icon } from '../icons/Icon.jsx';
import { injectEfCss } from '../forms/Button.jsx';
const CSS = `
.ef-acc{display:flex;flex-direction:column}
.ef-acc__item{border-bottom:1px solid var(--border-default)}
.ef-acc__item:first-child{border-top:1px solid var(--border-default)}
.ef-acc__head{display:flex;align-items:center;gap:10px;width:100%;padding:14px 2px;border:none;background:none;cursor:pointer;text-align:left;font-family:var(--font-sans);font-size:var(--text-md);font-weight:var(--weight-semibold);color:var(--text-primary)}
.ef-acc__head:hover{color:var(--brand-700)}
.ef-acc__head:focus-visible{outline:none;box-shadow:var(--focus-ring);border-radius:var(--radius-sm)}
.ef-acc__chev{margin-left:auto;color:var(--text-muted);display:inline-flex;transition:transform var(--dur-med) var(--ease-out)}
.ef-acc__item--open .ef-acc__chev{transform:rotate(180deg)}
.ef-acc__body{display:grid;grid-template-rows:0fr;transition:grid-template-rows var(--dur-slow) var(--ease-out)}
.ef-acc__item--open .ef-acc__body{grid-template-rows:1fr}
.ef-acc__inner{overflow:hidden}
.ef-acc__content{padding:0 2px 16px;font-size:var(--text-md);line-height:var(--leading-relaxed);color:var(--text-secondary);max-width:640px}
`;
export function Accordion({ items, multiple, defaultOpen, style, className }) {
  injectEfCss('ef-css-acc', CSS);
  const [open, setOpen] = React.useState(defaultOpen || []);
  const toggle = id => setOpen(o => o.includes(id) ? o.filter(x => x !== id) : multiple ? [...o, id] : [id]);
  return (
    <div className={`ef-acc${className ? ' ' + className : ''}`} style={style}>
      {items.map(it => (
        <div key={it.id} className={`ef-acc__item${open.includes(it.id) ? ' ef-acc__item--open' : ''}`}>
          <button className="ef-acc__head" aria-expanded={open.includes(it.id)} onClick={() => toggle(it.id)}>
            {it.title}
            <span className="ef-acc__chev"><Icon name="chevron-down" size={16} /></span>
          </button>
          <div className="ef-acc__body"><div className="ef-acc__inner"><div className="ef-acc__content">{it.content}</div></div></div>
        </div>
      ))}
    </div>
  );
}
