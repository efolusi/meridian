import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import { SegmentedControl } from '../components/navigation/SegmentedControl.jsx';

// Options are 28px tall. Form controls reach the 44px touch target because
// their height comes from --control-h-*, which tokens/spacing.css raises to
// --tap-min under (pointer: coarse); the segment height was a fixed 28px, so
// on a phone every option stayed a 28px target. jsdom cannot evaluate media
// queries, so the injected stylesheet is read instead.
describe('SegmentedControl touch target', () => {
  it('raises options to --tap-min on a coarse pointer and keeps 28px otherwise', () => {
    render(<SegmentedControl options={['Day', 'Week']} value="Day" onChange={() => {}} />);
    const css = document.getElementById('ef-css-seg').textContent.replace(/\s+/g, '');
    const coarse = css.match(/@media\(pointer:coarse\)\{([^@]*?)\}\}/);
    expect(coarse, 'a (pointer: coarse) block').toBeTruthy();
    expect(coarse[1]).toMatch(/\.ef-seg__opt\{[^}]*(min-height|height):var\(--tap-min\)/);
    expect(css).toMatch(/\.ef-seg__opt\{[^}]*height:28px/);
  });
});
