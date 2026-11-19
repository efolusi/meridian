// What scripts/smoke_headless.mjs applies before its group screenshots.

// Glyphs are captured: smoke_headless.mjs waits until every icon slot holds its SVG
// and fails the capture if one never arrives, so a baseline cannot lose its icons.
// The summary banner carries the live demo count, which would churn baselines. Only a top-level h1 is hidden, so a demo's own h1 (Hero) is captured. content-visibility:auto (MessageScroller items) paints on an async
// on-screen judgement that moves while element screenshots scroll, so it is forced on.
// Every animation jumps to its end state and transitions are off, so a capture never
// catches a stroke, lift or fade mid-way (HeroAccent's underline draws to its end).
export const CAPTURE_CSS = [
  '#summary, body > h1, [data-live] { display: none !important; }',
  '* { content-visibility: visible !important; }',
  '*, *::before, *::after { animation-duration: 0s !important; animation-delay: 0s !important; transition: none !important; }',
].join('\n');

/** Before each group capture: fonts loaded, images decoded, then a frame pair to paint. */
export async function settleForCapture(page) {
  await page.evaluate(() => document.fonts.ready);
  await page.evaluate(() => Promise.all([...document.images].map(img => img.decode().catch(() => {}))));
  await page.evaluate(() => new Promise(r => requestAnimationFrame(() => requestAnimationFrame(r))));
}
