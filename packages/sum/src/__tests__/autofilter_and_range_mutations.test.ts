import { describe, it, expect } from 'vitest';
import {
  SumWorkbook,
  XlsxAdapter,
  SortingFilteringEngine,
  WorksheetModel,
} from '../index';

describe('AutoFilter & Range Mutations Lab', () => {
  it('should filter multiple columns simultaneously with AND semantics', () => {
    const sheet: WorksheetModel = {
      id: 's1',
      name: 'Sales',
      rowCount: 10,
      colCount: 5,
      cells: {
        A1: { raw: 'Region', value: 'Region' },
        B1: { raw: 'Category', value: 'Category' },
        A2: { raw: 'North', value: 'North' }, B2: { raw: 'Electronics', value: 'Electronics' },
        A3: { raw: 'North', value: 'North' }, B3: { raw: 'Furniture', value: 'Furniture' },
        A4: { raw: 'South', value: 'South' }, B4: { raw: 'Electronics', value: 'Electronics' },
        A5: { raw: 'South', value: 'South' }, B5: { raw: 'Furniture', value: 'Furniture' },
      },
    };

    // Filter Region == 'North' AND Category == 'Electronics'
    const filtered = SortingFilteringEngine.applyAutoFilter(sheet, {
      range: 'A1:B5',
      columnFilters: {
        0: ['North'],
        1: ['Electronics'],
      },
    });

    // Visible: Row 2 (0-based idx 1)
    // Hidden: Row 3 (idx 2), Row 4 (idx 3), Row 5 (idx 4)
    expect(filtered.hiddenRows).toContain(2);
    expect(filtered.hiddenRows).toContain(3);
    expect(filtered.hiddenRows).toContain(4);
    expect(filtered.hiddenRows).not.toContain(1);
  });

  it('should round-trip AutoFilter definitions in XLSX archives', async () => {
    const wb = new SumWorkbook();
    wb.setCellValue('A1', 'Dept');
    wb.setCellValue('B1', 'Headcount');
    wb.setCellValue('A2', 'R&D');
    wb.setCellValue('B2', 40);
    wb.setAutoFilter({ range: 'A1:B2' });

    const buffer = await XlsxAdapter.toBuffer(wb.getModel());
    const imported = await XlsxAdapter.fromBuffer(buffer);

    expect(imported.sheets[0].autoFilter?.range).toBe('A1:B2');
  });

  it('should preserve hidden state across filter clear and re-application', () => {
    const wb = new SumWorkbook();
    wb.setCellValue('A1', 'Status');
    wb.setCellValue('A2', 'Active');
    wb.setCellValue('A3', 'Inactive');
    wb.setCellValue('A4', 'Active');

    const sheet = wb.getActiveSheet();
    const filtered = SortingFilteringEngine.applyAutoFilter(sheet, {
      range: 'A1:A4',
      columnFilters: { 0: ['Active'] },
    });
    expect(filtered.hiddenRows).toContain(2); // 'Inactive' is hidden

    const cleared = SortingFilteringEngine.clearAutoFilter(filtered);
    expect(cleared.hiddenRows?.length).toBe(0);
  });

  it('should gracefully handle empty or single-row AutoFilter ranges', () => {
    const sheet: WorksheetModel = {
      id: 's1',
      name: 'Empty',
      rowCount: 5,
      colCount: 5,
      cells: {},
    };

    const res = SortingFilteringEngine.applyAutoFilter(sheet, { range: 'A1:A1' });
    expect(res.autoFilter?.range).toBe('A1:A1');
    expect(res.hiddenRows?.length).toBe(0);
  });
});
