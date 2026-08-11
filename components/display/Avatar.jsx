import React from 'react';
import { injectEfCss } from '../forms/Button.jsx';

const CSS = `
.ef-avatar{position:relative;display:inline-flex;align-items:center;justify-content:center;flex:none;width:32px;height:32px;border-radius:var(--radius-full);background:var(--peach-200);color:var(--cocoa-700);font-size:12px;font-weight:var(--weight-semibold);overflow:hidden;user-select:none}
.ef-avatar--sm{width:24px;height:24px;font-size:9px}.ef-avatar--lg{width:40px;height:40px;font-size:15px}
.ef-avatar__image{position:absolute;inset:0;width:100%;height:100%;object-fit:cover}
.ef-avatar__fallback{display:flex;width:100%;height:100%;align-items:center;justify-content:center}
.ef-avatar__badge{position:absolute;inset-inline-end:0;inset-block-end:0;z-index:1;display:flex;width:25%;height:25%;min-width:8px;min-height:8px;align-items:center;justify-content:center;border:2px solid var(--surface-card);border-radius:var(--radius-full);background:var(--success-500);color:var(--text-inverse)}
.ef-avatar-group{display:inline-flex}
.ef-avatar-group>.ef-avatar{border:2px solid var(--surface-card)}
.ef-avatar-group>.ef-avatar+.ef-avatar,.ef-avatar-group>.ef-avatar+.ef-avatar-count,.ef-avatar-group>.ef-avatar-count+.ef-avatar{margin-inline-start:-8px}
.ef-avatar-count{position:relative;display:inline-flex;width:32px;height:32px;align-items:center;justify-content:center;flex:none;border:2px solid var(--surface-card);border-radius:var(--radius-full);background:var(--sand-100);color:var(--text-secondary);font-size:11px;font-weight:var(--weight-semibold)}
`;

const TONES = [
  ['var(--peach-200)', 'var(--cocoa-700)'],
  ['var(--brand-100)', 'var(--brand-800)'],
  ['var(--sand-200)', 'var(--sand-800)'],
  ['var(--cream-50)', 'var(--caramel-500)'],
  ['var(--success-100)', 'var(--success-600)'],
];

function classes(...values) {
  return values.filter(Boolean).join(' ');
}

function initialsFor(name) {
  return name.trim().split(/\s+/).map((word) => word[0]).slice(0, 2).join('').toUpperCase();
}

function toneFor(name) {
  let hash = 0;
  for (let index = 0; index < name.length; index += 1) hash = (hash * 31 + name.charCodeAt(index)) >>> 0;
  return TONES[hash % TONES.length];
}

export const Avatar = React.forwardRef(function Avatar({
  name = '', src, size = 'default', children, style, className, ...rest
}, ref) {
  injectEfCss('ef-css-avatar', CSS);
  const numericSize = typeof size === 'number' ? size : null;
  const sizeName = numericSize == null && ['sm', 'lg'].includes(size) ? size : 'default';
  const [background, color] = toneFor(name);
  const legacyContent = src
    ? <><AvatarFallback>{initialsFor(name) || '•'}</AvatarFallback><AvatarImage src={src} alt={name} /></>
    : <AvatarFallback>{initialsFor(name) || '•'}</AvatarFallback>;
  return (
    <span
      {...rest}
      ref={ref}
      data-slot="avatar"
      data-size={sizeName}
      title={name || rest.title}
      className={classes('ef-avatar', sizeName !== 'default' && `ef-avatar--${sizeName}`, className)}
      style={{
        background,
        color,
        ...(numericSize == null ? null : { width: numericSize, height: numericSize, fontSize: Math.round(numericSize * 0.38) }),
        ...style,
      }}
    >
      {children ?? legacyContent}
    </span>
  );
});

export const AvatarImage = React.forwardRef(function AvatarImage({ className, onError, ...rest }, ref) {
  const [failed, setFailed] = React.useState(false);
  React.useEffect(() => setFailed(false), [rest.src]);
  if (failed) return null;
  return (
    <img
      {...rest}
      ref={ref}
      data-slot="avatar-image"
      className={classes('ef-avatar__image', className)}
      onError={(event) => {
        setFailed(true);
        onError?.(event);
      }}
    />
  );
});

export const AvatarFallback = React.forwardRef(function AvatarFallback({ className, ...rest }, ref) {
  return <span {...rest} ref={ref} data-slot="avatar-fallback" className={classes('ef-avatar__fallback', className)} />;
});

export const AvatarBadge = React.forwardRef(function AvatarBadge({ className, ...rest }, ref) {
  return <span {...rest} ref={ref} data-slot="avatar-badge" className={classes('ef-avatar__badge', className)} />;
});

export const AvatarGroup = React.forwardRef(function AvatarGroup({ className, ...rest }, ref) {
  injectEfCss('ef-css-avatar', CSS);
  return <div {...rest} ref={ref} data-slot="avatar-group" className={classes('ef-avatar-group', className)} />;
});

export const AvatarGroupCount = React.forwardRef(function AvatarGroupCount({ className, ...rest }, ref) {
  return <span {...rest} ref={ref} data-slot="avatar-group-count" className={classes('ef-avatar-count', className)} />;
});
