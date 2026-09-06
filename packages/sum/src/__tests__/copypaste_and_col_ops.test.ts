import { describe, it, expect } from 'vitest';
import { SumWorkbook, shiftFormulaReferences } from '../workbook';

describe('Sum Column Operations & Spreadsheet Copy/Paste Lab', () => {
  it('should translate formula cell references appropriately when shifted', () => {
    // Relative shift down by 1 row, right by 1 col (A1 -> B2)
    expect(shiftFormulaReferences('=A1+C3', 1, 1)).toBe('=B2+D4');

    // Absolute columns and rows ($A$1 preserved)
    expect(shiftFormulaReferences('=$A$1+B$2+$C3', 2, 3)).toBe('=$A$1+E$2+$C5');

    // Cross-sheet preserved
    expect(shiftFormulaReferences('=Sheet2!A1+B1', 1, 0)).toBe('=Sheet2!A2+B2');

    // Negative out-of-bounds yields #REF!
    expect(shiftFormulaReferences('=A1', -1, 0)).toBe('=#REF!');
  });

  it('should support copyPasteRange with relative formula shifting', () => {
    const wb = new SumWorkbook();
    wb.setCellValue('A1', 10);
    wb.setCellValue('B1', 20);
    wb.setCellValue('C1', '=A1+B1'); // 30

    wb.setCellValue('A2', 40);
    wb.setCellValue('B2', 50);

    // Copy C1 to C2 -> should become =A2+B2 -> 90
    wb.copyPasteRange('C1', 'C2');
    expect(wb.getActiveSheet().cells['C2']?.raw).toBe('=A2+B2');
    expect(wb.getActiveSheet().cells['C2']?.value).toBe(90);
  });

  it('should support column insertion, deletion, and cell merging', () => {
    const wb = new SumWorkbook();
    wb.setCellValue('A1', 'ColA');
    wb.setCellValue('B1', 'ColB');
    wb.setCellValue('C1', 'ColC');

    // Insert column at B (index 1) -> old B becomes C, old C becomes D
    wb.insertCol(1);
    expect(wb.getActiveSheet().cells['A1']?.value).toBe('ColA');
    expect(wb.getActiveSheet().cells['C1']?.value).toBe('ColB');
    expect(wb.getActiveSheet().cells['D1']?.value).toBe('ColC');

    // Delete column B (index 1) -> shifts C back to B
    wb.deleteCol(1);
    expect(wb.getActiveSheet().cells['B1']?.value).toBe('ColB');
    expect(wb.getActiveSheet().cells['C1']?.value).toBe('ColC');

    // Merge cells
    wb.mergeCells('A1:B1');
    expect(wb.getActiveSheet().mergedRanges).toContain('A1:B1');

    wb.unmergeCells('A1:B1');
    expect(wb.getActiveSheet().mergedRanges).not.toContain('A1:B1');
  });
});
