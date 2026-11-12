import React from 'react';
import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import { CodeBlock } from '../components/code/CodeBlock.jsx';

// The copy button is 24px tall. Controls reach --tap-min on coarse pointers
// (tokens/spacing.css); the copy button has to as well.
describe('CodeBlock copy button on touch', () => {
  it('meets --tap-min under pointer:coarse', () => {
    render(<CodeBlock lang="sh">npm i</CodeBlock>);
    const css = document.getElementById('ef-css-code').textContent.replace(/\s+/g, '');
    const block = css.match(/@media\(pointer:coarse\)\{(.*?\})\}/);
    expect(block).not.toBeNull();
    const rule = block[1].match(/\.ef-code__copy\{([^}]*)\}/)[1];
    expect(rule).toContain('min-height:var(--tap-min)');
    expect(rule).toContain('min-width:var(--tap-min)');
  });
});
