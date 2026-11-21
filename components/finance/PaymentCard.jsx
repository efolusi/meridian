'use client';
import React from 'react';
import { injectEfCss } from '../runtime/runtime.jsx';
const CSS = `
.ef-paycard{position:relative;width:320px;aspect-ratio:1.586;border-radius:var(--radius-lg);padding:var(--space-5);display:flex;flex-direction:column;color:var(--brand-50);background:var(--brand-950);overflow:hidden;font-family:var(--font-sans)}
.ef-paycard--caramel{background:var(--brand-700)}
.ef-paycard--paper{background:var(--surface-card);color:var(--text-primary);border:1px solid var(--border-strong)}
.ef-paycard__ring{position:absolute;border-radius:var(--radius-full);border:1px solid currentColor;opacity:.1;pointer-events:none}
.ef-paycard__num{font-family:var(--font-mono);font-size:var(--text-lg);letter-spacing:.12em;margin-top:auto}
.ef-paycard__row{display:flex;align-items:flex-end;gap:var(--space-5);margin-top:var(--space-3)}
.ef-paycard__lbl{font-size:var(--text-2xs);font-weight:600;letter-spacing:.08em;text-transform:uppercase}
.ef-paycard__val{font-size:var(--text-sm);font-weight:600;margin-top:var(--space-0-5)}
.ef-paycard__chip{width:34px;height:25px;border-radius:var(--radius-xs-plus);background:var(--brand-300)}
.ef-paycard--frozen{filter:grayscale(.7) opacity(.75)}
.ef-paycard__ring--a{width:220px;height:220px;inset-inline-end:-70px;top:-70px}
.ef-paycard__ring--b{width:220px;height:220px;inset-inline-end:-40px;top:-110px}
.ef-paycard__top{display:flex;align-items:center}
.ef-paycard__network{font-family:var(--font-display);font-weight:680;letter-spacing:-0.02em;font-size:var(--text-lg)}
.ef-paycard__frozen{margin-inline-start:auto;font-size:10px;font-weight:600;letter-spacing:.08em;text-transform:uppercase;opacity:.7}
.ef-paycard__chip-row{margin-top:var(--space-4)}
.ef-paycard__chip,.ef-paycard__lbl,.ef-paycard__val{display:block}
.ef-paycard__holder{flex:1;min-width:0}
`;
export function PaymentCard({ name = 'ADA OBI', number = '•••• •••• •••• 4242', expiry = '09/29', network = 'Meridian', variant = 'espresso', frozen, style, className, ...rest }) {
  injectEfCss('ef-css-paycard', CSS);
  return (
    <div {...rest} className={`ef-paycard${variant === 'caramel' ? ' ef-paycard--caramel' : variant === 'paper' ? ' ef-paycard--paper' : ''}${frozen ? ' ef-paycard--frozen' : ''}${className ? ' ' + className : ''}`} style={style}>
      <span className="ef-paycard__ring ef-paycard__ring--a"></span>
      <span className="ef-paycard__ring ef-paycard__ring--b"></span>
      <div className="ef-paycard__top">
        <span className="ef-paycard__network">{network}</span>
        {frozen ? <span className="ef-paycard__frozen">Frozen</span> : null}
      </div>
      <div className="ef-paycard__chip-row"><span className="ef-paycard__chip"></span></div>
      <div className="ef-paycard__num">{number}</div>
      <div className="ef-paycard__row">
        <span className="ef-paycard__holder"><span className="ef-paycard__lbl">Card holder</span><span className="ef-paycard__val">{name}</span></span>
        <span><span className="ef-paycard__lbl">Expires</span><span className="ef-paycard__val">{expiry}</span></span>
      </div>
    </div>
  );
}
