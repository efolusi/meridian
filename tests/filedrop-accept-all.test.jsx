import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { FileDrop } from '../components/files/FileDrop.jsx';

// accept="*/*" rejected every file (wave 1 regression), killing the upload showcase.
const file = (name, type) => new File(['x'], name, { type });
const drop = (el, files) => fireEvent.drop(el, { dataTransfer: { files, types: ['Files'] } });
describe('FileDrop accept-all', () => {
  it.each(['*/*', '', ' , ', '*/*,.pdf'])('accept=%j takes any file', accept => {
    const onFiles = vi.fn();
    render(<FileDrop onFiles={onFiles} accept={accept} />);
    drop(screen.getByRole('button'), [file('a.bin', 'application/octet-stream'), file('b', '')]);
    expect(onFiles.mock.calls[0][0]).toHaveLength(2);
  });
  it('still filters MIME wildcards and extensions case-insensitively', () => {
    const onFiles = vi.fn();
    render(<FileDrop onFiles={onFiles} accept="IMAGE/*,.PDF" />);
    drop(screen.getByRole('button'), [file('a.png', 'image/png'), file('b.Pdf', 'application/pdf'), file('c.exe', 'application/x-msdownload')]);
    expect(onFiles.mock.calls[0][0].map(f => f.name)).toEqual(['a.png', 'b.Pdf']);
  });
});
