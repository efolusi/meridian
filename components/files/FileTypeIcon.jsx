import React from 'react';
import { Icon } from '../icons/Icon.jsx';
import { injectEfCss } from '../forms/Button.jsx';
const CSS = `
.ef-filetype{position:relative;display:inline-flex;align-items:center;justify-content:center;flex:none;background:var(--surface-card);border:1px solid var(--border-strong);border-radius:6px;color:var(--text-secondary)}
.ef-filetype__ext{position:absolute;bottom:-5px;left:50%;transform:translateX(-50%);font-family:var(--font-mono);font-size:8px;font-weight:700;letter-spacing:.04em;padding:1px 4px;border-radius:3px;color:#fff;text-transform:uppercase;line-height:1.3}
`;
const KIND = {
  pdf: { icon: 'file-text', color: 'var(--danger-600)' },
  doc: { icon: 'file-text', color: 'var(--brand-700)' }, docx: { icon: 'file-text', color: 'var(--brand-700)' }, txt: { icon: 'file-text', color: 'var(--sand-600)' }, md: { icon: 'file-text', color: 'var(--sand-600)' },
  csv: { icon: 'table', color: 'var(--success-600)' }, xls: { icon: 'table', color: 'var(--success-600)' }, xlsx: { icon: 'table', color: 'var(--success-600)' },
  png: { icon: 'image', color: 'var(--brand-500)' }, jpg: { icon: 'image', color: 'var(--brand-500)' }, svg: { icon: 'image', color: 'var(--brand-500)' }, gif: { icon: 'image', color: 'var(--brand-500)' },
  mp4: { icon: 'video', color: 'var(--warning-600)' }, mov: { icon: 'video', color: 'var(--warning-600)' },
  mp3: { icon: 'mic', color: 'var(--warning-600)' }, wav: { icon: 'mic', color: 'var(--warning-600)' },
  zip: { icon: 'archive', color: 'var(--sand-600)' }, json: { icon: 'code', color: 'var(--sand-800)' }, js: { icon: 'code', color: 'var(--warning-600)' }, ts: { icon: 'code', color: 'var(--brand-700)' },
};
export function FileTypeIcon({ ext = 'txt', size = 40, showExt = true, style, className, ...rest }) {
  injectEfCss('ef-css-filetype', CSS);
  const k = KIND[ext.toLowerCase()] || { icon: 'file', color: 'var(--sand-500)' };
  return (
    <span {...rest} className={`ef-filetype${className ? ' ' + className : ''}`} style={{ width: size, height: size, ...style }} title={'.' + ext}>
      <Icon name={k.icon} size={Math.round(size * 0.45)} />
      {showExt ? <span className="ef-filetype__ext" style={{ background: k.color }}>{ext}</span> : null}
    </span>
  );
}
