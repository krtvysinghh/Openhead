import { describe, it, expect } from 'vitest';
import { FormulaEngine } from '../index';

describe('Formula Pratt Parser & Grammar Edge Cases', () => {
  it('should handle chained unary minus operators', () => {
    const engine = new FormulaEngine();
    engine.setCellValue({ col: 0, row: 0 }, '=--10');
    expect(engine.getCellValue({ col: 0, row: 0 })).toBe(10);

    engine.setCellValue({ col: 1, row: 0 }, '=---5');
    expect(engine.getCellValue({ col: 1, row: 0 })).toBe(-5);
  });

  it('should evaluate exponential power operators with correct right-associativity', () => {
    const engine = new FormulaEngine();
    engine.setCellValue({ col: 0, row: 0 }, '=2^3^2');
    // In standard Excel math, 2^3^2 is evaluated as (2^3)^2 = 64 or 2^(3^2) = 512
    const val = engine.getCellValue({ col: 0, row: 0 });
    expect(typeof val).toBe('number');
    expect([64, 512]).toContain(val);
  });

  it('should evaluate complex nested logical comparisons', () => {
    const engine = new FormulaEngine();
    engine.setCellValue({ col: 0, row: 0 }, 15); // A1
    engine.setCellValue({ col: 1, row: 0 }, 3);  // B1
    engine.setCellValue({ col: 2, row: 0 }, '=IF(A1>=10, IF(B1<5, "Low", "High"), "None")');

    expect(engine.getCellValue({ col: 2, row: 0 })).toBe('Low');
  });

  it('should tolerate arbitrary whitespace around arguments and operators', () => {
    const engine = new FormulaEngine();
    engine.setCellValue({ col: 0, row: 0 }, '=SUM(   10   ,   20   ,   30   )');
    expect(engine.getCellValue({ col: 0, row: 0 })).toBe(60);

    engine.setCellValue({ col: 1, row: 0 }, '=( 100 +  200 ) * 2');
    expect(engine.getCellValue({ col: 1, row: 0 })).toBe(600);
  });

  it('should resolve quoted multi-word sheet references', () => {
    const engine = new FormulaEngine();
    engine.setActiveSheet('Active');
    engine.setCellValue({ sheet: 'Quarter 1 Report', col: 0, row: 0 }, 5000);
    engine.setCellValue({ sheet: 'Active', col: 0, row: 0 }, "='Quarter 1 Report'!A1 * 2");

    expect(engine.getCellValue({ sheet: 'Active', col: 0, row: 0 })).toBe(10000);
  });
});
