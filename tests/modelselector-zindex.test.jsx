import React from 'react';
import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import { ModelSelector } from '../components/ai/ModelSelector.jsx';

// The panel portals to <body>. At --z-dropdown (1000) it painted under a
// Dialog's scrim (--z-overlay, 1200), so a ModelSelector inside a Dialog
// opened invisibly. Floating panels that can sit inside dialogs use --z-popover.
describe('ModelSelector panel stacking', () => {
  it('sits above dialog overlays', () => {
    render(<ModelSelector models={[{ id: 'a', name: 'A' }]} value="a" />);
    const css = document.getElementById('ef-css-modelsel').textContent;
    const panel = css.match(/\.ef-modelsel__panel\{([^}]*)\}/)[1];
    expect(panel).toContain('z-index:var(--z-popover)');
    expect(css).not.toContain('--z-dropdown');
  });
});
