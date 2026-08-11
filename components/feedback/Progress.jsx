import React from 'react';
import { injectEfCss } from '../forms/Button.jsx';

const CSS = `
.ef-progress-shell{display:flex;flex-direction:column;gap:6px}
.ef-progress__head{display:flex;justify-content:space-between;align-items:baseline}
.ef-progress__label{font-size:var(--text-sm);font-weight:var(--weight-medium);color:var(--text-primary)}
.ef-progress__val{font-family:var(--font-mono);font-size:var(--text-xs);color:var(--text-muted)}
.ef-progress{position:relative;height:8px;width:100%;overflow:hidden;border-radius:var(--radius-full);background:var(--sand-200)}
.ef-progress__indicator{height:100%;width:100%;border-radius:inherit;background:var(--accent);transition:transform var(--dur-slow) var(--ease-out)}
.ef-progress[data-tone="warning"] .ef-progress__indicator{background:var(--warning-600)}
.ef-progress[data-tone="danger"] .ef-progress__indicator{background:var(--danger-600)}
.ef-progress[data-state="indeterminate"] .ef-progress__indicator{width:45%;animation:ef-progress-indeterminate 1.2s ease-in-out infinite}
@keyframes ef-progress-indeterminate{0%{transform:translateX(-110%)}50%{transform:translateX(125%)}100%{transform:translateX(240%)}}
[dir="rtl"] .ef-progress[data-state="indeterminate"] .ef-progress__indicator{animation-direction:reverse}
@media (prefers-reduced-motion:reduce){.ef-progress__indicator{transition:none}.ef-progress[data-state="indeterminate"] .ef-progress__indicator{animation:none;transform:none}}
`;

function classes(...values) {
  return values.filter(Boolean).join(' ');
}

export const Progress = React.forwardRef(function Progress({
  value,
  max = 100,
  label,
  showValue,
  format,
  tone = 'default',
  className,
  style,
  ...rest
}, ref) {
  injectEfCss('ef-css-progress', CSS);
  const safeMax = Number.isFinite(max) && max > 0 ? max : 100;
  const determinate = Number.isFinite(value);
  const safeValue = determinate ? Math.min(safeMax, Math.max(0, value)) : null;
  const percent = determinate ? (safeValue / safeMax) * 100 : 0;
  const state = !determinate ? 'indeterminate' : safeValue === safeMax ? 'complete' : 'loading';
  const generatedLabelId = React.useId();
  const labelledBy = rest['aria-labelledby'] ?? (label ? generatedLabelId : undefined);
  const track = (
    <div
      {...rest}
      ref={ref}
      role="progressbar"
      data-slot="progress"
      data-state={state}
      data-value={safeValue ?? undefined}
      data-max={safeMax}
      data-tone={tone}
      aria-valuemin={0}
      aria-valuemax={safeMax}
      aria-valuenow={safeValue ?? undefined}
      aria-labelledby={labelledBy}
      className={classes('ef-progress', className)}
      style={style}
    >
      <div
        data-slot="progress-indicator"
        data-state={state}
        className="ef-progress__indicator"
        style={determinate ? { transform: `translateX(calc(-100% + ${percent}%))` } : undefined}
      />
    </div>
  );

  if (!label && !showValue) return track;
  return (
    <div className="ef-progress-shell">
      <div className="ef-progress__head">
        <span id={label ? generatedLabelId : undefined} className="ef-progress__label">{label}</span>
        {showValue && determinate
          ? <span className="ef-progress__val">{format ? format(safeValue, safeMax) : `${Math.round(percent)}%`}</span>
          : null}
      </div>
      {track}
    </div>
  );
});
