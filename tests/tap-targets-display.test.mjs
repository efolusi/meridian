import { readFileSync } from 'node:fs';
import { describe, it, expect } from 'vitest';

// Fixed-size controls under 44px in the display area. On coarse pointers each
// must reach --tap-min, as the form controls do through tokens/spacing.css.
// The inline Citation chip is exempt (WCAG 2.5.8 inline target).
const SQUARE = { both: true };
const TALL = { both: false };
const TARGETS = [
  ['ai/Citation.jsx', '.ef-citation__pop-btn', SQUARE],
  ['ai/Confirmation.jsx', '.ef-confirm__btn', TALL],
  ['ai/Conversation.jsx', '.ef-conversation__jump', TALL],
  ['ai/DocumentCard.jsx', '.ef-doccard__btn', SQUARE],
  ['ai/FeedbackBar.jsx', '.ef-feedback__btn', SQUARE],
  ['ai/GeneratedImage.jsx', '.ef-genimg__act', SQUARE],
  ['ai/MessageScroller.jsx', '.ef-message-scroller__button', SQUARE],
  ['ai/ModelSelector.jsx', '.ef-modelsel__btn', TALL],
  ['ai/Player.jsx', '.ef-player__btn', SQUARE],
  ['ai/PromptComposer.jsx', '.ef-composer__send', SQUARE],
  ['ai/RichComposer.jsx', '.ef-richcomposer__send', SQUARE],
  ['ai/Sandbox.jsx', '.ef-sandbox__tab', TALL],
  ['ai/ToolCall.jsx', '.ef-toolcall__btn', TALL],
  ['ai/WebPreview.jsx', '.ef-webprev__btn', SQUARE],
  ['code/EnvList.jsx', '.ef-env__btn', SQUARE],
  ['display/Carousel.jsx', '.ef-carousel__nav', SQUARE],
  ['display/Toolbar.jsx', '.ef-toolbar__btn', SQUARE],
  ['display/TreeList.jsx', '.ef-tree__row', TALL],
];

const coarseBlocks = src => {
  const out = [];
  const re = /@media\s*\(pointer:\s*coarse\)\s*\{/g;
  let m;
  while ((m = re.exec(src))) {
    let depth = 1, i = re.lastIndex;
    while (depth && i < src.length) { if (src[i] === '{') depth++; else if (src[i] === '}') depth--; i++; }
    out.push(src.slice(re.lastIndex, i - 1).replace(/\s+/g, ''));
  }
  return out.join('');
};

describe('display-area hit targets on coarse pointers', () => {
  it.each(TARGETS)('%s %s reaches --tap-min', (file, sel, kind) => {
    const css = coarseBlocks(readFileSync(new URL(`../components/${file}`, import.meta.url), 'utf8'));
    const rule = css.match(new RegExp(sel.replace(/[.]/g, '\\.') + '(?:,[^{]*)?\\{([^}]*)\\}'));
    expect(rule, `${sel} has no pointer:coarse rule`).not.toBeNull();
    expect(rule[1]).toContain('min-height:var(--tap-min)');
    if (kind.both) expect(rule[1]).toContain('min-width:var(--tap-min)');
  });
  it('Tag remove button gets a 44px hit area without growing the tag', () => {
    const css = coarseBlocks(readFileSync(new URL('../components/display/Tag.jsx', import.meta.url), 'utf8'));
    expect(css).toMatch(/\.ef-tag__x::after\{[^}]*inset:calc\(\(20px-var\(--tap-min\)\)\/2\)/);
    expect(css).toMatch(/\.ef-tag__x\{[^}]*position:relative/);
  });
});
