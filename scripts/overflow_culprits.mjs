// The elements to blame when a page is wider than its viewport, for the starter smoke's failure message.
// Two kinds, because the cause is one of two:
//   1. an element whose right edge reaches past the viewport:   `div.card +45px`
//   2. an element whose text is wider than its own box (a title in a 0px grid column, PR 284):
//                                                               `h2.title scrollWidth 312 > clientWidth 0`
// A box that scrolls on purpose (overflow-x auto or scroll) is not a culprit. At most three of each kind, the worst first.
//
// The smoke hands this function to page.evaluate, which sends its source to the browser: keep it free of imports and of
// anything defined outside it. The tests pass a stand-in document.
export function overflowCulprits(doc = document) {
  const viewport = doc.documentElement.clientWidth;
  const view = doc.defaultView;
  const name = node => `${node.tagName.toLowerCase()}${node.id ? '#' + node.id : ''}${node.className && typeof node.className === 'string' ? '.' + node.className.trim().split(/\s+/).join('.') : ''}`;
  const nodes = [...doc.body.querySelectorAll('*')];
  const pastEdge = nodes
    .map(node => ({ node, over: Math.round((node.getBoundingClientRect().right - viewport) * 100) / 100 }))
    .filter(({ over }) => over > 0.5)
    .sort((a, b) => b.over - a.over).slice(0, 3)
    .map(({ node, over }) => `${name(node)} +${over}px`);
  const wideText = nodes
    .filter(node => node.scrollWidth > node.clientWidth && !['auto', 'scroll'].includes(view.getComputedStyle(node).overflowX))
    .sort((a, b) => (b.scrollWidth - b.clientWidth) - (a.scrollWidth - a.clientWidth)).slice(0, 3)
    .map(node => `${name(node)} scrollWidth ${node.scrollWidth} > clientWidth ${node.clientWidth}`);
  return [...pastEdge, ...wideText];
}
