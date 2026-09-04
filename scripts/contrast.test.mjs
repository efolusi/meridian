import { test } from 'node:test';
import assert from 'node:assert/strict';
import { contrast, luminance } from './contrast.mjs';

test('known opaque ratios and symmetry', () => {
  assert.equal(contrast('rgb(0, 0, 0)', 'rgb(255, 255, 255)'), 21);
  assert.equal(contrast('rgb(44, 23, 9)', 'rgb(44, 23, 9)'), 1);
  assert.equal(contrast('rgb(44, 23, 9)', 'rgb(255, 255, 255)'), contrast('rgb(255, 255, 255)', 'rgb(44, 23, 9)'));
});
test('normal text threshold rejects near-borderline grey on white', () => {
  assert.ok(contrast('rgb(118, 118, 118)', 'rgb(255, 255, 255)') >= 4.5);
  assert.ok(contrast('rgb(119, 119, 119)', 'rgb(255, 255, 255)') < 4.5);
});
test('unresolved, transparent and invalid colors cannot pass', () => {
  for (const color of ['transparent', 'rgba(0,0,0,0)', 'var(--text)', 'rgb(256,0,0)', 'rgb(-1,0,0)', '#fff']) {
    assert.throws(() => luminance(color));
  }
});
