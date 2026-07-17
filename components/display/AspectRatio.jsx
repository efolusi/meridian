import React from 'react';
export function AspectRatio({ ratio = 16 / 9, children, style, className }) {
  return (
    <div className={className} style={{ position: 'relative', width: '100%', aspectRatio: String(ratio), ...style }}>
      <div style={{ position: 'absolute', inset: 0 }}>{children}</div>
    </div>
  );
}
