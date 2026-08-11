import React from 'react';
import { injectEfCss } from '../forms/Button.jsx';

const CSS = `
.ef-card{background:var(--surface-card);border:1px solid var(--border-default);border-radius:var(--radius-md)}
.ef-card--elevated{box-shadow:var(--shadow-sm)}
.ef-card--interactive{cursor:pointer;transition:border-color var(--dur-fast) var(--ease-out),background var(--dur-fast) var(--ease-out)}
.ef-card--interactive:hover{border-color:var(--sand-400)}
.ef-card--interactive:active{background:var(--surface-subtle)}
.ef-card--composed{--card-spacing:16px;display:flex;flex-direction:column;gap:var(--card-spacing);overflow:hidden;padding-block:var(--card-spacing);font-size:var(--text-sm);color:var(--text-primary)}
.ef-card--composed[data-size="sm"]{--card-spacing:12px}
.ef-card--composed:has(>.ef-card__footer){padding-block-end:0}
.ef-card--composed:has(>img:first-child){padding-block-start:0}
.ef-card--composed>img:first-child{border-start-start-radius:var(--radius-md);border-start-end-radius:var(--radius-md)}
.ef-card--composed>img:last-child{border-end-start-radius:var(--radius-md);border-end-end-radius:var(--radius-md)}
.ef-card__header{display:grid;grid-template-columns:minmax(0,1fr);grid-auto-rows:min-content;align-items:start;gap:4px;padding-inline:var(--card-spacing,20px)}
.ef-card__header:has(.ef-card__action){grid-template-columns:minmax(0,1fr) auto}
.ef-card__header.ef-card__header--legacy{display:flex;align-items:flex-start;justify-content:space-between;gap:12px;padding:16px 20px;border-bottom:1px solid var(--border-default)}
.ef-card__title{margin:0;font-family:var(--font-sans);font-size:var(--text-lg);font-weight:var(--weight-semibold);line-height:var(--leading-tight);letter-spacing:0;color:var(--text-primary)}
.ef-card__description,.ef-card__subtitle{font-size:var(--text-sm);line-height:var(--leading-relaxed);color:var(--text-muted)}
.ef-card__subtitle{margin-top:2px}
.ef-card__action{grid-column:2;grid-row:1/span 2;align-self:start;justify-self:end}
.ef-card__content{padding-inline:var(--card-spacing)}
.ef-card__footer{display:flex;align-items:center;gap:8px;padding:var(--card-spacing);border-top:1px solid var(--border-default);background:var(--surface-subtle);border-end-start-radius:var(--radius-md);border-end-end-radius:var(--radius-md)}
.ef-card__footer--legacy{padding:12px 20px}
`;

function cx(base, className) {
  return base + (className ? ` ${className}` : '');
}

export const CardHeader = React.forwardRef(function CardHeader({ className, ...rest }, ref) {
  return <div {...rest} ref={ref} data-slot="card-header" className={cx('ef-card__header', className)} />;
});

export const CardTitle = React.forwardRef(function CardTitle({ className, ...rest }, ref) {
  return <div {...rest} ref={ref} data-slot="card-title" className={cx('ef-card__title', className)} />;
});

export const CardDescription = React.forwardRef(function CardDescription({ className, ...rest }, ref) {
  return <div {...rest} ref={ref} data-slot="card-description" className={cx('ef-card__description', className)} />;
});

export const CardAction = React.forwardRef(function CardAction({ className, ...rest }, ref) {
  return <div {...rest} ref={ref} data-slot="card-action" className={cx('ef-card__action', className)} />;
});

export const CardContent = React.forwardRef(function CardContent({ className, ...rest }, ref) {
  return <div {...rest} ref={ref} data-slot="card-content" className={cx('ef-card__content', className)} />;
});

export const CardFooter = React.forwardRef(function CardFooter({ className, ...rest }, ref) {
  return <div {...rest} ref={ref} data-slot="card-footer" className={cx('ef-card__footer', className)} />;
});

const CARD_PARTS = new Set([CardHeader, CardTitle, CardDescription, CardAction, CardContent, CardFooter]);

export const Card = React.forwardRef(function Card({
  size = 'default', title, subtitle, actions, footer, padding,
  elevated, interactive, children, style, className, ...rest
}, ref) {
  injectEfCss('ef-css-card', CSS);
  const hasLegacyProps = title !== undefined || subtitle !== undefined || actions !== undefined || footer !== undefined || padding !== undefined || elevated || interactive;
  const hasComposedParts = React.Children.toArray(children).some(child => React.isValidElement(child) && CARD_PARTS.has(child.type));
  const composed = hasComposedParts || !hasLegacyProps;
  const rootClass = `ef-card${composed ? ' ef-card--composed' : ''}${elevated ? ' ef-card--elevated' : ''}${interactive ? ' ef-card--interactive' : ''}${className ? ` ${className}` : ''}`;
  return (
    <div {...rest} ref={ref} data-slot="card" data-size={size} className={rootClass} style={style}>
      {composed ? children : (
        <React.Fragment>
          {title !== undefined || actions !== undefined ? (
            <div className="ef-card__header ef-card__header--legacy">
              <div>
                <div className="ef-card__title">{title}</div>
                {subtitle !== undefined ? <div className="ef-card__subtitle">{subtitle}</div> : null}
              </div>
              {actions !== undefined ? <div style={{ display: 'flex', gap: 8, flex: 'none' }}>{actions}</div> : null}
            </div>
          ) : null}
          <div style={{ padding: padding === undefined ? 20 : padding }}>{children}</div>
          {footer !== undefined ? <div className="ef-card__footer ef-card__footer--legacy">{footer}</div> : null}
        </React.Fragment>
      )}
    </div>
  );
});
