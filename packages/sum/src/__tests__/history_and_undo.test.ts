import { describe, it, expect } from 'vitest';
import { SumWorkbook } from '../workbook';

describe('Sum History, Undo/Redo & Grid Mutations', () => {
  it('should correctly execute a multi-step mutation and undo/redo sequence', () => {
    const wb = new SumWorkbook();

    // 1. Set values
    wb.setCellValue('A1', 100);
    wb.setCellValue('A2', 200);
    wb.setCellValue('A3', '=A1+A2');
    expect(wb.getActiveSheet().cells['A3']?.value).toBe(300);

    // 2. Format cell
    wb.setCellStyle('A3', { bold: true });
    expect(wb.getActiveSheet().cells['A3']?.style?.bold).toBe(true);

    // 3. Insert row at row 2
    wb.insertRow(1);
    expect(wb.getActiveSheet().cells['A4']?.value).toBe(300);

    // 4. Undo row insertion
    expect(wb.canUndo).toBe(true);
    wb.undo();
    expect(wb.getActiveSheet().cells['A3']?.value).toBe(300);

    // 5. Undo formatting
    wb.undo();
    expect(wb.getActiveSheet().cells['A3']?.style?.bold).toBeUndefined();

    // 6. Undo A3 edit
    wb.undo();
    expect(wb.getActiveSheet().cells['A3']).toBeUndefined();

    // 7. Redo all
    wb.redo();
    expect(wb.getActiveSheet().cells['A3']?.value).toBe(300);
    wb.redo();
    expect(wb.getActiveSheet().cells['A3']?.style?.bold).toBe(true);
  });

  it('should manage merged cells with collision rejection', () => {
    const wb = new SumWorkbook();

    const merged1 = wb.mergeCells('A1:B2');
    expect(merged1).toBe(true);
    expect(wb.getActiveSheet().mergedRanges).toContain('A1:B2');

    // Overlapping merge should be rejected
    const mergedOverlap = wb.mergeCells('B2:C3');
    expect(mergedOverlap).toBe(false);

    // Non-overlapping merge succeeds
    const merged2 = wb.mergeCells('D1:E2');
    expect(merged2).toBe(true);
    expect(wb.getActiveSheet().mergedRanges?.length).toBe(2);

    // Unmerge
    wb.unmergeCells('A1:B2');
    expect(wb.getActiveSheet().mergedRanges).not.toContain('A1:B2');
  });

  it('should support matrix copy/paste with formula reference translation', () => {
    const wb = new SumWorkbook();
    wb.setCellValue('A1', 10);
    wb.setCellValue('B1', 20);
    wb.setCellValue('C1', '=A1+B1');

    // Copy C1 to C2
    wb.copyPasteRange('C1', 'C2');
    expect(wb.getActiveSheet().cells['C2']?.raw).toBe('=A2+B2');

    // Copy matrix A1:C1 to A5
    wb.copyPasteMatrix('A1:C1', 'A5');
    expect(wb.getActiveSheet().cells['A5']?.raw).toBe(10);
    expect(wb.getActiveSheet().cells['B5']?.raw).toBe(20);
    expect(wb.getActiveSheet().cells['C5']?.raw).toBe('=A5+B5');
  });
});
