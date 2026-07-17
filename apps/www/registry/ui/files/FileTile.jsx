import React from 'react';
import { Icon } from '../icons/Icon.jsx';
import { IconButton } from '../forms/IconButton.jsx';
import { Progress } from '../feedback/Progress.jsx';
import { injectEfCss } from '../forms/Button.jsx';
const CSS = `
.ef-filetile{display:flex;align-items:center;gap:12px;padding:10px 12px;border:1px solid var(--border-default);border-radius:var(--radius-md);background:var(--surface-card)}
.ef-filetile__icon{display:inline-flex;align-items:center;justify-content:center;width:34px;height:34px;flex:none;border-radius:var(--radius-sm);background:var(--surface-sunken);color:var(--sand-700)}
.ef-filetile__name{font-size:var(--text-sm);font-weight:var(--weight-semibold);color:var(--text-primary);white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.ef-filetile__meta{font-size:var(--text-xs);color:var(--text-muted);margin-top:1px}
.ef-filetile__meta--err{color:var(--danger-600)}
`;
const KIND_ICON = { image: 'image', video: 'video', audio: 'music', code: 'code', archive: 'package', doc: 'file-text' };
const EXT_KIND = { png: 'image', jpg: 'image', jpeg: 'image', gif: 'image', svg: 'image', webp: 'image', mp4: 'video', mov: 'video', webm: 'video', mp3: 'audio', wav: 'audio', flac: 'audio', js: 'code', ts: 'code', py: 'code', json: 'code', zip: 'archive', tar: 'archive', gz: 'archive', pdf: 'doc', doc: 'doc', docx: 'doc', md: 'doc', txt: 'doc', csv: 'doc' };
export function FileTile({ name, size, kind, status, progress, error, onRemove, actions, style, className }) {
  injectEfCss('ef-css-filetile', CSS);
  const ext = (name || '').split('.').pop().toLowerCase();
  const icon = KIND_ICON[kind || EXT_KIND[ext]] || 'file';
  return (
    <div className={`ef-filetile${className ? ' ' + className : ''}`} style={style}>
      <span className="ef-filetile__icon"><Icon name={icon} size={17} /></span>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div className="ef-filetile__name">{name}</div>
        {error ? <div className="ef-filetile__meta ef-filetile__meta--err">{error}</div>
          : progress != null ? <Progress value={progress} style={{ marginTop: 5, maxWidth: 220 }} />
          : <div className="ef-filetile__meta">{[size, status].filter(Boolean).join(' · ')}</div>}
      </div>
      {actions}
      {onRemove ? <IconButton icon="x" label="Remove" size="sm" onClick={onRemove} /> : null}
    </div>
  );
}
