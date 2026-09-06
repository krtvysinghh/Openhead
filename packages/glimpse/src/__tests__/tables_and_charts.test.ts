import { describe, it, expect } from 'vitest';
import { GlimpseDeck } from '../deck';
import { SlideLayouts } from '../layouts';
import { PptxAdapter } from '../export/pptx';

describe('Glimpse Tables & Charts Engine', () => {
  it('should construct structured multi-cell tables with headers and custom fills', () => {
    const tableSlide = SlideLayouts.createTableSlide(
      'Quarterly Financial Allocation',
      ['Division', 'Budget', 'Actual', 'Variance'],
      [
        ['Engineering', '$5.2M', '$4.9M', '-$300K'],
        ['Sales', '$2.8M', '$2.9M', '+$100K'],
        ['Operations', '$1.1M', '$1.05M', '-$50K'],
      ]
    );

    const deck = new GlimpseDeck();
    deck.addSlideFromLayout(tableSlide);

    const activeSlide = deck.getActiveSlide();
    expect(activeSlide.nodes.length).toBe(2);
    const tbl = activeSlide.nodes.find((n) => n.type === 'table') as any;

    expect(tbl).toBeDefined();
    expect(tbl.rows).toBe(4);
    expect(tbl.columns).toBe(4);
    expect(tbl.headerRow).toBe(true);
    expect(tbl.cells[0][0].text).toBe('Division');
    expect(tbl.cells[1][1].text).toBe('$5.2M');

    const slideXml = PptxAdapter.toSlideXml(activeSlide, 1);
    expect(slideXml).toContain('a:tbl');
    expect(slideXml).toContain('a:gridCol');
    expect(slideXml).toContain('Engineering');
    expect(slideXml).toContain('$5.2M');
  });

  it('should configure chart series, categories, data labels, and chart types', () => {
    const chartSlide = SlideLayouts.createChartSlide(
      'Annual Revenue Forecast',
      'column',
      ['2024', '2025', '2026', '2027'],
      [
        { name: 'Subscription ARR', data: [20, 35, 60, 110], color: '#38bdf8' },
        { name: 'Professional Services', data: [5, 8, 12, 18], color: '#3b82f6' },
      ]
    );

    const deck = new GlimpseDeck();
    deck.addSlideFromLayout(chartSlide);

    const activeSlide = deck.getActiveSlide();
    const chart = activeSlide.nodes.find((n) => n.type === 'chart') as any;

    expect(chart).toBeDefined();
    expect(chart.chartType).toBe('column');
    expect(chart.categories.length).toBe(4);
    expect(chart.series.length).toBe(2);
    expect(chart.series[0].data).toEqual([20, 35, 60, 110]);
    expect(chart.showLegend).toBe(true);

    const slideXml = PptxAdapter.toSlideXml(activeSlide, 1);
    expect(slideXml).toContain('Annual Revenue Forecast');
    expect(slideXml).toContain('Subscription ARR');
  });
});
