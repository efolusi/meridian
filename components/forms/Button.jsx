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
.ef-btn--primary:is(:disabled,[aria-disabled="true"],[data-disabled]):not([data-loading]){opacity:1;background:var(--surface-track);border-color:transparent;color:var(--text-muted);--ef-btn-ink:var(--text-muted);--ef-btn-fill:var(--surface-track)}
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
.ef-btn--primary{background:var(--accent);border-color:var(--accent-edge);color:var(--accent-contrast);--ef-btn-ink:var(--accent-contrast);--ef-btn-fill:var(--accent)}
@media (hover:hover){.ef-btn--primary:hover{background:var(--accent-hover);--ef-btn-fill:var(--accent-hover)}}
.ef-btn--primary:active{background:var(--accent-active);--ef-btn-fill:var(--accent-active)}
.ef-btn--secondary{background:transparent;color:var(--text-primary);border-color:var(--border-control);--ef-btn-ink:var(--text-primary);--ef-btn-fill:var(--surface-page)}
@media (hover:hover){.ef-btn--secondary:hover{background:var(--surface-sunken)}}
.ef-btn--ghost{background:transparent;color:var(--text-secondary)}
@media (hover:hover){.ef-btn--ghost:hover{background:var(--surface-sunken);color:var(--text-primary)}}
.ef-btn--danger{background:var(--status-danger-solid);color:var(--status-danger-on-solid);--ef-btn-ink:var(--status-danger-on-solid);--ef-btn-fill:var(--status-danger-solid)}
@media (hover:hover){.ef-btn--danger:hover{background:var(--danger-700);--ef-btn-fill:var(--danger-700)}}
.ef-btn--brand{background:var(--surface-brand);color:var(--text-on-brand);--ef-btn-ink:var(--text-on-brand);--ef-btn-fill:var(--surface-brand)}
@media (hover:hover){.ef-btn--brand:hover{background:var(--surface-brand-hover);--ef-btn-fill:var(--surface-brand-hover)}}
.ef-btn--link{height:auto;padding:0;background:transparent;color:var(--text-link);text-underline-offset:4px}
@media (hover:hover){.ef-btn--link:hover{color:var(--text-link-hover);text-decoration:none}}
@keyframes ef-spin{to{transform:rotate(360deg)}}
.ef-btn__spin{display:inline-flex;animation:ef-spin var(--dur-spin) linear infinite}
/* The trailing arrow bubble (MD94, iconBubble). The bubble takes the button's label colour (--ef-btn-ink) and the arrow takes
   the button's own fill (--ef-btn-fill), so the bubble reads on the button and the arrow reads on the bubble in light and
   dark (primary: ink on copper 6.37:1 both ways; copper on copper was 1.10:1). A bubble button is always a pill, and the circle
   sits concentric with the pill end: the inset is the same on the end and the top, and it grows with the size (md 5, lg 6,
   xl 8). Sizes md, lg and xl only. The pair is set on each variant above and on .ef-btn--band below. */
.ef-btn--bubble.ef-btn--md{--ef-btn-inset:5px;padding-inline-end:var(--ef-btn-inset)}
.ef-btn--bubble.ef-btn--lg{--ef-btn-inset:6px;padding-inline-end:var(--ef-btn-inset)}
.ef-btn--bubble.ef-btn--xl{--ef-btn-inset:8px;padding-inline-end:var(--ef-btn-inset)}
.ef-btn__bubble{display:inline-flex;align-items:center;justify-content:center;flex:none;box-sizing:border-box;border-radius:var(--radius-full);background:var(--ef-btn-ink);color:var(--ef-btn-fill);transition:background var(--dur-fast) var(--ease-enter),color var(--dur-fast) var(--ease-enter)}
.ef-btn--md .ef-btn__bubble{width:calc(var(--control-h-md) - 2 * var(--ef-btn-inset));height:calc(var(--control-h-md) - 2 * var(--ef-btn-inset))}
.ef-btn--lg .ef-btn__bubble{width:calc(var(--control-h-lg) - 2 * var(--ef-btn-inset));height:calc(var(--control-h-lg) - 2 * var(--ef-btn-inset))}
.ef-btn--xl .ef-btn__bubble{width:calc(var(--control-h-xl) - 2 * var(--ef-btn-inset));height:calc(var(--control-h-xl) - 2 * var(--ef-btn-inset))}
.ef-btn__bubble:dir(rtl) [data-slot="icon"]{transform:scaleX(-1)}
.ef-btn--primary[data-loading]:is(:hover,:active){--ef-btn-fill:var(--accent)}
/* On a band (Section tone="band": the cream band in light, the dark band in dark): a cream fill with dark ink, the same in
   both themes. On the light band the fill is 1.09:1 against it, so the accent edge is the boundary (3.81:1, WCAG 1.4.11); on
   the dark band the fill is 13.2:1. Hover and press go one cream step deeper. */
