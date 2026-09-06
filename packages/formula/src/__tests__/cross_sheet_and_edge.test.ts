import { describe, it, expect } from 'vitest';
import { FormulaEngine } from '../engine';
import { parseCellAddress, formatCellAddress } from '../coords';

describe('Formula Engine - Cross-sheet, Mixed References & Extended Functions', () => {
  it('should parse mixed cell references ($A1, A$1, $A$1)', () => {
    const colAbs = parseCellAddress('$A1');
    expect(colAbs?.colAbsolute).toBe(true);
    expect(colAbs?.rowAbsolute).toBe(false);
    expect(formatCellAddress(colAbs!)).toBe('$A1');

    const rowAbs = parseCellAddress('A$1');
    expect(rowAbs?.colAbsolute).toBe(false);
    expect(rowAbs?.rowAbsolute).toBe(true);
    expect(formatCellAddress(rowAbs!)).toBe('A$1');
  });

  it('should parse and evaluate cross-sheet cell references (Sheet2!A1)', () => {
    const engine = new FormulaEngine();
    // Sheet2!A1 = 500
    engine.setCellValue({ sheet: 'Sheet2', col: 0, row: 0 }, 500);
    // Sheet1!A1 = =Sheet2!A1 * 2
    engine.setCellValue({ sheet: 'Sheet1', col: 0, row: 0 }, '=Sheet2!A1 * 2');

    expect(engine.getCellValue({ sheet: 'Sheet1', col: 0, row: 0 })).toBe(1000);
  });

  it('should evaluate extended functions: MEDIAN, SUMPRODUCT, TRUNC, INT, EVEN, ODD', () => {
    const engine = new FormulaEngine();
    engine.setCellValue({ col: 0, row: 0 }, 10);
    engine.setCellValue({ col: 0, row: 1 }, 20);
    engine.setCellValue({ col: 0, row: 2 }, 30);
    engine.setCellValue({ col: 0, row: 3 }, 40);
    engine.setCellValue({ col: 0, row: 4 }, 50);

    engine.setCellValue({ col: 1, row: 0 }, '=MEDIAN(A1:A5)'); // 30
    engine.setCellValue({ col: 1, row: 1 }, '=TRUNC(3.897, 1)'); // 3.8
    engine.setCellValue({ col: 1, row: 2 }, '=INT(9.99)'); // 9
    engine.setCellValue({ col: 1, row: 3 }, '=EVEN(3)'); // 4
    engine.setCellValue({ col: 1, row: 4 }, '=ODD(4)'); // 5

    expect(engine.getCellValue({ col: 1, row: 0 })).toBe(30);
    expect(engine.getCellValue({ col: 1, row: 1 })).toBe(3.8);
    expect(engine.getCellValue({ col: 1, row: 2 })).toBe(9);
    expect(engine.getCellValue({ col: 1, row: 3 })).toBe(4);
    expect(engine.getCellValue({ col: 1, row: 4 })).toBe(5);
  });

  it('should evaluate information functions: ISNUMBER, ISTEXT, ISBLANK', () => {
    const engine = new FormulaEngine();
    engine.setCellValue({ col: 0, row: 0 }, 42);
    engine.setCellValue({ col: 0, row: 1 }, 'Openhead');

    engine.setCellValue({ col: 1, row: 0 }, '=ISNUMBER(A1)'); // true
    engine.setCellValue({ col: 1, row: 1 }, '=ISTEXT(A2)'); // true
    engine.setCellValue({ col: 1, row: 2 }, '=ISBLANK(A3)'); // true

    expect(engine.getCellValue({ col: 1, row: 0 })).toBe(true);
    expect(engine.getCellValue({ col: 1, row: 1 })).toBe(true);
    expect(engine.getCellValue({ col: 1, row: 2 })).toBe(true);
  });
});
