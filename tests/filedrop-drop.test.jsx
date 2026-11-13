import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, act } from '@testing-library/react';
import { FileDrop } from '../components/files/FileDrop.jsx';

// Display-area review, 2026-11-12. Each block failed before its fix.

describe('FileDrop drop path honours accept and multiple', () => {
  const file = (name, type) => new File(['x'], name, { type });
  const drop = (el, files) => fireEvent.drop(el, { dataTransfer: { files, types: ['Files'] } });
  it('filters dropped files by accept (mime wildcard and extension)', () => {
    const onFiles = vi.fn();
    render(<FileDrop onFiles={onFiles} accept="image/*,.pdf" />);
    drop(screen.getByRole('button'), [file('a.png', 'image/png'), file('b.exe', 'application/x-msdownload'), file('C.PDF', 'application/pdf')]);
    expect(onFiles.mock.calls[0][0].map(f => f.name)).toEqual(['a.png', 'C.PDF']);
  });
  it('passes only one file when multiple is false', () => {
    const onFiles = vi.fn();
    render(<FileDrop onFiles={onFiles} multiple={false} />);
    drop(screen.getByRole('button'), [file('a.txt', 'text/plain'), file('b.txt', 'text/plain')]);
    expect(onFiles.mock.calls[0][0]).toHaveLength(1);
  });
  it('does not call onFiles when nothing dropped is accepted', () => {
    const onFiles = vi.fn();
    render(<FileDrop onFiles={onFiles} accept="image/png" />);
    drop(screen.getByRole('button'), [file('b.exe', 'application/octet-stream')]);
    expect(onFiles).not.toHaveBeenCalled();
  });
});

