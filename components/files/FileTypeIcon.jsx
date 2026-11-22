'use client';
import React from 'react';
import { Icon } from '../icons/Icon.jsx';
import { injectEfCss, styleRef } from '../runtime/runtime.jsx';
const CSS = `
.ef-filetype{position:relative;display:inline-flex;align-items:center;justify-content:center;flex:none;background:var(--surface-card);border:1px solid var(--border-strong);border-radius:var(--radius-xs-plus);color:var(--text-secondary)}
.ef-filetype__ext{position:absolute;bottom:-5px;left:50%;transform:translateX(-50%);font-family:var(--font-mono);font-size:8px;font-weight:700;letter-spacing:.04em;padding:1px var(--space-1);border-radius:var(--radius-xs);text-transform:uppercase;line-height:1.3}
`;
// Every fill carries the label colour that clears 4.5:1 on it in BOTH themes —
// no single label colour does (white fails on brand-500/sand-500 in light, dark
// ink fails on the fixed dark fills in dark). Status fills flip via the
// *-contrast tokens; fixed fills pair with a fixed label.
const T = { flipD: 'var(--status-danger-on-solid)', flipS: 'var(--status-success-on-solid)', flipW: 'var(--status-warning-on-solid)', white: 'var(--text-on-media)', ink: 'var(--brand-950)' };
const KIND = {
  pdf: { icon: 'file-text', color: 'var(--status-danger-text)', label: T.flipD },
  doc: { icon: 'file-text', color: 'var(--brand-700)', label: T.white }, docx: { icon: 'file-text', color: 'var(--brand-700)', label: T.white }, txt: { icon: 'file-text', color: 'var(--sand-600)', label: T.white }, md: { icon: 'file-text', color: 'var(--sand-600)', label: T.white },
  csv: { icon: 'table', color: 'var(--status-success-text)', label: T.flipS }, xls: { icon: 'table', color: 'var(--status-success-text)', label: T.flipS }, xlsx: { icon: 'table', color: 'var(--status-success-text)', label: T.flipS },
  png: { icon: 'image', color: 'var(--brand-500)', label: T.ink }, jpg: { icon: 'image', color: 'var(--brand-500)', label: T.ink }, svg: { icon: 'image', color: 'var(--brand-500)', label: T.ink }, gif: { icon: 'image', color: 'var(--brand-500)', label: T.ink },
  mp4: { icon: 'video', color: 'var(--status-warning-text)', label: T.flipW }, mov: { icon: 'video', color: 'var(--status-warning-text)', label: T.flipW },
  mp3: { icon: 'mic', color: 'var(--status-warning-text)', label: T.flipW }, wav: { icon: 'mic', color: 'var(--status-warning-text)', label: T.flipW },
  zip: { icon: 'archive', color: 'var(--sand-600)', label: T.white }, json: { icon: 'code', color: 'var(--sand-800)', label: T.white }, js: { icon: 'code', color: 'var(--status-warning-text)', label: T.flipW }, ts: { icon: 'code', color: 'var(--brand-700)', label: T.white },
};
export function FileTypeIcon({ ext = 'txt', size = 40, showExt = true, style, className, ...rest }) {
  injectEfCss('ef-css-filetype', CSS);
  const k = KIND[ext.toLowerCase()] || { icon: 'file', color: 'var(--sand-500)', label: T.ink };
  return (
    <span {...rest} className={`ef-filetype${className ? ' ' + className : ''}`} ref={styleRef({ width: size, height: size })} style={style} title={'.' + ext}>
      <Icon name={k.icon} size={Math.round(size * 0.45)} />
      {showExt ? <span className="ef-filetype__ext" ref={styleRef({ background: k.color, color: k.label })}>{ext}</span> : null}
    </span>
  );
}
