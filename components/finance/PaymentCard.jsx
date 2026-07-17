import React from 'react';
import { injectEfCss } from '../forms/Button.jsx';
const CSS = `
.ef-paycard{position:relative;width:320px;aspect-ratio:1.586;border-radius:14px;padding:20px;display:flex;flex-direction:column;color:var(--brand-50);background:var(--brand-950);overflow:hidden;font-family:var(--font-sans)}
.ef-paycard--caramel{background:var(--brand-700)}
.ef-paycard--paper{background:var(--surface-card);color:var(--text-primary);border:1px solid var(--border-strong)}
.ef-paycard__ring{position:absolute;border-radius:999px;border:1px solid currentColor;opacity:.1;pointer-events:none}
.ef-paycard__num{font-family:var(--font-mono);font-size:16px;letter-spacing:.12em;margin-top:auto}
.ef-paycard__row{display:flex;align-items:flex-end;gap:18px;margin-top:12px}
.ef-paycard__lbl{font-size:8.5px;font-weight:600;letter-spacing:.08em;text-transform:uppercase;opacity:.55}
.ef-paycard__val{font-size:12.5px;font-weight:600;margin-top:2px}
.ef-paycard__chip{width:34px;height:25px;border-radius:5px;background:linear-gradient(135deg,var(--brand-200),var(--brand-500));opacity:.9}
`;
export function PaymentCard({ name = 'ADA OBI', number = '•••• •••• •••• 4242', expiry = '09/29', network = 'Efolusi', variant = 'espresso', frozen, style, className }) {
  injectEfCss('ef-css-paycard', CSS);
  return (
    <div className={`ef-paycard${variant === 'caramel' ? ' ef-paycard--caramel' : variant === 'paper' ? ' ef-paycard--paper' : ''}${className ? ' ' + className : ''}`} style={{ filter: frozen ? 'grayscale(.7) opacity(.75)' : undefined, ...style }}>
      <span className="ef-paycard__ring" style={{ width: 220, height: 220, right: -70, top: -70 }}></span>
      <span className="ef-paycard__ring" style={{ width: 220, height: 220, right: -40, top: -110 }}></span>
      <div style={{ display: 'flex', alignItems: 'center' }}>
        <span style={{ fontFamily: 'var(--font-display)', fontWeight: 680, letterSpacing: '-0.02em', fontSize: 16 }}>{network}</span>
        {frozen ? <span style={{ marginLeft: 'auto', fontSize: 10, fontWeight: 600, letterSpacing: '.08em', textTransform: 'uppercase', opacity: .7 }}>Frozen</span> : null}
      </div>
      <div style={{ marginTop: 14 }}><span className="ef-paycard__chip" style={{ display: 'block' }}></span></div>
      <div className="ef-paycard__num">{number}</div>
      <div className="ef-paycard__row">
        <span style={{ flex: 1, minWidth: 0 }}><span className="ef-paycard__lbl" style={{ display: 'block' }}>Card holder</span><span className="ef-paycard__val" style={{ display: 'block' }}>{name}</span></span>
        <span><span className="ef-paycard__lbl" style={{ display: 'block' }}>Expires</span><span className="ef-paycard__val" style={{ display: 'block' }}>{expiry}</span></span>
      </div>
    </div>
  );
}
