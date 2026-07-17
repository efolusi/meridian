import React from 'react';
import { injectEfCss } from '../forms/Button.jsx';
import { Icon } from '../icons/Icon.jsx';
const CSS = `
.ef-sourcecard{display:flex;flex-direction:column;gap:6px;padding:12px;border:1px solid var(--border-default);border-radius:var(--radius-md);background:var(--surface-card);text-decoration:none;color:inherit;transition:border-color var(--dur-fast) var(--ease-out),background var(--dur-fast) var(--ease-out)}
a.ef-sourcecard{cursor:pointer}
a.ef-sourcecard:hover{border-color:var(--border-strong);background:var(--surface-subtle)}
a.ef-sourcecard:focus-visible{outline:none;box-shadow:var(--focus-ring)}
.ef-sourcecard--plain{border-color:transparent;background:transparent;padding:8px 10px}
.ef-sourcecard__thumb{width:100%;aspect-ratio:16/9;border-radius:var(--radius-sm);object-fit:cover;background:var(--surface-sunken);margin-bottom:4px}
.ef-sourcecard__domain{display:inline-flex;align-items:center;gap:6px;font-size:11.5px;color:var(--text-muted)}
.ef-sourcecard__domain img{width:14px;height:14px;border-radius:var(--radius-full)}
.ef-sourcecard__title{font-size:13.5px;font-weight:var(--weight-semibold);color:var(--text-primary);line-height:1.4}
.ef-sourcecard__desc{font-size:12.5px;color:var(--text-muted);line-height:1.55;display:-webkit-box;-webkit-line-clamp:3;-webkit-box-orient:vertical;overflow:hidden}
`;
export function SourceCard({ href, title, description, domain, favicon, icon = 'globe', thumbnail, variant = 'card', onClick, style, className }) {
  injectEfCss('ef-css-sourcecard', CSS);
  const Tag = href || onClick ? 'a' : 'div';
  return (
    <Tag className={`ef-sourcecard${variant === 'plain' ? ' ef-sourcecard--plain' : ''}${className ? ' ' + className : ''}`} style={style}
      href={href} target={href ? '_blank' : undefined} rel={href ? 'noreferrer noopener' : undefined} onClick={onClick}>
      {thumbnail ? <img className="ef-sourcecard__thumb" src={thumbnail} alt="" /> : null}
      {domain ? (
        <span className="ef-sourcecard__domain">
          {favicon ? <img src={favicon} alt="" /> : <Icon name={icon} size={13} />}
          {domain}
        </span>
      ) : null}
      <span className="ef-sourcecard__title">{title}</span>
      {description ? <span className="ef-sourcecard__desc">{description}</span> : null}
    </Tag>
  );
}
