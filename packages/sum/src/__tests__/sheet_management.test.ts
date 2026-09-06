import { describe, it, expect } from 'vitest';
import { SumWorkbook } from '../workbook';

describe('Sum Workbook & Worksheet Management Lab', () => {
  it('should support sheet addition, duplication, renaming, deletion, and reordering', () => {
    const wb = new SumWorkbook();
    expect(wb.getModel().sheets.length).toBe(1);

    // Add Sheet2
    const sheet2 = wb.addSheet('Q1_Financials');
    expect(wb.getModel().sheets.length).toBe(2);
    expect(wb.getActiveSheet().name).toBe('Q1_Financials');

    // Duplicate Sheet2
    const clone = wb.duplicateSheet(sheet2.id);
    expect(clone).not.toBeNull();
    expect(wb.getModel().sheets.length).toBe(3);
    expect(clone!.name).toBe('Q1_Financials (Copy)');

    // Rename Sheet1 to GlobalSummary
    const initialSheetId = wb.getModel().sheets[0].id;
    const renamed = wb.renameSheet(initialSheetId, 'GlobalSummary');
    expect(renamed).toBe(true);
    expect(wb.getModel().sheets[0].name).toBe('GlobalSummary');

    // Reorder sheets
    const ids = wb.getModel().sheets.map((s) => s.id);
    wb.reorderSheets([ids[2], ids[0], ids[1]]);
    expect(wb.getModel().sheets[0].id).toBe(ids[2]);

    // Delete duplicated sheet
    const deleted = wb.deleteSheet(clone!.id);
    expect(deleted).toBe(true);
    expect(wb.getModel().sheets.length).toBe(2);
  });

  it('should support row/col hiding, freeze panes, borders, and range auto-fill', () => {
    const wb = new SumWorkbook();
    
    // Freeze panes: 1 row, 2 columns
    wb.setFreezePanes({ rows: 1, cols: 2 });
    expect(wb.getActiveSheet().freezePanes).toEqual({ rows: 1, cols: 2 });

    // Hide row 5 and col 3 (D)
    wb.hideRow(4);
    wb.hideCol(3);
    expect(wb.getActiveSheet().hiddenRows).toContain(4);
    expect(wb.getActiveSheet().hiddenCols).toContain(3);

    wb.unhideRow(4);
    expect(wb.getActiveSheet().hiddenRows).not.toContain(4);

    // Set borders
    wb.setCellBorders('B2', { top: true, bottom: true, style: 'thick', color: '#000000' });
    expect(wb.getActiveSheet().cells['B2']?.style?.borders?.style).toBe('thick');

    // Auto-fill arithmetic sequence: A1=10, A2=20 -> A3:A5
    wb.setCellValue('A1', 10);
    wb.setCellValue('A2', 20);
    wb.fillRange('A1:A2', 'A3:A5');

    expect(wb.getActiveSheet().cells['A3']?.value).toBe(30);
    expect(wb.getActiveSheet().cells['A4']?.value).toBe(40);
    expect(wb.getActiveSheet().cells['A5']?.value).toBe(50);
  });
});
