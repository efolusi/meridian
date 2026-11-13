// What scripts/smoke_headless.mjs applies before its group screenshots.

// Glyphs are hidden because headless Chromium 130 on the self-hosted runner stalls
// some /assets/icons/ fetches at random; their DOM is unaffected by paint, so forcing
// content-visibility below does not bring them back. Icon rendering is covered by the
// component tests. The summary banner carries the live demo count, which would churn
// baselines. content-visibility:auto (MessageScroller items) paints on an async
// on-screen judgement that moves while element screenshots scroll, so it is forced on.
export const CAPTURE_CSS = [
  '[data-slot="icon"] > svg { visibility: hidden !important; }',
  '#summary, h1, [data-live] { display: none !important; }',
  '* { content-visibility: visible !important; }',
].join('\n');

/** Before each group capture: fonts loaded, images decoded, then a frame pair to paint. */
export async function settleForCapture(page) {
  await page.evaluate(() => document.fonts.ready);
  await page.evaluate(() => Promise.all([...document.images].map(img => img.decode().catch(() => {}))));
  await page.evaluate(() => new Promise(r => requestAnimationFrame(() => requestAnimationFrame(r))));
}
