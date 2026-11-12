import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, act } from '@testing-library/react';
import { Citation, SourceList } from '../components/ai/Citation.jsx';
import { SourceCard } from '../components/ai/SourceCard.jsx';
import { WebPreview } from '../components/ai/WebPreview.jsx';

// Display-area review, 2026-11-12. Each block failed before its fix.

describe('model-supplied URLs cannot run script', () => {
  const evil = 'javascript:alert(document.cookie)';
  const hrefs = container => [...container.querySelectorAll('a[href], iframe[src]')].map(el => el.getAttribute('href') || el.getAttribute('src'));
  const noScript = container => hrefs(container).forEach(h => expect(h.replace(/\s/g, '').toLowerCase()).not.toMatch(/^(javascript|vbscript|data):/));
  it('Citation href and source urls', () => {
    const { container } = render(<><Citation index={1} href={evil} /><Citation index={2} sources={[{ url: ' JaVaScRiPt:alert(1)', title: 't' }]} /></>);
    noScript(container);
  });
  it('SourceList items', () => {
    const { container } = render(<SourceList sources={[{ url: evil, title: 'x' }, { url: 'https://ok.example/a', title: 'ok' }]} />);
    noScript(container);
    expect(hrefs(container)).toContain('https://ok.example/a');
  });
  it('SourceCard', () => {
    const { container } = render(<SourceCard href={'data:text/html,<script>alert(1)</script>'} title="x" />);
    noScript(container);
  });
  it('WebPreview iframe and open link', () => {
    const { container } = render(<WebPreview url={evil} />);
    noScript(container);
  });
  it('keeps http(s), mailto and relative urls', () => {
    const { container } = render(<SourceList sources={[{ url: 'http://a.example', title: 'a' }, { url: '/docs/x', title: 'b' }, { url: 'mailto:x@y.z', title: 'c' }, { url: '#ref', title: 'd' }]} />);
    expect(hrefs(container)).toEqual(['http://a.example', '/docs/x', 'mailto:x@y.z', '#ref']);
  });
});

