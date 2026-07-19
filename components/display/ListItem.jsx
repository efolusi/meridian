import React from 'react';
import { Icon } from '../icons/Icon.jsx';
import { injectEfCss } from '../forms/Button.jsx';
const CSS = `
.ef-listitem{display:flex;align-items:center;gap:12px;padding:10px 12px;border-radius:var(--radius-sm);text-align:left;width:100%;border:none;background:none;font-family:var(--font-sans);color:var(--text-primary)}
button.ef-listitem,a.ef-listitem{cursor:pointer;transition:background var(--dur-fast) var(--ease-out);text-decoration:none}
button.ef-listitem:hover,a.ef-listitem:hover{background:var(--surface-sunken)}
button.ef-listitem:focus-visible{outline:none;box-shadow:var(--focus-ring)}
.ef-listitem__media{display:inline-flex;align-items:center;justify-content:center;flex:none;width:32px;height:32px;border-radius:var(--radius-sm);background:var(--surface-sunken);color:var(--text-secondary)}
.ef-listitem__title{font-size:var(--text-md);font-weight:var(--weight-medium);line-height:1.35}
.ef-listitem__desc{font-size:var(--text-sm);color:var(--text-muted);line-height:1.4;margin-top:1px}
.ef-listitem__trailing{margin-left:auto;flex:none;display:inline-flex;align-items:center;gap:8px;color:var(--text-muted)}
`;
export function ListItem({ icon, media, title, description, trailing, chevron, onClick, href, style, className, ...rest }) {
  injectEfCss('ef-css-listitem', CSS);
  const Tag = href ? 'a' : onClick ? 'button' : 'div';
  return (
    <Tag {...rest} href={href} onClick={onClick} className={`ef-listitem${className ? ' ' + className : ''}`} style={style}>
      {media ? media : icon ? <span className="ef-listitem__media"><Icon name={icon} size={16} /></span> : null}
      <span style={{ minWidth: 0, flex: 1 }}>
        <span className="ef-listitem__title" style={{ display: 'block' }}>{title}</span>
        {description ? <span className="ef-listitem__desc" style={{ display: 'block' }}>{description}</span> : null}
      </span>
      <span className="ef-listitem__trailing">
        {trailing}
        {chevron ? <Icon name="chevron-right" size={15} /> : null}
      </span>
    </Tag>
  );
}
