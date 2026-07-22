import React from 'react';
import { injectEfCss } from '../forms/Button.jsx';
const CSS = `
.ef-avatar{position:relative;display:inline-flex;align-items:center;justify-content:center;flex:none;border-radius:var(--radius-full);background:var(--peach-200);color:var(--cocoa-700);font-weight:var(--weight-semibold);overflow:hidden;user-select:none}
.ef-avatar img{width:100%;height:100%;object-fit:cover}
.ef-avatar-group{display:inline-flex}
.ef-avatar-group .ef-avatar{border:2px solid var(--surface-card)}
.ef-avatar-group .ef-avatar+.ef-avatar{margin-left:-8px}
`;
const TONES = [
  ['var(--peach-200)', 'var(--cocoa-700)'],
  ['var(--brand-100)', 'var(--brand-800)'],
  ['var(--sand-200)', 'var(--sand-800)'],
  ['var(--cream-50)', 'var(--caramel-500)'],
  ['var(--success-100)', 'var(--success-600)'],
];
export function Avatar({ name = '', src, size = 32, style, className, ...rest }) {
  injectEfCss('ef-css-avatar', CSS);
  // A dead avatar URL falls back to the initials instead of a broken image.
  // The reset must be an effect: remounting the img would not clear state that
  // lives up here in Avatar.
  const [broken, setBroken] = React.useState(false);
  React.useEffect(() => { setBroken(false); }, [src]);
  const showImg = !!src && !broken;
  const initials = name.trim().split(/\s+/).map(w => w[0]).slice(0, 2).join('').toUpperCase();
  let h = 0; for (let i = 0; i < name.length; i++) h = (h * 31 + name.charCodeAt(i)) >>> 0;
  const [bg, fg] = TONES[h % TONES.length];
  return (
    <span className={`ef-avatar${className ? ' ' + className : ''}`} title={name || undefined} style={{ width: size, height: size, fontSize: Math.round(size * 0.38), background: showImg ? 'var(--sand-100)' : bg, color: fg, ...style }} {...rest}>
      {showImg ? <img src={src} alt={name} onError={() => setBroken(true)} /> : initials || '•'}
    </span>
  );
}
export function AvatarGroup({ children, style, className, ...rest }) {
  injectEfCss('ef-css-avatar', CSS);
  return <span {...rest} className={`ef-avatar-group${className ? ' ' + className : ''}`} style={style}>{children}</span>;
}
