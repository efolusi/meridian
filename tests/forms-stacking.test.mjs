// Popups that portal to <body> must stack above a Dialog (overlay 1200,
// modal 1300), or opening one inside a Dialog paints it under the scrim.
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';

const effects = readFileSync(join(process.cwd(), 'tokens/effects.css'), 'utf8');
const layer = name => Number(new RegExp(`${name}:(\\d+)`).exec(effects)[1]);

function zIndexOf(file, selector) {
  const source = readFileSync(join(process.cwd(), 'components', file), 'utf8');
  const at = source.indexOf(`${selector}{`);
  expect(at, `${selector} in ${file}`).toBeGreaterThan(-1);
  const body = source.slice(at, source.indexOf('}', at));
  const token = /z-index:var\((--z-[\w-]+)\)/.exec(body)?.[1];
  expect(token, `${selector} z-index token`).toBeTruthy();
  return layer(token);
}

describe('portalled form popups stack above dialogs', () => {
  for (const [file, selector] of [
    ['forms/Select.jsx', '.ef-select-content'],
    ['dates/TimePicker.jsx', '.ef-timepicker__panel'],
    ['forms/Combobox.jsx', '.ef-combobox__content'],
  ]) {
    it(`${selector} sits above --z-modal`, () => {
      expect(zIndexOf(file, selector)).toBeGreaterThan(layer('--z-modal'));
    });
  }
});
