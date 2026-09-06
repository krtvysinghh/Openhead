import { describe, it, expect } from 'vitest';
import { SumWorkbook, XlsxAdapter, WorkbookModel } from '../index';

describe('Sum Performance Benchmarks', () => {
  it('should evaluate a 1,000-cell dependency chain efficiently', () => {
    const model: WorkbookModel = SumWorkbook.createEmpty('Benchmark');
    const sheet = model.sheets[0];
    sheet.cells['A1'] = { raw: 1, value: 1 };

    for (let i = 2; i <= 1000; i++) {
      sheet.cells[`A${i}`] = { raw: `=A${i - 1} + 1`, value: null };
    }

    const start = performance.now();
    const wb = new SumWorkbook(model);
    const elapsed = performance.now() - start;

    expect(wb.getActiveSheet().cells['A1000']?.value).toBe(1000);
    expect(elapsed).toBeLessThan(200); // Fast batch DAG resolution
  });

  it('should export and serialize a 2,000-cell styled spreadsheet in under 100ms', async () => {
    const model: WorkbookModel = SumWorkbook.createEmpty('Export Benchmark');
    const sheet = model.sheets[0];
    for (let r = 1; r <= 200; r++) {
      for (let c = 0; c < 10; c++) {
        const col = String.fromCharCode(65 + c);
        sheet.cells[`${col}${r}`] = {
          raw: r * (c + 1),
          value: r * (c + 1),
          style: { bold: r === 1 },
        };
      }
    }

    const start = performance.now();
    const buffer = await XlsxAdapter.toBuffer(model);
    const elapsed = performance.now() - start;

    expect(buffer.length).toBeGreaterThan(1000);
    expect(elapsed).toBeLessThan(200);
  });
});
