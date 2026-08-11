import React from 'react';
export const AspectRatio = React.forwardRef(function AspectRatio({ ratio, children, style, className, ...rest }, ref) {
  return (
    <div ref={ref} {...rest} className={className} style={{ position: 'relative', width: '100%', aspectRatio: String(Math.round(ratio * 1000) / 1000), ...style }}>
      <div style={{ position: 'absolute', inset: 0 }}>{children}</div>
    </div>
  );
});