.ef-btn--band{background:var(--cream-50);border-color:var(--accent-edge);color:var(--brand-950);--ef-btn-ink:var(--brand-950);--ef-btn-fill:var(--cream-50)}
@media (hover:hover){.ef-btn--band:hover{background:var(--brand-200);--ef-btn-fill:var(--brand-200)}}
.ef-btn--band:active{background:var(--brand-300);--ef-btn-fill:var(--brand-300)}
/* The arrow moves on hover and keyboard focus, only with a fine pointer and only when motion is welcome: the diagonal arrow
   (arrow-up-right, marked data-turn) turns 45 degrees to point along the line, any other arrow nudges toward the end of the
   line by the shift token. Both transitions use the duration and curve tokens and are declared inside the query, so reduced
   motion has none and nothing moves (the shift token is 0 there as well). In right-to-left the glyph is mirrored, so it turns
   and nudges the other way. */
@media (hover:hover){@media (prefers-reduced-motion:no-preference){.ef-btn--bubble:is(:hover,:focus-visible) .ef-btn__bubble:not([data-turn]) [data-slot="icon"]{translate:var(--shift-sm) 0}.ef-btn--bubble:is(:hover,:focus-visible) .ef-btn__bubble:not([data-turn]):dir(rtl) [data-slot="icon"]{translate:calc(-1 * var(--shift-sm)) 0}.ef-btn--bubble:is(:hover,:focus-visible) .ef-btn__bubble[data-turn] [data-slot="icon"]{rotate:45deg}.ef-btn--bubble:is(:hover,:focus-visible) .ef-btn__bubble[data-turn]:dir(rtl) [data-slot="icon"]{rotate:-45deg}.ef-btn__bubble [data-slot="icon"]{transition:translate var(--dur-base) var(--ease-enter),rotate var(--dur-base) var(--ease-enter)}}}
/* Touch: fixed-size targets grow to --tap-min; small glyph buttons keep their look and get a centred --tap-min hit area instead. */
@media (pointer:coarse){.ef-btn--xs{height:var(--tap-min)}.ef-btn--icon-xs{width:var(--tap-min);height:var(--tap-min)}}
.ef-btn--full{width:100%}
`;
// The bubble needs a filled or outlined surface to sit on and room for a circle: md, lg and xl, and not ghost, link or an icon size.
const BUBBLE_SIZES = ['md', 'lg', 'xl'];
const bubbleFits = (variant, size) => !['ghost', 'link'].includes(variant) && BUBBLE_SIZES.includes(size === 'default' ? 'md' : size);
export function buttonVariants({ variant = 'default', size = 'default', shape = 'default', bubble = false, fullWidth = false, className = '' } = {}) {
  const mappedVariant = variant === 'default' ? 'primary' : variant;
  const mappedSize = size === 'default' ? 'md' : size;
  const withBubble = bubble && bubbleFits(mappedVariant, mappedSize);
  return `ef-btn ef-btn--${mappedVariant} ef-btn--${mappedSize}${shape === 'pill' || withBubble ? ' ef-btn--pill' : ''}${withBubble ? ' ef-btn--bubble' : ''}${fullWidth ? ' ef-btn--full' : ''}${className ? ' ' + className : ''}`;
}
export const Button = React.forwardRef(function Button({ variant = 'default', size = 'default', shape = 'default', iconLeft, iconRight, iconBubble, fullWidth, loading, disabled, children, style, className, ...rest }, ref) {
  injectEfCss('ef-css-btn', CSS);
  const isz = size === 'xs' || size === 'icon-xs' ? 12 : size === 'sm' || size === 'icon-sm' ? 14 : size === 'lg' || size === 'xl' || size === 'icon-lg' ? 18 : 16;
  // A bubble draws its own spinner, so the label does not jump when the button loads; where the bubble does not fit, the glyph is a plain trailing icon.
  const bubble = Boolean(iconBubble) && bubbleFits(variant === 'default' ? 'primary' : variant, size);
  const trailing = bubble ? null : iconRight || iconBubble;
  const bubbleIcon = size === 'lg' || size === 'xl' ? 20 : 16;
  return (
    <button ref={ref} className={buttonVariants({ variant, size, shape, bubble, fullWidth, className })} disabled={disabled || loading} aria-busy={loading || undefined} data-loading={loading ? '' : undefined} style={style} {...rest}>
      {loading && !bubble ? <span className="ef-btn__spin" aria-hidden="true"><Icon name="loader-circle" size={isz} /></span> : iconLeft ? <Icon name={iconLeft} size={isz} /> : null}
      {children}
      {trailing ? <Icon name={trailing} size={isz} /> : null}
      {bubble ? <span className="ef-btn__bubble" data-turn={iconBubble === 'arrow-up-right' ? '' : undefined} aria-hidden="true">{loading ? <span className="ef-btn__spin"><Icon name="loader-circle" size={bubbleIcon} /></span> : <Icon name={iconBubble} size={bubbleIcon} />}</span> : null}
    </button>
  );
});
