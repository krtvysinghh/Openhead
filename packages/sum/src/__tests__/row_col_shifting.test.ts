import { describe, it, expect } from 'vitest';
import { SumWorkbook } from '../workbook';

describe('SumWorkbook - Row and Column Mutations', () => {
  it('should shift cell coordinates downward when inserting a row with undo support', () => {
    const wb = new SumWorkbook();
    wb.setCellValue('A1', 'Header');
    wb.setCellValue('A2', 100);
    wb.setCellValue('A3', 200);

    // Insert row at row index 1 (between A1 and A2)
    wb.insertRow(1);

    const sheetAfter = wb.getActiveSheet();
    expect(sheetAfter.cells['A1'].value).toBe('Header');
    expect(sheetAfter.cells['A2']).toBeUndefined();
    expect(sheetAfter.cells['A3'].value).toBe(100);
    expect(sheetAfter.cells['A4'].value).toBe(200);

    // Undo row insertion
    wb.undo();
    const sheetUndone = wb.getActiveSheet();
    expect(sheetUndone.cells['A1'].value).toBe('Header');
    expect(sheetUndone.cells['A2'].value).toBe(100);
    expect(sheetUndone.cells['A3'].value).toBe(200);
  });

  it('should shift cell coordinates upward when deleting a row', () => {
    const wb = new SumWorkbook();
    wb.setCellValue('A1', 10);
    wb.setCellValue('A2', 20);
    wb.setCellValue('A3', 30);

    wb.deleteRow(1); // Delete row 2 (A2)
    const sheet = wb.getActiveSheet();
    expect(sheet.cells['A1'].value).toBe(10);
    expect(sheet.cells['A2'].value).toBe(30);
    expect(sheet.cells['A3']).toBeUndefined();
  });
});
