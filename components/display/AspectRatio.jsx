import React from 'react';
export function AspectRatio({ ratio = 16 / 9, children, style, className, ...rest }) {
  return (
    <div {...rest} className={className} style={{ position: 'relative', width: '100%', aspectRatio: String(Math.round(ratio * 1000) / 1000), ...style }}>
      <div style={{ position: 'absolute', inset: 0 }}>{children}</div>
    </div>
  );
}
