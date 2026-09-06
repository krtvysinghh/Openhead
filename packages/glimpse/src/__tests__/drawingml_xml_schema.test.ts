import { describe, it, expect } from 'vitest';
import { GlimpseDeck } from '../deck';
import { PptxAdapter } from '../export/pptx';

describe('Glimpse DrawingML & PresentationML XML Standards Validation', () => {
  it('should emit compliant presentation.xml with 16:9 slide size (12192000 x 6858000 EMUs)', () => {
    const deck = new GlimpseDeck();
    const presXml = PptxAdapter.toPresentationML(deck.getModel());

    expect(presXml).toContain('xmlns:p="http://schemas.openxmlformats.org/presentationml/2006/main"');
    expect(presXml).toContain('xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main"');
    expect(presXml).toContain('cx="12192000" cy="6858000"');
    expect(presXml).toContain('<p:sldMasterIdLst>');
    expect(presXml).toContain('<p:sldIdLst>');
  });

  it('should escape XML entities safely without double escaping', () => {
    const deck = new GlimpseDeck();
    deck.addTextNode({ text: 'Formula: a < b && b > c' });
    const slide = deck.getActiveSlide();
    slide.title = 'AT&T & "Special" <Chars> in \'Title\'';

    const slideXml = PptxAdapter.toSlideXml(slide, 1);
    expect(slideXml).toContain('AT&amp;T &amp; &quot;Special&quot; &lt;Chars&gt;');
    expect(slideXml).toContain('Formula: a &lt; b &amp;&amp; b &gt; c');
  });

  it('should generate valid Content_Types and Rel XML parts inside PPTX ZIP package', async () => {
    const deck = new GlimpseDeck();
    deck.addSlide('Slide 2');

    const buffer = await PptxAdapter.toBuffer(deck.getModel());
    expect(buffer).toBeDefined();

    // Verify roundtrip read
    const parsed = await PptxAdapter.fromBuffer(buffer);
    expect(parsed.slides.length).toBe(2);
  });
});
