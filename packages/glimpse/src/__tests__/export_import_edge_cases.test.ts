import { describe, it, expect } from 'vitest';
import { GlimpseDeck } from '../deck';
import { PptxAdapter } from '../export/pptx';

describe('Glimpse PPTX Adapter Edge Cases & Rich Elements', () => {
  it('should export and parse image placeholders with alt text', async () => {
    const deck = new GlimpseDeck();
    deck.addImageNode('https://example.com/system-diagram.png', { alt: 'Architecture Diagram', x: 200, y: 150, width: 800, height: 450 });

    const buffer = await PptxAdapter.toBuffer(deck.getModel());
    const parsed = await PptxAdapter.fromBuffer(buffer);

    expect(parsed.slides[0].nodes.length).toBeGreaterThanOrEqual(1);
    const xml = PptxAdapter.toSlideXml(deck.getActiveSlide(), 1);
    expect(xml).toContain('Architecture Diagram');
  });

  it('should handle slides with custom solid hex backgrounds', async () => {
    const deck = new GlimpseDeck();
    deck.updateSlideBackground(deck.getActiveSlide().id, '#0F172A');

    const buffer = await PptxAdapter.toBuffer(deck.getModel());
    const parsed = await PptxAdapter.fromBuffer(buffer);

    expect(parsed.slides[0].background).toBe('#0F172A');
  });

  it('should handle group nodes and nested shapes serialization', async () => {
    const deck = new GlimpseDeck();
    const s1 = deck.addShapeNode('rectangle', { x: 100, y: 100, width: 200, height: 100 });
    const s2 = deck.addShapeNode('circle', { x: 350, y: 100, width: 200, height: 100 });
    const group = deck.groupNodes([s1.id, s2.id]);

    expect(group).not.toBeNull();
    const xml = PptxAdapter.toSlideXml(deck.getActiveSlide(), 1);
    expect(xml).toContain('<p:grpSp>');
  });

  it('should preserve font families and custom font sizes in text runs', async () => {
    const deck = new GlimpseDeck();
    deck.addTextNode({
      text: 'Custom Typography',
      fontFamily: 'Georgia',
      fontSize: 36,
      color: '#38BDF8',
    });

    const xml = PptxAdapter.toSlideXml(deck.getActiveSlide(), 1);
    expect(xml).toContain('typeface="Georgia"');
    expect(xml).toContain('sz="3600"');
    expect(xml).toContain('val="38BDF8"');
  });
});
