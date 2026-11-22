'use client';
import React from 'react';
import { Icon } from '../icons/Icon.jsx';
import { injectEfCss } from '../runtime/runtime.jsx';
const CSS = `
.ef-btn{display:inline-flex;align-items:center;justify-content:center;gap:var(--space-2);text-decoration:none;border:1px solid transparent;border-radius:var(--radius-sm);font-family:var(--font-sans);font-weight:var(--weight-semibold);cursor:pointer;white-space:nowrap;user-select:none;transition:background var(--dur-fast) var(--ease-enter),border-color var(--dur-fast) var(--ease-enter),color var(--dur-fast) var(--ease-enter),box-shadow var(--dur-fast) var(--ease-enter),transform var(--dur-base) var(--ease-emphasised)}
.ef-btn{line-height:var(--leading-normal)}
.ef-btn--pill{border-radius:var(--radius-full)}
.ef-btn--pill.ef-btn--xs{padding-inline:var(--space-3)}
.ef-btn--pill.ef-btn--sm{padding-inline:var(--space-4)}
.ef-btn--pill.ef-btn--md{padding-inline:var(--space-5)}
.ef-btn--pill.ef-btn--lg{padding-inline:var(--space-6)}
.ef-btn--pill.ef-btn--xl{padding-inline:var(--space-8)}
.ef-btn:hover,.ef-btn:focus,.ef-btn:visited{text-decoration:none}
.ef-btn:focus-visible{outline:none;box-shadow:var(--focus-ring)}
.ef-btn:active{transform:scale(.985)}
.ef-btn:is(:disabled,[aria-disabled="true"],[data-disabled]){opacity:.45;cursor:not-allowed;pointer-events:none}
.ef-btn--sm{height:var(--control-h-sm);padding:0 var(--space-3);font-size:var(--text-sm)}
.ef-btn--md{height:var(--control-h-md);padding:0 var(--space-4);font-size:var(--text-md)}
.ef-btn--lg{height:var(--control-h-lg);padding:0 var(--space-5);font-size:var(--text-lg)}
.ef-btn--xl{height:var(--control-h-xl);padding:0 var(--space-6);font-size:var(--text-lg)}
.ef-btn--xs{height:var(--control-h-xs);padding:0 9px;font-size:var(--text-xs);gap:6px}
.ef-btn--icon,.ef-btn--icon-md{width:var(--control-h-md);height:var(--control-h-md);padding:0}
.ef-btn--icon-xs{width:var(--control-h-xs);height:var(--control-h-xs);padding:0}
.ef-btn--icon-sm{width:var(--control-h-sm);height:var(--control-h-sm);padding:0}
.ef-btn--icon-lg{width:var(--control-h-lg);height:var(--control-h-lg);padding:0}
.ef-btn--primary{background:var(--accent);color:var(--accent-contrast)}
.ef-btn--primary:hover{background:var(--accent-hover)}
.ef-btn--primary:active{background:var(--accent-active)}
.ef-btn--secondary{background:transparent;color:var(--text-primary);border-color:var(--border-strong)}
.ef-btn--secondary:hover{background:var(--surface-sunken)}
.ef-btn--ghost{background:transparent;color:var(--text-secondary)}
.ef-btn--ghost:hover{background:var(--surface-sunken);color:var(--text-primary)}
.ef-btn--danger{background:var(--status-danger-solid);color:var(--status-danger-on-solid)}
.ef-btn--danger:hover{background:var(--danger-700)}
.ef-btn--brand{background:var(--surface-brand);color:var(--text-on-brand)}
.ef-btn--brand:hover{background:var(--surface-brand-hover)}
.ef-btn--link{height:auto;padding:0;background:transparent;color:var(--text-link);text-underline-offset:4px}
.ef-btn--link:hover{color:var(--text-link-hover);text-decoration:none}
@keyframes ef-spin{to{transform:rotate(360deg)}}
.ef-btn__spin{display:inline-flex;animation:ef-spin .7s linear infinite}
/* Touch: fixed-size targets grow to --tap-min; small glyph buttons keep their look and get a centred --tap-min hit area instead. */
@media (pointer:coarse){.ef-btn--xs{height:var(--tap-min)}.ef-btn--icon-xs{width:var(--tap-min);height:var(--tap-min)}}
`;
export function buttonVariants({ variant = 'default', size = 'default', shape = 'default', className = '' } = {}) {
  const mappedVariant = variant === 'default' ? 'primary' : variant;
  const mappedSize = size === 'default' ? 'md' : size;
  return `ef-btn ef-btn--${mappedVariant} ef-btn--${mappedSize}${shape === 'pill' ? ' ef-btn--pill' : ''}${className ? ' ' + className : ''}`;
}
export const Button = React.forwardRef(function Button({ variant = 'default', size = 'default', shape = 'default', iconLeft, iconRight, fullWidth, loading, disabled, children, style, className, ...rest }, ref) {
  injectEfCss('ef-css-btn', CSS);
  const isz = size === 'xs' || size === 'icon-xs' ? 12 : size === 'sm' || size === 'icon-sm' ? 14 : size === 'lg' || size === 'xl' || size === 'icon-lg' ? 18 : 16;
  return (
    <button ref={ref} className={buttonVariants({ variant, size, shape, className })} disabled={disabled || loading} aria-busy={loading || undefined} data-loading={loading ? '' : undefined} style={{ width: fullWidth ? '100%' : undefined, ...style }} {...rest}>
      {loading ? <span className="ef-btn__spin" aria-hidden="true"><Icon name="loader-circle" size={isz} /></span> : iconLeft ? <Icon name={iconLeft} size={isz} /> : null}
      {children}
      {iconRight ? <Icon name={iconRight} size={isz} /> : null}
    </button>
  );
});
