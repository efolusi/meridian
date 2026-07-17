import React from 'react';
import { injectEfCss } from '../forms/Button.jsx';
import { Icon } from '../icons/Icon.jsx';
const CSS = `
.ef-promptsteps{border:1px solid var(--border-default);border-radius:var(--radius-md);background:var(--surface-card);padding:5px;font-family:var(--font-sans)}
.ef-promptsteps:focus{outline:none}
.ef-promptsteps:focus-visible{box-shadow:var(--focus-ring)}
.ef-promptsteps__q{padding:8px 11px 6px;font-size:13.5px;font-weight:var(--weight-semibold);color:var(--text-primary)}
.ef-promptsteps__opt{display:flex;align-items:center;gap:11px;width:100%;padding:8px 11px;border:none;background:none;cursor:pointer;text-align:left;border-radius:var(--radius-sm);font-family:var(--font-sans);font-size:13.5px;color:var(--text-secondary)}
.ef-promptsteps__opt--hi{background:var(--surface-sunken);color:var(--text-primary)}
.ef-promptsteps__num{flex:none;width:14px;font-variant-numeric:tabular-nums;color:var(--text-muted);font-size:12.5px}
.ef-promptsteps__other{flex:1;min-width:0;border:none;background:none;outline:none;font-family:var(--font-sans);font-size:13.5px;color:var(--text-primary);padding:0}
.ef-promptsteps__other::placeholder{color:var(--text-muted)}
.ef-promptsteps__foot{display:flex;align-items:center;gap:12px;padding:8px 11px 5px;font-size:12px;color:var(--text-muted)}
.ef-promptsteps__back{display:inline-flex;align-items:center;gap:4px;border:none;background:none;cursor:pointer;padding:2px 6px;margin-left:-6px;border-radius:var(--radius-sm);font-family:var(--font-sans);font-size:12px;color:var(--text-muted)}
.ef-promptsteps__back:hover{color:var(--text-primary)}
.ef-promptsteps__kbd{margin-left:auto;display:inline-flex;align-items:center;gap:5px}
.ef-promptsteps__kbd kbd{padding:1px 6px;border:1px solid var(--border-default);border-radius:var(--radius-sm);background:var(--surface-subtle);font-family:var(--font-sans);font-size:11px;color:var(--text-secondary)}
`;
export function PromptSteps({ steps = [], defaultValues = {}, onAnswer, onComplete, onDismiss, style, className }) {
  injectEfCss('ef-css-promptsteps', CSS);
  const [idx, setIdx] = React.useState(0);
  const [hi, setHi] = React.useState(0);
  const [other, setOther] = React.useState('');
  const [answers, setAnswers] = React.useState(defaultValues);
  const rootRef = React.useRef(null);
  const otherRef = React.useRef(null);
  const step = steps[idx];
  const opts = step ? step.options.concat(step.other ? ['__other__'] : []) : [];
  const otherIdx = step && step.other ? opts.length - 1 : -1;
  React.useEffect(() => {
    if (hi === otherIdx && otherRef.current) otherRef.current.focus();
    else if (rootRef.current && (!document.activeElement || !rootRef.current.contains(document.activeElement) || document.activeElement === otherRef.current)) rootRef.current.focus();
  }, [hi, idx, otherIdx]);
  const reset = () => { setIdx(0); setHi(0); setOther(''); setAnswers(defaultValues); };
  const submit = () => {
    if (!step) return;
    const isOther = hi === otherIdx;
    const value = isOther ? other.trim() : opts[hi];
    if (!value) return;
    const next = { ...answers, [step.name]: value };
    setAnswers(next);
    if (onAnswer) onAnswer(value, { name: step.name, stepIndex: idx, totalSteps: steps.length });
    if (idx === steps.length - 1) { if (onComplete) onComplete(next); reset(); }
    else { setIdx(idx + 1); setHi(0); setOther(''); }
  };
  const back = () => { if (idx > 0) { setIdx(idx - 1); setHi(0); setOther(''); } };
  const onKey = e => {
    const inOther = e.target === otherRef.current;
    if (e.key === 'ArrowDown') { e.preventDefault(); setHi(Math.min(opts.length - 1, hi + 1)); }
    else if (e.key === 'ArrowUp') { e.preventDefault(); setHi(Math.max(0, hi - 1)); }
    else if (e.key === 'Enter') { e.preventDefault(); submit(); }
    else if (e.key === 'Escape') { e.preventDefault(); reset(); if (onDismiss) onDismiss(); }
    else if ((e.key === 'ArrowLeft' && !inOther) || (e.key === 'Tab' && e.shiftKey)) { e.preventDefault(); back(); }
    else if (!inOther && /^[1-9]$/.test(e.key)) { const n = +e.key - 1; if (n < opts.length) { e.preventDefault(); setHi(n); } }
  };
  if (!step) return null;
  return (
    <div ref={rootRef} tabIndex={-1} className={`ef-promptsteps${className ? ' ' + className : ''}`} style={style} onKeyDown={onKey}>
      <div className="ef-promptsteps__q">{step.question}</div>
      {opts.map((o, i) => i === otherIdx ? (
        <div key="__other" className={`ef-promptsteps__opt${hi === i ? ' ef-promptsteps__opt--hi' : ''}`} style={{ cursor: 'text' }} onMouseEnter={() => setHi(i)} onClick={() => { setHi(i); if (otherRef.current) otherRef.current.focus(); }}>
          <span className="ef-promptsteps__num">{i + 1}.</span>
          <input ref={otherRef} className="ef-promptsteps__other" type="text" value={other} placeholder={typeof step.other === 'string' ? step.other : 'Type your answer'} onChange={e => { setOther(e.target.value); setHi(i); }} onFocus={() => setHi(i)} />
        </div>
      ) : (
        <button key={o} type="button" className={`ef-promptsteps__opt${hi === i ? ' ef-promptsteps__opt--hi' : ''}`} onMouseEnter={() => setHi(i)} onClick={() => { setHi(i); submit(); }}>
          <span className="ef-promptsteps__num">{i + 1}.</span>
          <span style={{ flex: 1 }}>{o}</span>
        </button>
      ))}
      <div className="ef-promptsteps__foot">
        {idx > 0 ? <button type="button" className="ef-promptsteps__back" onClick={back}><Icon name="chevron-left" size={12} />Back</button> : null}
        <span>{idx + 1} of {steps.length}</span>
        <span className="ef-promptsteps__kbd">select <kbd>↑↓</kbd> or <kbd>1–9</kbd> · confirm <kbd>↵</kbd></span>
      </div>
    </div>
  );
}
