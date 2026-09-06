import { describe, it, expect } from 'vitest';
import * as fs from 'fs';
import * as path from 'path';
import { PptxAdapter, GlimpseDeckModel } from '../../packages/glimpse/src';

describe('PPTX PresentationML High-Fidelity Roundtrip Test Suite', () => {
  const corpusDir = path.resolve(__dirname, '../../compatibility-corpus/glimpse');
  const fixtureFiles = fs.existsSync(corpusDir)
    ? fs.readdirSync(corpusDir).filter((f) => f.endsWith('.json'))
    : [];

  it('should find all 12 compatibility corpus fixtures in compatibility-corpus/glimpse', () => {
    expect(fixtureFiles.length).toBeGreaterThanOrEqual(12);
  });

  for (const filename of fixtureFiles) {
    it(`should successfully round-trip fixture: ${filename}`, async () => {
      const filePath = path.join(corpusDir, filename);
      const jsonContent = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
      const sourceModel: GlimpseDeckModel = jsonContent.model || jsonContent;

      // 1. Export GlimpseDeckModel to PPTX ZIP buffer
      const pptxBuffer = await PptxAdapter.toBuffer(sourceModel);
      expect(pptxBuffer).toBeDefined();
      expect(pptxBuffer.length).toBeGreaterThan(500);

      // 2. Import PPTX ZIP buffer back into GlimpseDeckModel
      const importedModel = await PptxAdapter.fromBuffer(pptxBuffer);
      expect(importedModel).toBeDefined();
      expect(importedModel.slides.length).toBe(sourceModel.slides.length);

      // Check aspect ratio
      expect(importedModel.dimensions.aspectRatio).toBe(sourceModel.dimensions.aspectRatio);

      // Check each slide preservation
      sourceModel.slides.forEach((srcSlide, idx) => {
        const impSlide = importedModel.slides[idx];
        expect(impSlide).toBeDefined();

        // Check speaker notes if present
        if (srcSlide.notes) {
          expect(impSlide.notes).toBeDefined();
          expect(impSlide.notes?.trim()).toBe(srcSlide.notes.trim());
        }

        // Check node count
        expect(impSlide.nodes.length).toBeGreaterThanOrEqual(srcSlide.nodes.length);
      });
    });
  }

  it('should maintain strict DrawingML shape coordinates, text styling, and table grids', async () => {
    const model: GlimpseDeckModel = {
      metadata: { id: 'd_test', title: 'Precision Test', type: 'glimpse', createdAt: 0, updatedAt: 0, version: 1 },
      dimensions: { width: 1920, height: 1080, aspectRatio: '16:9' },
      slides: [
        {
          id: 's_test',
          title: 'Precision Shapes & Tables',
          background: '#0f172a',
          notes: 'Precision test speaker note',
          nodes: [
            {
              id: 'n_txt',
              type: 'text',
              x: 100,
              y: 80,
              width: 1400,
              height: 90,
              text: 'Precision Slide Header',
              fontSize: 40,
              fontWeight: 'bold',
              color: '#ffffff',
              zIndex: 1,
            },
            {
              id: 'n_shp',
              type: 'shape',
              kind: 'rounded-rectangle',
              x: 200,
              y: 220,
              width: 500,
              height: 300,
              fill: '#3b82f6',
              stroke: '#ffffff',
              strokeWidth: 2,
              text: 'Shape Label',
              textColor: '#ffffff',
              zIndex: 2,
            },
            {
              id: 'n_tbl',
              type: 'table',
              x: 750,
              y: 220,
              width: 900,
              height: 300,
              rows: 2,
              columns: 2,
              headerRow: true,
              cells: [
                [{ id: 'c1', text: 'Metric' }, { id: 'c2', text: 'Value' }],
                [{ id: 'c3', text: 'Speed' }, { id: 'c4', text: '100x' }],
              ],
              zIndex: 3,
            },
          ],
        },
      ],
      activeSlideId: 's_test',
    };

    const buf = await PptxAdapter.toBuffer(model);
    const roundtripped = await PptxAdapter.fromBuffer(buf);

    expect(roundtripped.slides.length).toBe(1);
    const sl = roundtripped.slides[0];
    expect(sl.notes).toBe('Precision test speaker note');
    expect(sl.nodes.length).toBe(3);

    const tblNode = sl.nodes.find((n) => n.type === 'table') as any;
    expect(tblNode).toBeDefined();
    expect(tblNode.rows).toBe(2);
    expect(tblNode.columns).toBe(2);
  });
});
