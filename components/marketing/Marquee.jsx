'use client';
import React from 'react';
import { injectEfCss } from '../forms/Button.jsx';
import { Icon } from '../icons/Icon.jsx';

// The items are listed once for assistive tech; the moving track is a decorative copy.
const CSS = `
.ef-marquee{position:relative;display:flex;align-items:center;border-top:1px solid var(--border-default);background:var(--surface-subtle);overflow:hidden}
.ef-marquee__list{position:absolute;width:1px;height:1px;margin:-1px;padding:0;overflow:hidden;clip:rect(0 0 0 0);white-space:nowrap;border:0}
.ef-marquee__viewport{flex:1;min-width:0;overflow:hidden}
.ef-marquee__track{display:flex;width:max-content;animation:ef-marquee var(--ef-marquee-duration,36s) linear infinite}
.ef-marquee:hover .ef-marquee__track,.ef-marquee:focus-within .ef-marquee__track,.ef-marquee[data-paused] .ef-marquee__track{animation-play-state:paused}
.ef-marquee__item{display:inline-flex;align-items:center;padding-block:var(--space-3);font-family:var(--font-mono);font-size:var(--text-xs);font-weight:var(--weight-medium);letter-spacing:var(--tracking-wide);text-transform:uppercase;color:var(--text-muted);white-space:nowrap}
.ef-marquee__item::after{content:'';width:var(--space-1);height:var(--space-1);margin-inline:var(--space-6);border-radius:var(--radius-full);background:var(--brand-500)}
.ef-marquee__item:nth-child(4n+2)::after{background:var(--success-600)}
.ef-marquee__item:nth-child(4n+3)::after{background:var(--warning-600)}
.ef-marquee__item:nth-child(4n)::after{background:var(--danger-600)}
.ef-marquee__pause{display:inline-flex;align-items:center;justify-content:center;flex:none;width:var(--tap-min);height:var(--tap-min);margin-inline:var(--space-2);padding:0;border:0;border-radius:var(--radius-full);background:transparent;color:var(--text-muted);cursor:pointer}
.ef-marquee__pause:hover{background:var(--surface-sunken);color:var(--text-primary)}
.ef-marquee__pause:focus-visible{outline:none;box-shadow:var(--focus-ring)}
@keyframes ef-marquee{to{transform:translateX(-50%)}}
[dir="rtl"] .ef-marquee__track{animation-direction:reverse}
@media (prefers-reduced-motion:reduce){.ef-marquee__track{animation:none}.ef-marquee__pause{display:none}}
`;

const LABELS = {
  en: { pause: 'Pause the moving list', play: 'Play the moving list' },
  id: { pause: 'Jeda daftar berjalan', play: 'Putar daftar berjalan' },
};

export const Marquee = React.forwardRef(function Marquee(
  { items = [], label, duration = 36, lang = 'en', labels, className, style, ...rest },
  ref,
) {
  injectEfCss('ef-css-marquee', CSS);
  const text = { ...(LABELS[lang] || LABELS.en), ...labels };
  const [paused, setPaused] = React.useState(false);
  return (
    <div
      {...rest}
      ref={ref}
      data-slot="marquee"
      data-paused={paused ? '' : undefined}
      className={`ef-marquee${className ? ` ${className}` : ''}`}
      style={{ '--ef-marquee-duration': `${duration}s`, ...style }}
    >
      <ul className="ef-marquee__list" aria-label={label}>
        {items.map((item, i) => <li key={i}>{item}</li>)}
      </ul>
      <div className="ef-marquee__viewport" aria-hidden="true">
        <div className="ef-marquee__track">
          {[...items, ...items].map((item, i) => <span className="ef-marquee__item" key={i}>{item}</span>)}
        </div>
      </div>
      <button type="button" className="ef-marquee__pause" aria-pressed={paused} aria-label={paused ? text.play : text.pause} onClick={() => setPaused((p) => !p)}>
        <Icon name={paused ? 'play' : 'pause'} size={16} aria-hidden="true" />
      </button>
    </div>
  );
});
