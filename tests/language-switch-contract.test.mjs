// @vitest-environment node
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { JSDOM } from 'jsdom';
import React from 'react';
import ReactDOM from 'react-dom';
import { describe, expect, it } from 'vitest';

// MD112: LanguageSwitch is a public export of the marketing group: in the bundle, the manifest, the registry, the
// type file, the prompt and the Indonesian descriptions.
const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const read = (rel) => fs.readFileSync(path.join(ROOT, rel), 'utf8');

describe('LanguageSwitch is exported (MD112)', () => {
  it('the bundle puts it in the namespace', () => {
    const { window } = new JSDOM('<!doctype html><html><head></head><body></body></html>', { runScripts: 'outside-only' });
    window.React = React;
    window.ReactDOM = ReactDOM;
    window.eval(read('_ds_bundle.js'));
    const ns = window.EfolusiDesignSystem_4ffc3d;
    expect(ns.__errors).toEqual([]);
    expect(ns.LanguageSwitch).toBeTruthy();
    expect(ns.LanguageSwitch.$$typeof).toBe(Symbol.for('react.forward_ref'));
  });

  it('the manifest, the registry and the docs registry list it in the marketing group', () => {
    const manifest = JSON.parse(read('_ds_manifest.json'));
    expect(manifest.components).toContainEqual({ name: 'LanguageSwitch', sourcePath: 'components/marketing/LanguageSwitch.jsx' });
    expect(read('registry.json')).toContain('"name": "languageswitch"');
    expect(fs.existsSync(path.join(ROOT, 'site/registry/languageswitch.json'))).toBe(true);
    expect(read('site/registry.js')).toContain('"name":"LanguageSwitch"');
  });

  it('ships the type file, the prompt and the Indonesian description', () => {
    expect(read('components/marketing/LanguageSwitch.d.ts')).toContain('export declare const LanguageSwitch');
    expect(read('components/marketing/LanguageSwitch.prompt.md')).toMatch(/^# LanguageSwitch/);
    expect(JSON.parse(read('site/descriptions.id.json')).LanguageSwitch).toBeTruthy();
  });

  it('has a docs example', () => {
    expect(read('site/examples/marketing.jsx')).toContain('// @demo LanguageSwitch ');
  });
});
