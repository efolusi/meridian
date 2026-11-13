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

  it('carries component units only; showcase pages compile their own sources', () => {
    const bundle = fs.readFileSync(path.join(ROOT, '_ds_bundle.js'), 'utf8');
    const header = JSON.parse(bundle.slice(bundle.indexOf('{'), bundle.indexOf(' */')));
    const units = Object.keys(header.sourceHashes);
    expect(units.length).toBeGreaterThan(0);
    expect(units.filter(rel => !rel.startsWith('components/'))).toEqual([]);
    expect(bundle).not.toMatch(/^\/\/ showcases\//m);
  });

  it('every showcase page loads each of its own .jsx sources', () => {
    for (const app of fs.readdirSync(path.join(ROOT, 'showcases'))) {
      const dir = path.join(ROOT, 'showcases', app);
      if (!fs.statSync(dir).isDirectory()) continue;
      const html = fs.readFileSync(path.join(dir, 'index.html'), 'utf8');
      for (const jsx of fs.readdirSync(dir).filter(f => f.endsWith('.jsx'))) {
        expect(html, `showcases/${app}/index.html loads ${jsx}`).toMatch(new RegExp(`<script type="text/babel" src="${jsx.replace('.', '\\.')}(\\?[^"]*)?"`));
      }
    }
  });
});
