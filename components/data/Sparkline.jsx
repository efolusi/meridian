import React from 'react';
export function Sparkline({ data = [], width = 120, height = 32, direction, strokeWidth = 1.5, area = true, style, className, ...rest }) {
  if (!data.length) return null;
  const min = Math.min(...data), max = Math.max(...data), span = max - min || 1;
  const pad = strokeWidth;
  const pts = data.map((v, i) => [
    pad + (i / (data.length - 1)) * (width - pad * 2),
    pad + (1 - (v - min) / span) * (height - pad * 2),
  ]);
  const dir = direction || (data[data.length - 1] >= data[0] ? 'up' : 'down');
  const color = dir === 'up' ? 'var(--success-600)' : dir === 'down' ? 'var(--danger-600)' : 'var(--text-primary)';
  const line = pts.map(p => p.map(n => n.toFixed(1)).join(',')).join(' ');
  return (
    <svg {...rest} width={width} height={height} viewBox={`0 0 ${width} ${height}`} style={style} className={className} aria-hidden="true">
      {area && <polygon points={`${pad},${height - pad} ${line} ${width - pad},${height - pad}`} fill={color} opacity="0.09" />}
      <polyline points={line} fill="none" stroke={color} strokeWidth={strokeWidth} strokeLinejoin="round" strokeLinecap="round" />
    </svg>
  );
}
