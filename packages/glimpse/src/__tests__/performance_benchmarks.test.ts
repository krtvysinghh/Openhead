import { describe, it, expect } from 'vitest';
import { GlimpseDeck } from '../deck';
import { PptxAdapter } from '../export/pptx';

describe('Glimpse Performance & Scale Benchmarks', () => {
  it('should generate, serialize, and package 50 slides in under 500ms', async () => {
    const deck = new GlimpseDeck();
    deck.getModel().metadata.title = '50 Slide Stress Deck';

    const t0 = performance.now();
    for (let i = 1; i <= 50; i++) {
      const slide = deck.addSlide(`Slide ${i}: Executive Topic Overview`);
      slide.notes = `Speaker notes for slide index ${i} with detailed talking points.`;
      deck.addTextNode({ text: `Detailed analysis and data observations for section ${i}`, fontSize: 24 });
      deck.addShapeNode('card', { x: 150, y: 300, width: 600, height: 400, text: `Card Metric #${i}` });
    }

    const t1 = performance.now();
    const generationMs = t1 - t0;

    const t2 = performance.now();
    const buffer = await PptxAdapter.toBuffer(deck.getModel());
    const t3 = performance.now();
    const exportMs = t3 - t2;

    expect(deck.getModel().slides.length).toBe(51);
    expect(buffer.byteLength).toBeGreaterThan(10000);
    expect(generationMs).toBeLessThan(300);
    expect(exportMs).toBeLessThan(800);
  });

  it('should parse a large 50-slide PPTX archive in under 500ms', async () => {
    const deck = new GlimpseDeck();
    for (let i = 1; i <= 50; i++) {
      deck.addSlide(`Deck Slide #${i}`);
      deck.addShapeNode('rectangle', { text: `Shape ${i}` });
    }
    const buffer = await PptxAdapter.toBuffer(deck.getModel());

    const t0 = performance.now();
    const importedModel = await PptxAdapter.fromBuffer(buffer);
    const t1 = performance.now();
    const parseMs = t1 - t0;

    expect(importedModel.slides.length).toBe(51);
    expect(parseMs).toBeLessThan(600);
  });
});
