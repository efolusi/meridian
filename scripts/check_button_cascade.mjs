// Real Chromium regression: anchor buttons must match native buttons in both themes.
// Optional argv[2] is an installed playwright entrypoint; no server/network needed.
import { mkdir, readFile } from 'node:fs/promises';
import assert from 'node:assert/strict';
import path from 'node:path';
import { contrast } from './contrast.mjs';
const { chromium } = await import(process.argv[2] || 'playwright');
const root = new URL('../', import.meta.url);
const names = ['colors', 'typography', 'spacing', 'effects', 'base'];
const tokens = (await Promise.all(names.map(n=>readFile(new URL(`tokens/${n}.css`,root),'utf8')))).join('\n');
const source = await readFile(new URL('components/forms/Button.jsx',root),'utf8');
const css = source.match(/const CSS = `([\s\S]*?)`;/)?.[1];
assert.ok(css, 'Button source CSS must be present');
const shots = process.env.BUTTON_SHOTS || '';
const viewports = [
  { name: 'mobile', width: 375, height: 812 },
  { name: 'desktop', width: 1280, height: 800 },
];
if (shots) await mkdir(shots, { recursive: true });
// Equal anchor/native styles are insufficient: both can be unreadable.
// Filled variants have opaque computed colors; reject an unexpected format
// instead of silently treating a transparent background as white.
const browser = await chromium.launch(process.env.EXECUTABLE_PATH ? {executablePath:process.env.EXECUTABLE_PATH} : {});
try {
  let page;
  const variants=['primary','secondary','ghost','danger','brand','outline','destructive','link'];
  let checks=0;
  for(const viewport of viewports) for(const theme of ['light','dark']) {
    const receiptCss=`body{margin:0;padding:var(--space-6);background:var(--surface-page);color:var(--text-primary);font-family:var(--font-sans)}h1{margin:0 0 var(--space-6);font-family:var(--font-display);font-size:var(--text-2xl)}.matrix{display:grid;gap:var(--space-4);max-width:820px}.row{display:grid;grid-template-columns:96px repeat(4,max-content);gap:var(--space-2);align-items:center}.label{font-size:var(--text-sm);font-weight:var(--weight-semibold)}.extras{display:flex;align-items:center;gap:var(--space-4);margin-top:var(--space-6)}@media(max-width:600px){body{padding:var(--space-4)}.row{grid-template-columns:1fr 1fr}.label{grid-column:1/-1}.row .ef-btn{width:100%}.extras{align-items:flex-start;flex-direction:column}}`;
    const fixture=`<!doctype html><html data-theme="${theme}"><head><style>${tokens}\n@layer meridian{${css}}\n${receiptCss}</style></head><body><h1>Button interaction contract</h1><main class="matrix">${variants.map(v=>`<div class="row"><span class="label">${v}</span><a id="a-${v}" href="#" class="ef-btn ef-btn--${v} ef-btn--md">Anchor</a><button id="b-${v}" class="ef-btn ef-btn--${v} ef-btn--md">Native</button><a id="ad-${v}" role="button" aria-disabled="true" class="ef-btn ef-btn--${v} ef-btn--md">Disabled</a><button id="bd-${v}" disabled class="ef-btn ef-btn--${v} ef-btn--md">Disabled</button></div>`).join('')}</main><div class="extras"><button id="loading" disabled aria-busy="true" data-loading class="ef-btn ef-btn--primary ef-btn--md"><span class="ef-btn__spin" aria-hidden="true">⟳</span>Loading</button><a id="plain" href="#">Plain link</a></div></body></html>`;
    for(const variant of variants) for(const state of ['normal','hover','focus','active']) {
      const observed=[];
      for(const prefix of ['a','b']) {
        // Each measurement starts with a fresh browsing context: no previous
        // pressed anchor, focus, selection or pointer capture can leak into it.
        await page?.close();
        page=await browser.newPage({viewport,reducedMotion:'reduce'});
        await page.route('**/*',route=>route.abort());
        await page.setContent(fixture);
        assert.equal(await page.evaluate(()=>document.compatMode),'CSS1Compat','test real standards-mode component behavior');
        await page.evaluate(()=>document.addEventListener('click',event=>event.preventDefault()));
        await page.mouse.move(0,0);
        await page.evaluate(()=>document.activeElement?.blur());
        const target=page.locator(`#${prefix}-${variant}`);
        if(state==='hover') await target.hover();
        if(state==='focus') await target.focus();
        if(state==='active') {
          await page.evaluate(()=>{
            window.__pointerEvidence=[];
            for(const name of ['pointerdown','mousedown','focusin','pointerup','mouseup']) document.addEventListener(name,event=>window.__pointerEvidence.push({type:event.type,target:event.target.id,active:[...document.querySelectorAll(':active')].map(el=>el.id||el.tagName)}),{once:true});
          });
          await target.hover(); await page.mouse.down();
        }
        await page.waitForTimeout(30);
        try {
          if(state==='active') assert.equal(await target.evaluate(el=>el.matches(':active')),true,`${theme}/${variant}/${prefix}: pointer must actually activate the tested control; ${JSON.stringify(await page.evaluate(()=>window.__pointerEvidence))}`);
          observed.push(await target.evaluate(el=>{const s=getComputedStyle(el);return Object.fromEntries(['color','backgroundColor','borderRadius','fontFamily','fontSize','fontWeight','lineHeight','gap','padding','height'].map(k=>[k,s[k]]));}));
        } finally {
          if(state==='active') await page.mouse.up();
        }
      }
      assert.deepEqual(observed[0],observed[1],`${theme}/${variant}/${state} anchor/native mismatch`);
      if (['primary','brand','danger','destructive'].includes(variant)) {
        for (const styles of observed) {
          const ratio = contrast(styles.color, styles.backgroundColor);
          assert.ok(ratio >= 4.5, `${theme}/${variant}/${state} text contrast ${ratio.toFixed(2)}:1 is below 4.5:1`);
        }
      }
      checks++;
    }
    await page?.close();
    page=await browser.newPage({viewport,reducedMotion:'reduce'});
    await page.setContent(fixture);
    const expected=await page.evaluate(()=>{const el=document.createElement('span');el.style.cssText='color:var(--text-link);border-radius:var(--radius-sm);font-family:var(--font-sans);font-size:var(--text-md);font-weight:var(--weight-semibold);line-height:var(--leading-normal)';const hover=document.createElement('span');hover.style.color='var(--text-link-hover)';document.body.append(el,hover);const s=getComputedStyle(el);const out={link:s.color,linkHover:getComputedStyle(hover).color,radius:s.borderRadius,fontFamily:s.fontFamily,fontSize:s.fontSize,fontWeight:s.fontWeight,lineHeight:s.lineHeight};el.remove();hover.remove();return out;});
    const plain=page.locator('#plain');
    assert.equal(await plain.evaluate(el=>getComputedStyle(el).color),expected.link,`${theme}: plain link token`);
    await plain.hover();
    await page.waitForTimeout(30);
    assert.equal(await plain.evaluate(el=>getComputedStyle(el).color),expected.linkHover,`${theme}: plain link hover token`);
    const primary=page.locator('#b-primary');
    const primaryStyle=await primary.evaluate(el=>{const s=getComputedStyle(el);return {radius:s.borderRadius,fontFamily:s.fontFamily,fontSize:s.fontSize,fontWeight:s.fontWeight,lineHeight:s.lineHeight,gap:s.gap,transitionDuration:s.transitionDuration};});
    for(const key of ['radius','fontFamily','fontSize','fontWeight','lineHeight']) assert.equal(primaryStyle[key],expected[key],`${theme}: button ${key} must resolve Meridian token`);
    assert.equal(primaryStyle.gap,'8px',`${theme}: button gap must stay on the 4px spacing grid`);
    assert.ok(primaryStyle.transitionDuration.split(',').every(value=>parseFloat(value)<=.01),`${theme}: reduced motion must collapse button transitions`);
    await page.keyboard.press('Tab');
    await page.waitForTimeout(30);
    const anchorFocus=await page.locator('#a-primary').evaluate(el=>getComputedStyle(el).boxShadow);
    await page.keyboard.press('Tab');
    await page.waitForTimeout(30);
    const nativeFocus=await page.locator('#b-primary').evaluate(el=>getComputedStyle(el).boxShadow);
    assert.equal(anchorFocus,nativeFocus,`${theme}: keyboard focus ring must match for anchor/native buttons`);
    assert.notEqual(anchorFocus,'none',`${theme}: keyboard focus ring must remain visible`);
    for(const variant of variants) {
      const anchor=page.locator(`#ad-${variant}`);
      const native=page.locator(`#bd-${variant}`);
      const pair=await Promise.all([anchor,native].map(target=>target.evaluate(el=>{const s=getComputedStyle(el);return {color:s.color,backgroundColor:s.backgroundColor,opacity:s.opacity,cursor:s.cursor,pointerEvents:s.pointerEvents,borderRadius:s.borderRadius,fontSize:s.fontSize,padding:s.padding,height:s.height};})));
      assert.deepEqual(pair[0],pair[1],`${theme}/${variant}: disabled anchor/native mismatch`);
      assert.equal(pair[0].pointerEvents,'none',`${theme}/${variant}: disabled anchor must reject pointer activation`);
      assert.equal(await anchor.getAttribute('href'),null,`${theme}/${variant}: disabled anchor fixture must not remain navigable`);
    }
    const loading=page.locator('#loading');
    assert.equal(await loading.getAttribute('aria-busy'),'true',`${theme}: loading semantics`);
    assert.equal(await loading.isDisabled(),true,`${theme}: loading button must be inoperable`);
    assert.ok(parseFloat(await loading.locator('.ef-btn__spin').evaluate(el=>getComputedStyle(el).animationDuration))<=.01,`${theme}: reduced motion must collapse spinner animation`);
    const overflow=await page.evaluate(()=>document.documentElement.scrollWidth-document.documentElement.clientWidth);
    assert.ok(overflow<=1,`${theme}/${viewport.name}: button fixture overflows horizontally by ${overflow}px`);
    if(shots) await page.screenshot({path:path.join(shots,`buttons-${viewport.name}-${theme}.png`),fullPage:true,animations:'disabled'});
  }
  console.log(`button cascade: ${checks} breakpoint/theme/variant/state comparisons passed; plain links preserved; ${shots ? `${viewports.length * 2} visual receipts captured` : 'visual capture disabled'}`);
} finally { await browser.close(); }
