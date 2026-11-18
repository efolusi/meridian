import React from 'react';
import { render, waitFor } from '@testing-library/react';

// Every Icon instance used to fetch its own copy of an uncached glyph, so a
// page with twelve "plus" buttons sent twelve identical requests at once.
// Chromium 130 queues identical in-flight requests behind one cache lock and
// some never resolved, leaving blank icons in CI screenshots. One request per
// name is enough; every instance shares its result.
describe('Icon fetches each glyph once', () => {
  let Icon;
  beforeEach(async () => {
    vi.resetModules();
    ({ Icon } = await import('../components/icons/Icon.jsx'));
  });
  afterEach(() => { vi.unstubAllGlobals(); });

  it('shares one request between instances that mount together', async () => {
    const fetchMock = vi.fn(() => Promise.resolve({ ok: true, status: 200, text: () => Promise.resolve('<svg width="24" height="24" stroke-width="2"></svg>') }));
    vi.stubGlobal('fetch', fetchMock);
    const { container } = render(<div>{Array.from({ length: 12 }, (_, i) => <Icon key={i} name="plus" />)}</div>);
    await waitFor(() => expect(container.querySelectorAll('[data-slot="icon"] svg')).toHaveLength(12));
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  it('retries a glyph after a network failure instead of caching it as blank', async () => {
    const fetchMock = vi.fn()
      .mockImplementationOnce(() => Promise.reject(new TypeError('Failed to fetch')))
      .mockImplementation(() => Promise.resolve({ ok: true, status: 200, text: () => Promise.resolve('<svg></svg>') }));
    vi.stubGlobal('fetch', fetchMock);
    const first = render(<Icon name="bell" />);
    await waitFor(() => expect(fetchMock).toHaveBeenCalledTimes(1));
    first.unmount();
    const second = render(<Icon name="bell" />);
    await waitFor(() => expect(second.container.querySelector('svg')).not.toBeNull());
    expect(fetchMock).toHaveBeenCalledTimes(2);
  });

  it('retries a reset connection within the same mount before giving up', async () => {
    const fetchMock = vi.fn()
      .mockImplementationOnce(() => Promise.reject(new TypeError('net::ERR_CONNECTION_RESET')))
      .mockImplementationOnce(() => Promise.reject(new TypeError('net::ERR_CONNECTION_RESET')))
      .mockImplementation(() => Promise.resolve({ ok: true, status: 200, text: () => Promise.resolve('<svg></svg>') }));
    vi.stubGlobal('fetch', fetchMock);
    const { container } = render(<div><Icon name="star" /><Icon name="star" /></div>);
    await waitFor(() => expect(container.querySelectorAll('svg')).toHaveLength(2), { timeout: 3000 });
    expect(fetchMock).toHaveBeenCalledTimes(3);
  });

  it('still remembers a 404 so a wrong name is not refetched', async () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
    const fetchMock = vi.fn(() => Promise.resolve({ ok: false, status: 404, text: () => Promise.resolve('') }));
    vi.stubGlobal('fetch', fetchMock);
    const first = render(<Icon name="not-a-glyph" />);
    await waitFor(() => expect(fetchMock).toHaveBeenCalledTimes(1));
    await new Promise(r => setTimeout(r, 0));
    first.unmount();
    render(<Icon name="not-a-glyph" />);
    await new Promise(r => setTimeout(r, 0));
    expect(fetchMock).toHaveBeenCalledTimes(1);
    warn.mockRestore();
  });
});
