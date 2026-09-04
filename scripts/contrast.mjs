import assert from 'node:assert/strict';

export function luminance(color) {
  const match = /^rgb\(\s*(\d+(?:\.\d+)?)\s*,\s*(\d+(?:\.\d+)?)\s*,\s*(\d+(?:\.\d+)?)\s*\)$/.exec(color);
  assert.ok(match, `expected opaque computed RGB, got ${color}`);
  const linear = match.slice(1).map(value => {
    const channel = Number(value) / 255;
    assert.ok(channel >= 0 && channel <= 1, 'RGB channel outside range');
    return channel <= .04045 ? channel / 12.92 : ((channel + .055) / 1.055) ** 2.4;
  });
  return .2126 * linear[0] + .7152 * linear[1] + .0722 * linear[2];
}

export function contrast(foreground, background) {
  const a = luminance(foreground), b = luminance(background);
  return (Math.max(a, b) + .05) / (Math.min(a, b) + .05);
}
