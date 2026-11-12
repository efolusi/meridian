import React from 'react';
import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import { Terminal } from '../components/code/Terminal.jsx';

// --code-ink-faint on the code surface is 3.09:1, under the 4.5:1 text minimum;
// --code-ink-subtle is 5.97:1 (tokens area, scripts/check_contrast.py).
describe('Terminal timestamps', () => {
  it('use a text ink that meets 4.5:1', () => {
    render(<Terminal lines={[{ text: 'ok', time: '10:00:00' }]} />);
    const rule = document.getElementById('ef-css-term')?.textContent.match(/\.ef-term__time\{([^}]*)\}/)?.[1]
      || [...document.querySelectorAll('style')].map(s => s.textContent).join('').match(/\.ef-term__time\{([^}]*)\}/)[1];
    expect(rule).toContain('var(--code-ink-subtle)');
    expect(rule).not.toContain('--code-ink-faint');
  });
});
