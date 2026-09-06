import { describe, it, expect } from 'vitest';
import { GlimpseDeck } from '../deck';
import { ChartType, ChartNode } from '../types';
import { PptxAdapter } from '../export/pptx';

describe('Glimpse Chart Types & Data Series Matrix', () => {
  const chartTypes: ChartType[] = ['bar', 'column', 'line', 'pie', 'area'];

  chartTypes.forEach((type) => {
    it(`should create and configure ${type} chart with multi-series data`, () => {
      const deck = new GlimpseDeck();
      const node = deck.addChartNode(
        type,
        ['Jan', 'Feb', 'Mar'],
        [
          { name: 'Revenue', data: [100, 120, 150], color: '#38bdf8' },
          { name: 'COGS', data: [40, 45, 50], color: '#ef4444' },
        ],
        { title: `${type.toUpperCase()} Performance` }
      );

      expect(node.chartType).toBe(type);
      expect(node.series.length).toBe(2);
      expect(node.categories).toEqual(['Jan', 'Feb', 'Mar']);

      const slideXml = PptxAdapter.toSlideXml(deck.getActiveSlide(), 1);
      expect(slideXml).toContain(`${type.toUpperCase()} Performance`);
      expect(slideXml).toContain('Revenue');
      expect(slideXml).toContain('COGS');
    });
  });

  it('should handle single category charts', () => {
    const deck = new GlimpseDeck();
    const node = deck.addChartNode('pie', ['Total Market Share'], [{ name: 'Openhead', data: [85], color: '#10b981' }]);
    expect(node.categories.length).toBe(1);
    expect(node.series[0].data[0]).toBe(85);
  });

  it('should handle chart nodes with toggleable legend and data labels', () => {
    const deck = new GlimpseDeck();
    const node = deck.addChartNode('line', ['Q1', 'Q2'], [{ name: 'Metric', data: [1, 2] }], {
      showLegend: false,
      showDataLabels: false,
    });
    expect(node.showLegend).toBe(false);
    expect(node.showDataLabels).toBe(false);
  });

  it('should support custom title and position updates on chart nodes', () => {
    const deck = new GlimpseDeck();
    const node = deck.addChartNode('bar', ['A', 'B'], [{ name: 'S1', data: [10, 20] }]);
    deck.updateNode(node.id, { title: 'Updated Chart Title', x: 250, y: 300 });

    const updated = deck.getActiveSlide().nodes.find((n) => n.id === node.id) as ChartNode;
    expect(updated.title).toBe('Updated Chart Title');
    expect(updated.x).toBe(250);
    expect(updated.y).toBe(300);
  });
});
