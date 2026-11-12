// @vitest-environment node
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { JSDOM } from 'jsdom';
import React from 'react';
import ReactDOM from 'react-dom';
import { describe, expect, it } from 'vitest';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

describe('_ds_bundle.js globals', () => {
  it('adds only its namespace to window', () => {
    const { window } = new JSDOM('<!doctype html><html><head></head><body></body></html>', { runScripts: 'outside-only' });
    window.React = React;
    window.ReactDOM = ReactDOM;
    const before = new Set(Object.getOwnPropertyNames(window));
    window.eval(fs.readFileSync(path.join(ROOT, '_ds_bundle.js'), 'utf8'));
    const added = Object.getOwnPropertyNames(window).filter(name => !before.has(name));
    expect(added).toEqual(['EfolusiDesignSystem_4ffc3d']);
    expect(window.EfolusiDesignSystem_4ffc3d.__errors).toEqual([]);
  });
});
