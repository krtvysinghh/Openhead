import { describe, it, expect } from 'vitest';
import { PenDocument } from '../index';

describe('Pen Document Outline & Metric Diagnostics', () => {
  it('should extract heading structure into document outline', () => {
    const doc = new PenDocument();
    doc.insertBlock(0, 1, {
      id: 'h2',
      type: 'heading',
      level: 2,
      inlines: [{ id: 'i2', text: 'Architecture Overview' }],
    });
    doc.insertBlock(0, 2, {
      id: 'h3',
      type: 'heading',
      level: 3,
      inlines: [{ id: 'i3', text: 'Data Pipeline' }],
    });

    const outline = doc.getOutline();
    expect(outline.length).toBe(3); // Title H1, H2, H3
    expect(outline[1].title).toBe('Architecture Overview');
    expect(outline[1].level).toBe(2);
    expect(outline[2].title).toBe('Data Pipeline');
    expect(outline[2].level).toBe(3);
  });

  it('should compute reading time and estimated page breaks', () => {
    const doc = new PenDocument();
    const stats = doc.getStats();
    expect(stats.readingTimeMinutes).toBeGreaterThanOrEqual(1);
    expect(stats.estimatedPages).toBeGreaterThanOrEqual(1);
  });
});
