// MD93: the password reveal button inside Input was a fixed --radius-sm (10px) square-ish button in a field whose
// corners follow data-shape. A button inset by 4px from the field edge is concentric with it when its radius is the
// field radius minus that inset, so it follows --field-radius (16px under data-shape="pill") and stays out of
// --press-radius, which is the radius of things you press on their own, not of a part inside a field.
import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

const css = /const CSS = `([\s\S]*?)`;/.exec(readFileSync('components/forms/Input.jsx', 'utf8'))[1];
const rule = (selector) => {
  const match = new RegExp(`(?:^|\\n)${selector.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\{([^}]*)\\}`).exec(css);
  expect(match, `${selector} rule`).not.toBeNull();
  return match[1];
};
const declaration = (body, property) => new RegExp(`(?:^|;)${property}:([^;]*)`).exec(body)?.[1];

describe('the reveal button is concentric with the field (MD93)', () => {
  const reveal = rule('.ef-input__reveal');
  const inset = declaration(reveal, 'inset-inline-end');

  it('reads the field radius minus its own inset, with today\'s field radius as the fallback', () => {
    expect(declaration(reveal, 'border-radius')).toBe(`calc(var(--field-radius,var(--radius-sm)) - ${inset})`);
  });

  it('uses the same inset value for the position and for the radius, so they cannot drift apart', () => {
    expect(inset).toBe('var(--space-1)');
  });

  it('stays out of --press-radius', () => {
    expect(reveal).not.toContain('--press-radius');
  });

  it('keeps its size: --control-h-sm square, as before', () => {
    expect(declaration(reveal, 'width')).toBe('var(--control-h-sm)');
    expect(declaration(reveal, 'height')).toBe('var(--control-h-sm)');
  });
});
