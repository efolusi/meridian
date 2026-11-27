// MD74 review: the consumer list in CHANGELOG.md names what a consumer has to do or can see, item by item.
import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

const changelog = readFileSync('CHANGELOG.md', 'utf8');
const unreleased = changelog.slice(changelog.indexOf('## Unreleased'), changelog.indexOf('\n## v2.4.0'));

describe('the Unreleased consumer list covers the MD74 review items', () => {
  it('says a third-party or wrapped icon in an Alert needs data-slot="icon" or icon={false}', () => {
    expect(unreleased).toMatch(/third-party or wrapped icon[^.]*data-slot="icon"[^.]*icon=\{false\}/);
  });
  it('says the ref and attribute type of CardTitle moved to HTMLHeadingElement', () => {
    expect(unreleased).toMatch(/CardTitle[^.]*HTMLDivElement[^.]*HTMLHeadingElement/);
  });
  it('says forced-colors mode gets an outline on the four inset edges', () => {
    expect(unreleased).toMatch(/forced-colors[^.]*(Switch|`Switch`)[^.]*(Toolbar|`Toolbar`)[^.]*(Player|`Player`)[^.]*file-input/);
  });
  it('says quiet links are plain at rest and the footer and navigation links stay plain', () => {
    expect(unreleased).toMatch(/`quiet`[^.]*plain at rest[^.]*underline[^.]*hover/);
    expect(unreleased).not.toMatch(/Footer and navigation links are lists and stay plain/);
  });
  it('accepts the weaker Slider rail and unplayed Player bars on --surface-track, with the numbers', () => {
    expect(unreleased).toMatch(/1\.28:1[^.]*(accepted|Accepted)/);
  });
  it('says a loading primary Button keeps full strength', () => {
    expect(unreleased).toMatch(/loading[^.]*(full strength|opacity 1)[^.]*6\.37:1/);
  });
  it('says the focus ring of the Table wrapper, a row or a control lifts the fade', () => {
    expect(unreleased).toMatch(/Table[^|]*fades[^|]*focus[^.]*row/);
  });
  it('says the BarChart base bars read --border-control and the highlight is carried by its outline, not by tone (1.4.1)', () => {
    expect(unreleased).toMatch(/BarChart[^.]*base bars[^.]*--border-control/);
    expect(unreleased).toMatch(/1px `--accent-edge` outline/);
    expect(unreleased).toMatch(/Tone cannot carry the highlight alone \(WCAG 1\.4\.1\)/);
    expect(unreleased).toContain('told apart by hue plus a 1px edge, about 1.3:1 by tone in light, weak for colour-blind readers: pair it with a label or a legend.');
    expect(readFileSync('components/data/BarChart.prompt.md', 'utf8')).toContain('weak for colour-blind readers: pair it with a label or a legend.');
    expect(readFileSync('site/Docs.dc.html', 'utf8')).toContain('weak for colour-blind readers: pair it with a label or a legend.');
    expect(readFileSync('site/Docs.dc.html', 'utf8')).toContain('lemah bagi pembaca buta warna: sertakan label atau legenda.');
  });
});
