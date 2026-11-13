import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { FileDrop } from '../components/files/FileDrop.jsx';

// Rejected files used to vanish without a trace, and there was no size limit.
const file = (name, type, bytes = 1) => new File(['x'.repeat(bytes)], name, { type });
const drop = (el, files) => fireEvent.drop(el, { dataTransfer: { files, types: ['Files'] } });

describe('FileDrop reports what it rejects', () => {
  it('rejects files over maxSize with reason size, keeps the rest', () => {
    const onFiles = vi.fn(), onReject = vi.fn();
    render(<FileDrop onFiles={onFiles} onReject={onReject} maxSize={10} />);
    drop(screen.getByRole('button'), [file('small.txt', 'text/plain', 5), file('big.txt', 'text/plain', 50)]);
    expect(onFiles.mock.calls[0][0].map(f => f.name)).toEqual(['small.txt']);
    expect(onReject).toHaveBeenCalledWith([expect.objectContaining({ name: 'big.txt' })], 'size');
  });
  it('reports a type mismatch with reason type', () => {
    const onReject = vi.fn();
    render(<FileDrop onFiles={() => {}} onReject={onReject} accept="image/*" />);
    drop(screen.getByRole('button'), [file('a.exe', 'application/octet-stream')]);
    expect(onReject).toHaveBeenCalledWith([expect.objectContaining({ name: 'a.exe' })], 'type');
  });
  it('reports extras beyond a single file with reason count', () => {
    const onFiles = vi.fn(), onReject = vi.fn();
    render(<FileDrop onFiles={onFiles} onReject={onReject} multiple={false} />);
    drop(screen.getByRole('button'), [file('a.txt', 'text/plain'), file('b.txt', 'text/plain')]);
    expect(onFiles.mock.calls[0][0].map(f => f.name)).toEqual(['a.txt']);
    expect(onReject).toHaveBeenCalledWith([expect.objectContaining({ name: 'b.txt' })], 'count');
  });
  it('applies maxSize to files picked through the dialog too', () => {
    const onFiles = vi.fn(), onReject = vi.fn();
    const { container } = render(<FileDrop onFiles={onFiles} onReject={onReject} maxSize={10} />);
    const input = container.querySelector('input[type="file"]');
    fireEvent.change(input, { target: { files: [file('big.bin', 'application/octet-stream', 50)] } });
    expect(onFiles).not.toHaveBeenCalled();
    expect(onReject).toHaveBeenCalledWith([expect.objectContaining({ name: 'big.bin' })], 'size');
  });
});
