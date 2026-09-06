import { describe, it, expect } from 'vitest';
import { GlimpseDeck } from '../deck';
import { SlideLayouts } from '../layouts';
import { PptxAdapter } from '../export/pptx';

describe('PPTX OpenXML Fidelity & Round-Trip Parsing', () => {
  it('should export a rich multi-slide deck to valid binary PPTX archive and parse back accurately', async () => {
    const deck = new GlimpseDeck();
    deck.getModel().metadata.title = 'Production PPTX Round-Trip';

    // Slide 1: Title
    const s1 = deck.getActiveSlide();
    s1.notes = 'Presenter note on slide 1';

    // Slide 2: Two Column Cards
    const s2 = SlideLayouts.createTwoColumnCompare('Architecture Comparison', 'Client-Side Local', 'Cloud Centralized');
    s2.notes = 'Speaker note on comparison slide';
    deck.getModel().slides.push(s2);

    // Slide 3: Table Slide
    const s3 = SlideLayouts.createTableSlide('KPI Summary', ['Metric', 'Target', 'Actual'], [['NPS', '70', '78'], ['Uptime', '99.99%', '100%']]);
    deck.getModel().slides.push(s3);

    // Export to PPTX Buffer
    const buffer = await PptxAdapter.toBuffer(deck.getModel());
    expect(buffer).toBeInstanceOf(Uint8Array);
    expect(buffer.byteLength).toBeGreaterThan(1000);

    // Import from PPTX Buffer
    const importedModel = await PptxAdapter.fromBuffer(buffer);

    expect(importedModel.slides.length).toBe(3);
    expect(importedModel.dimensions.aspectRatio).toBe('16:9');
    expect(importedModel.dimensions.width).toBe(1920);
    expect(importedModel.dimensions.height).toBe(1080);

    // Check slide 1 text content
    const impS1 = importedModel.slides[0];
    expect(impS1.notes).toContain('Presenter note on slide 1');
    expect(impS1.nodes.length).toBeGreaterThanOrEqual(1);

    // Check slide 2 notes and shapes
    const impS2 = importedModel.slides[1];
    expect(impS2.notes).toContain('Speaker note on comparison slide');
    expect(impS2.nodes.length).toBeGreaterThanOrEqual(2);

    // Check slide 3 table
    const impS3 = importedModel.slides[2];
    const impTbl = impS3.nodes.find((n) => n.type === 'table') as any;
    expect(impTbl).toBeDefined();
    expect(impTbl.rows).toBe(3);
    expect(impTbl.columns).toBe(3);
  });
});
