import React from 'react';
import { injectEfCss } from '../forms/Button.jsx';

const CSS = `
@keyframes ef-spinner{to{transform:rotate(360deg)}}
.ef-spinner{display:inline-block;flex:none;color:var(--text-muted);animation:ef-spinner .7s linear infinite}
`;

export const Spinner = React.forwardRef(function Spinner(
  { className, ...props },
  ref,
) {
  injectEfCss('ef-css-spinner', CSS);
  return (
    <svg
      ref={ref}
      role="status"
      aria-label="Loading"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      width="16"
      height="16"
      className={`ef-spinner${className ? ' ' + className : ''}`}
      {...props}
    >
      <path d="M21 12a9 9 0 1 1-6.219-8.56" />
    </svg>
  );
});
