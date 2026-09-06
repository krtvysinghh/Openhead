import { describe, it, expect, beforeEach } from 'vitest';
import { OfficeClipboardEngine } from '../clipboard';

describe('OfficeClipboardEngine Cross-Application Interoperability', () => {
  beforeEach(() => {
    OfficeClipboardEngine.clear();
  });

  it('should copy Sum cell matrix and translate into Pen TableBlock structure', () => {
    const matrix = [
      ['Product', 'Revenue', 'Status'],
      ['Pen', '$120,000', 'Shipped'],
      ['Sum', '$240,000', 'Active'],
    ];

    OfficeClipboardEngine.copySumCells(matrix.slice(1), matrix[0]);
    const penTable = OfficeClipboardEngine.pasteToPenTable();

    expect(penTable).not.toBeNull();
    expect(penTable?.headers).toEqual(['Product', 'Revenue', 'Status']);
    expect(penTable?.rows.length).toBe(2);
    expect(penTable?.rows[0][0].inlines[0].text).toBe('Pen');
  });

  it('should copy Sum cell matrix and translate into Glimpse TableNode format', () => {
    const matrix = [
      ['Metric', 'Target', 'Actual'],
      ['ARR', '$10M', '$12M'],
    ];
    OfficeClipboardEngine.copySumCells(matrix.slice(1), matrix[0]);
    const glimpseTable = OfficeClipboardEngine.pasteToGlimpseTable();

    expect(glimpseTable).not.toBeNull();
    expect(glimpseTable?.rows).toBe(2);
    expect(glimpseTable?.columns).toBe(3);
    expect(glimpseTable?.cells[0][0].text).toBe('Metric');
    expect(glimpseTable?.cells[1][1].text).toBe('$10M');
  });

  it('should copy Sum numeric data and translate into Glimpse Chart series & categories', () => {
    const matrix = [
      ['Q1', '25', '40'],
      ['Q2', '50', '65'],
      ['Q3', '75', '90'],
    ];
    OfficeClipboardEngine.copySumCells(matrix, ['Quarter', 'Target', 'Actual']);
    const chartData = OfficeClipboardEngine.pasteToGlimpseChart();

    expect(chartData).not.toBeNull();
    expect(chartData?.categories).toEqual(['Q1', 'Q2', 'Q3']);
    expect(chartData?.series.length).toBe(2);
    expect(chartData?.series[0].name).toBe('Target');
    expect(chartData?.series[0].data).toEqual([25, 50, 75]);
    expect(chartData?.series[1].data).toEqual([40, 65, 90]);
  });

  it('should parse tab-separated plain text back into Sum 2D cell grid', () => {
    OfficeClipboardEngine.copy({
      type: 'text',
      sourceApp: 'pen',
      timestamp: Date.now(),
      plainText: 'Header1\tHeader2\nVal1\tVal2',
    });

    const sumMatrix = OfficeClipboardEngine.pasteToSumMatrix();
    expect(sumMatrix).not.toBeNull();
    expect(sumMatrix?.length).toBe(2);
    expect(sumMatrix?.[0]).toEqual(['Header1', 'Header2']);
    expect(sumMatrix?.[1]).toEqual(['Val1', 'Val2']);
  });
});
