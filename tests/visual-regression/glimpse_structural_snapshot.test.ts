import { describe, it, expect } from 'vitest';
import * as fs from 'fs';
import * as path from 'path';
import { PptxAdapter, GlimpseDeckModel, AlignmentEngine, SlideLayouts } from '../../packages/glimpse/src';

describe('Glimpse Structural Regression & Scene Graph Snapshot Lab', () => {
  const corpusDir = path.resolve(__dirname, '../../compatibility-corpus/glimpse');
  const fixtureFiles = fs.readdirSync(corpusDir).filter((f) => f.endsWith('.json'));

  it('should maintain deterministic scene graph structure across all 12 Glimpse fixtures', async () => {
    for (const file of fixtureFiles) {
      const content = JSON.parse(fs.readFileSync(path.join(corpusDir, file), 'utf-8'));
      const source: GlimpseDeckModel = content.model || content;

      const pptx = await PptxAdapter.toBuffer(source);
      const parsed = await PptxAdapter.fromBuffer(pptx);

      expect(parsed.slides.length).toBe(source.slides.length);
      expect(parsed.slides[0].nodes.length).toBeGreaterThanOrEqual(1);

      if (source.metadata.title) {
        expect(parsed.metadata.title).toBeDefined();
      }
    }
  });

  it('should preserve executive KPI cards layout in fixture 02', async () => {
    const kpiFile = path.join(corpusDir, 'fixture_02_executive_kpi_dashboard.json');
    const content = JSON.parse(fs.readFileSync(kpiFile, 'utf-8'));
    const pptx = await PptxAdapter.toBuffer(content);
    const parsed = await PptxAdapter.fromBuffer(pptx);

    const slide = parsed.slides[0];
    const shapes = slide.nodes.filter((n) => n.type === 'shape');
    expect(shapes.length).toBe(4);
  });

  it('should preserve financial performance tables in fixture 07', async () => {
    const tableFile = path.join(corpusDir, 'fixture_07_financial_performance_tables.json');
    const content = JSON.parse(fs.readFileSync(tableFile, 'utf-8'));
    const pptx = await PptxAdapter.toBuffer(content);
    const parsed = await PptxAdapter.fromBuffer(pptx);

    const tables = parsed.slides[0].nodes.filter((n) => n.type === 'table');
    expect(tables.length).toBe(1);
    expect((tables[0] as any).rows).toBe(5);
    expect((tables[0] as any).columns).toBe(5);
  });

  it('should calculate accurate alignment and distribution across nodes', () => {
    const nodes: any[] = [
      { id: '1', type: 'shape', x: 100, y: 100, width: 200, height: 100 },
      { id: '2', type: 'shape', x: 400, y: 150, width: 200, height: 100 },
      { id: '3', type: 'shape', x: 800, y: 200, width: 200, height: 100 },
    ];

    const alignedLeft = AlignmentEngine.alignNodes(nodes, 'left');
    expect(alignedLeft.every((n) => n.x === 100)).toBe(true);

    const alignedTop = AlignmentEngine.alignNodes(nodes, 'top');
    expect(alignedTop.every((n) => n.y === 100)).toBe(true);

    const distributedH = AlignmentEngine.distributeNodes(nodes, 'horizontal');
    expect(distributedH[0].x).toBe(100);
    expect(distributedH[1].x).toBe(450);
    expect(distributedH[2].x).toBe(800);
  });

  it('should detect smart snap guides when moving nodes near alignment edges', () => {
    const otherNodes: any[] = [{ id: '1', type: 'shape', x: 200, y: 200, width: 400, height: 300 }];
    const moving = { x: 203, y: 502, width: 200, height: 100 }; // 3px from left (200), 2px from bottom (500)

    const snapResult = AlignmentEngine.calculateSnapGuides(moving, otherNodes, 8);
    expect(snapResult.snapX).toBe(200);
    expect(snapResult.snapY).toBe(500);
    expect(snapResult.guides.length).toBeGreaterThanOrEqual(2);
  });
});
