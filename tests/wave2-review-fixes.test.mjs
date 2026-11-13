import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

const read = f => readFileSync(f, 'utf8');

describe('wave 2 pre-release review fixes', () => {
  it('form-control hover darkens the edge instead of fading it below 3:1', () => {
    for (const f of ['components/forms/Input.jsx', 'components/forms/Textarea.jsx', 'components/forms/NumberInput.jsx', 'components/forms/Select.jsx', 'components/dates/TimePicker.jsx']) {
      const src = read(f);
      expect(src, f).not.toMatch(/:hover[^{]*\{border-color:var\(--sand-400\)\}/);
      expect(src, f).toMatch(/border-color:var\(--border-control-hover/);
    }
    const colors = read('tokens/colors.css');
    expect(colors).toMatch(/--border-control-hover:var\(--sand-700\)/);
    expect(colors).toMatch(/--border-control-hover:var\(--sand-400\)/);
  });

  it('PageControl dots wrap on coarse pointers instead of overflowing a phone', () => {
    expect(read('components/navigation/PageControl.jsx')).toMatch(/@media \(pointer:coarse\)\{\.ef-dots\{flex-wrap:wrap/);
  });

  it('the Drawer deprecation guard uses a bare process.env.NODE_ENV that bundlers fold', () => {
    const src = read('components/overlay/Drawer.jsx');
    expect(src).not.toMatch(/typeof process !== 'undefined' && process\.env && process\.env\.NODE_ENV === 'production'/);
    expect(src).toMatch(/try \{ if \(process\.env\.NODE_ENV === 'production'\) return; \}/);
  });

  it('the fictional Fernwick docs never name an Efolusi environment variable', () => {
    expect(read('showcases/docs/DocsScreen.jsx')).not.toMatch(/EFOLUSI_/);
  });
});
