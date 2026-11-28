'use client';
import React from 'react';
import { Icon } from '../icons/Icon.jsx';
import { injectEfCss } from '../runtime/runtime.jsx';
const CSS = `
.ef-btn{display:inline-flex;align-items:center;justify-content:center;gap:var(--gap-label-icon);text-decoration:none;border:1px solid transparent;border-radius:var(--press-radius,var(--radius-sm));font-family:var(--font-sans);font-weight:var(--weight-semibold);cursor:pointer;white-space:nowrap;user-select:none;transition:background var(--dur-fast) var(--ease-enter),border-color var(--dur-fast) var(--ease-enter),color var(--dur-fast) var(--ease-enter),box-shadow var(--dur-fast) var(--ease-enter),transform var(--dur-fast) var(--ease-enter)}
.ef-btn{line-height:var(--leading-normal)}
.ef-btn--pill{border-radius:var(--radius-full)}
.ef-btn--pill.ef-btn--xs{padding-inline:var(--space-3)}
.ef-btn--pill.ef-btn--sm{padding-inline:var(--space-4)}
.ef-btn--pill.ef-btn--md{padding-inline:var(--space-5)}
.ef-btn--pill.ef-btn--lg{padding-inline:var(--space-6)}
.ef-btn--pill.ef-btn--xl{padding-inline:var(--space-8)}
.ef-btn:focus,.ef-btn:visited{text-decoration:none}@media (hover:hover){.ef-btn:hover{text-decoration:none}}
.ef-btn:focus-visible{outline:none;box-shadow:var(--focus-ring)}
.ef-btn:active{transform:scale(var(--motion-press))}
.ef-btn:is(:disabled,[aria-disabled="true"],[data-disabled]){opacity:.45;cursor:not-allowed;pointer-events:none}
/* A disabled primary is flat and neutral, not faded copper: the copper fill and ink label at .45 opacity are 1.9:1 apart
   in light. A loading primary is disabled too, but the spinner is its only busy cue, so it keeps full strength (ink on
   copper 6.37:1, aria-busy is set) and a progress cursor; hover and press leave it alone. */
.ef-btn--primary:is(:disabled,[aria-disabled="true"],[data-disabled]):not([data-loading]){opacity:1;background:var(--surface-track);border-color:transparent;color:var(--text-muted)}
.ef-btn--primary[data-loading]{opacity:1;cursor:progress;pointer-events:auto}
.ef-btn--primary[data-loading]:is(:hover,:active){background:var(--accent);border-color:var(--accent-edge);transform:none}
.ef-btn--sm{height:var(--control-h-sm);padding:0 var(--space-3);font-size:var(--text-sm)}
.ef-btn--md{height:var(--control-h-md);padding:0 var(--space-4);font-size:var(--text-md)}
.ef-btn--lg{height:var(--control-h-lg);padding:0 var(--space-5);font-size:var(--text-lg)}
.ef-btn--xl{height:var(--control-h-xl);padding:0 var(--space-6);font-size:var(--text-lg)}
.ef-btn--xs{height:var(--control-h-xs);padding:0 9px;font-size:var(--text-xs);gap:var(--gap-label-icon-sm)}
.ef-btn--icon,.ef-btn--icon-md{width:var(--control-h-md);height:var(--control-h-md);padding:0}
.ef-btn--icon-xs{width:var(--control-h-xs);height:var(--control-h-xs);padding:0}
.ef-btn--icon-sm{width:var(--control-h-sm);height:var(--control-h-sm);padding:0}
.ef-btn--icon-lg{width:var(--control-h-lg);height:var(--control-h-lg);padding:0}
.ef-btn--primary{background:var(--accent);border-color:var(--accent-edge);color:var(--accent-contrast)}
@media (hover:hover){.ef-btn--primary:hover{background:var(--accent-hover)}}
.ef-btn--primary:active{background:var(--accent-active)}
.ef-btn--secondary{background:transparent;color:var(--text-primary);border-color:var(--border-strong)}
@media (hover:hover){.ef-btn--secondary:hover{background:var(--surface-sunken)}}
.ef-btn--ghost{background:transparent;color:var(--text-secondary)}
@media (hover:hover){.ef-btn--ghost:hover{background:var(--surface-sunken);color:var(--text-primary)}}
.ef-btn--danger{background:var(--status-danger-solid);color:var(--status-danger-on-solid)}
@media (hover:hover){.ef-btn--danger:hover{background:var(--danger-700)}}
.ef-btn--brand{background:var(--surface-brand);color:var(--text-on-brand)}
@media (hover:hover){.ef-btn--brand:hover{background:var(--surface-brand-hover)}}
.ef-btn--link{height:auto;padding:0;background:transparent;color:var(--text-link);text-underline-offset:4px}
@media (hover:hover){.ef-btn--link:hover{color:var(--text-link-hover);text-decoration:none}}
@keyframes ef-spin{to{transform:rotate(360deg)}}
.ef-btn__spin{display:inline-flex;animation:ef-spin var(--dur-spin) linear infinite}
/* Touch: fixed-size targets grow to --tap-min; small glyph buttons keep their look and get a centred --tap-min hit area instead. */
@media (pointer:coarse){.ef-btn--xs{height:var(--tap-min)}.ef-btn--icon-xs{width:var(--tap-min);height:var(--tap-min)}}
.ef-btn--full{width:100%}
`;
export function buttonVariants({ variant = 'default', size = 'default', shape = 'default', fullWidth = false, className = '' } = {}) {
  const mappedVariant = variant === 'default' ? 'primary' : variant;
  const mappedSize = size === 'default' ? 'md' : size;
  return `ef-btn ef-btn--${mappedVariant} ef-btn--${mappedSize}${shape === 'pill' ? ' ef-btn--pill' : ''}${fullWidth ? ' ef-btn--full' : ''}${className ? ' ' + className : ''}`;
}
export const Button = React.forwardRef(function Button({ variant = 'default', size = 'default', shape = 'default', iconLeft, iconRight, fullWidth, loading, disabled, children, style, className, ...rest }, ref) {
  injectEfCss('ef-css-btn', CSS);
  const isz = size === 'xs' || size === 'icon-xs' ? 12 : size === 'sm' || size === 'icon-sm' ? 14 : size === 'lg' || size === 'xl' || size === 'icon-lg' ? 18 : 16;
  return (
    <button ref={ref} className={buttonVariants({ variant, size, shape, fullWidth, className })} disabled={disabled || loading} aria-busy={loading || undefined} data-loading={loading ? '' : undefined} style={style} {...rest}>
      {loading ? <span className="ef-btn__spin" aria-hidden="true"><Icon name="loader-circle" size={isz} /></span> : iconLeft ? <Icon name={iconLeft} size={isz} /> : null}
      {children}
      {iconRight ? <Icon name={iconRight} size={isz} /> : null}
    </button>
  );
});
