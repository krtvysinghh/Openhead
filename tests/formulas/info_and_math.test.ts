import { describe, it, expect } from 'vitest';
import { FormulaEngine, FormulaErrorCode } from '@openhead/formula';

describe('Information & Advanced Math Formula Test Suite', () => {
  it('should evaluate information functions ISBLANK, ISNUMBER, ISTEXT, ISERROR, TYPE', () => {
    const engine = new FormulaEngine();
    engine.setCellValue({ col: 0, row: 0 }, 42); // A1
    engine.setCellValue({ col: 0, row: 1 }, 'Openhead'); // A2
    engine.setCellValue({ col: 0, row: 2 }, '=1/0'); // A3 -> #DIV/0!

    engine.setCellValue({ col: 1, row: 0 }, '=ISNUMBER(A1)'); // B1
    engine.setCellValue({ col: 1, row: 1 }, '=ISTEXT(A2)'); // B2
    engine.setCellValue({ col: 1, row: 2 }, '=ISERROR(A3)'); // B3
    engine.setCellValue({ col: 1, row: 3 }, '=ISBLANK(A4)'); // B4
    engine.setCellValue({ col: 1, row: 4 }, '=TYPE(A1)'); // B5

    expect(engine.getCellValue({ col: 1, row: 0 })).toBe(true);
    expect(engine.getCellValue({ col: 1, row: 1 })).toBe(true);
    expect(engine.getCellValue({ col: 1, row: 2 })).toBe(true);
    expect(engine.getCellValue({ col: 1, row: 3 })).toBe(true);
    expect(engine.getCellValue({ col: 1, row: 4 })).toBe(1);
  });

  it('should evaluate XLOOKUP with exact match and custom defaults', () => {
    const engine = new FormulaEngine();
    // IDs in A1:A3, Names in B1:B3
    engine.setCellValue({ col: 0, row: 0 }, 101); engine.setCellValue({ col: 1, row: 0 }, 'Alice');
    engine.setCellValue({ col: 0, row: 1 }, 102); engine.setCellValue({ col: 1, row: 1 }, 'Bob');
    engine.setCellValue({ col: 0, row: 2 }, 103); engine.setCellValue({ col: 1, row: 2 }, 'Charlie');

    engine.setCellValue({ col: 2, row: 0 }, '=XLOOKUP(102, A1:A3, B1:B3)');
    expect(engine.getCellValue({ col: 2, row: 0 })).toBe('Bob');

    engine.setCellValue({ col: 2, row: 1 }, '=XLOOKUP(999, A1:A3, B1:B3, "Not Found")');
    expect(engine.getCellValue({ col: 2, row: 1 })).toBe('Not Found');
  });

  it('should evaluate SUMPRODUCT, MOD, ROUNDUP, and ROUNDDOWN', () => {
    const engine = new FormulaEngine();
    // Units in A1:A3, Unit Prices in B1:B3
    engine.setCellValue({ col: 0, row: 0 }, 2); engine.setCellValue({ col: 1, row: 0 }, 10); // 20
    engine.setCellValue({ col: 0, row: 1 }, 3); engine.setCellValue({ col: 1, row: 1 }, 25); // 75
    engine.setCellValue({ col: 0, row: 2 }, 5); engine.setCellValue({ col: 1, row: 2 }, 4);  // 20 -> Sum: 115

    engine.setCellValue({ col: 2, row: 0 }, '=SUMPRODUCT(A1:A3, B1:B3)');
    expect(engine.getCellValue({ col: 2, row: 0 })).toBe(115);

    engine.setCellValue({ col: 2, row: 1 }, '=MOD(29, 6)');
    expect(engine.getCellValue({ col: 2, row: 1 })).toBe(5);

    engine.setCellValue({ col: 2, row: 2 }, '=ROUNDUP(3.14159, 2)');
    expect(engine.getCellValue({ col: 2, row: 2 })).toBe(3.15);

    engine.setCellValue({ col: 2, row: 3 }, '=ROUNDDOWN(3.14159, 2)');
    expect(engine.getCellValue({ col: 2, row: 3 })).toBe(3.14);
  });

  it('should calculate EOMONTH, WORKDAY, and NETWORKDAYS', () => {
    const engine = new FormulaEngine();
    engine.setCellValue({ col: 0, row: 0 }, '2026-01-15');

    engine.setCellValue({ col: 1, row: 0 }, '=EOMONTH(A1, 1)');
    expect(engine.getCellValue({ col: 1, row: 0 })).toBe('2026-02-28');

    engine.setCellValue({ col: 1, row: 1 }, '=WORKDAY("2026-01-05", 5)');
    expect(engine.getCellValue({ col: 1, row: 1 })).toBe('2026-01-12');

    engine.setCellValue({ col: 1, row: 2 }, '=NETWORKDAYS("2026-01-05", "2026-01-16")');
    expect(engine.getCellValue({ col: 1, row: 2 })).toBe(10);
  });
});
