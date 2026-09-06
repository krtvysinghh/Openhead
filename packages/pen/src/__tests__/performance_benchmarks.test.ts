import { describe, it, expect } from 'vitest';
import { PenDocument, DocxAdapter } from '../index';
import { generateId } from '@openhead/core';

describe('Pen Performance & Large Document Stress Benchmarks', () => {
  it('should compute statistics and search/replace across a 10,000-word document within 50ms SLA', () => {
    const doc = new PenDocument();
    // Build 100 paragraphs with 100 words each = 10,000 words
    const sampleSentence = 'The open source document engine provides uncompromising typography and performance. ';
    const paragraphText = sampleSentence.repeat(10); // ~100 words

    for (let i = 0; i < 100; i++) {
      doc.insertBlock(0, i, {
        id: generateId('blk'),
        type: 'paragraph',
        inlines: [{ id: generateId('inl'), text: paragraphText }],
      });
    }

    const tStart = performance.now();
    const stats = doc.getStats();
    const tStats = performance.now() - tStart;

    expect(stats.words).toBeGreaterThan(9000);
    expect(tStats).toBeLessThan(50); // Under 50ms SLA

    const tReplaceStart = performance.now();
    const count = doc.searchAndReplace('typography', 'typesetting', { wholeWord: true });
    const tReplace = performance.now() - tReplaceStart;

    expect(count).toBe(1000);
    expect(tReplace).toBeLessThan(50);
  });

  it('should package and parse a 50-paragraph document with tables to OOXML DOCX ZIP within 100ms', async () => {
    const doc = new PenDocument();
    for (let i = 0; i < 40; i++) {
      doc.insertBlock(0, i, {
        id: generateId('blk'),
        type: 'paragraph',
        inlines: [{ id: generateId('inl'), text: `Section paragraph ${i + 1} with high fidelity formatting and styles.` }],
      });
    }
    doc.insertTable(0, 40, 5, 4);

    const tExportStart = performance.now();
    const buffer = await DocxAdapter.toBuffer(doc.getModel());
    const tExport = performance.now() - tExportStart;

    expect(buffer.length).toBeGreaterThan(1000);
    expect(tExport).toBeLessThan(100); // Sub-100ms

    const tImportStart = performance.now();
    const imported = await DocxAdapter.fromBuffer(buffer);
    const tImport = performance.now() - tImportStart;

    expect(imported.sections[0].blocks.length).toBeGreaterThanOrEqual(41);
    expect(tImport).toBeLessThan(150);
  });
});
