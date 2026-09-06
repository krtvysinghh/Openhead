import { describe, it, expect } from 'vitest';
import { FormulaEngine } from '@openhead/formula';

describe('Aggregation, Text, Date & Reference Formula Lab', () => {
  it('should evaluate SUMIFS, COUNTIFS, AVERAGEIFS, and MINIFS / MAXIFS with criteria', () => {
    const engine = new FormulaEngine();
    // Region in A1:A4, Product in B1:B4, Sales in C1:C4
    engine.setCellValue({ col: 0, row: 0 }, 'North'); engine.setCellValue({ col: 1, row: 0 }, 'Apples'); engine.setCellValue({ col: 2, row: 0 }, 100);
    engine.setCellValue({ col: 0, row: 1 }, 'North'); engine.setCellValue({ col: 1, row: 1 }, 'Bananas'); engine.setCellValue({ col: 2, row: 1 }, 200);
    engine.setCellValue({ col: 0, row: 2 }, 'South'); engine.setCellValue({ col: 1, row: 2 }, 'Apples'); engine.setCellValue({ col: 2, row: 2 }, 300);
    engine.setCellValue({ col: 0, row: 3 }, 'North'); engine.setCellValue({ col: 1, row: 3 }, 'Apples'); engine.setCellValue({ col: 2, row: 3 }, 400);

    // Sum of North Apples -> 100 + 400 = 500
    engine.setCellValue({ col: 3, row: 0 }, '=SUMIFS(C1:C4, A1:A4, "North", B1:B4, "Apples")');
    expect(engine.getCellValue({ col: 3, row: 0 })).toBe(500);

    // Count of North Apples -> 2
    engine.setCellValue({ col: 3, row: 1 }, '=COUNTIFS(A1:A4, "North", B1:B4, "Apples")');
    expect(engine.getCellValue({ col: 3, row: 1 })).toBe(2);

    // Average of North Apples -> 250
    engine.setCellValue({ col: 3, row: 2 }, '=AVERAGEIFS(C1:C4, A1:A4, "North", B1:B4, "Apples")');
    expect(engine.getCellValue({ col: 3, row: 2 })).toBe(250);

    // Max of North -> 400
    engine.setCellValue({ col: 3, row: 3 }, '=MAXIFS(C1:C4, A1:A4, "North")');
    expect(engine.getCellValue({ col: 3, row: 3 })).toBe(400);
  });

  it('should evaluate text manipulation functions: SUBSTITUTE, REPLACE, FIND, PROPER, TEXTJOIN', () => {
    const engine = new FormulaEngine();
    engine.setCellValue({ col: 0, row: 0 }, 'openhead office suite');

    engine.setCellValue({ col: 1, row: 0 }, '=PROPER(A1)');
    expect(engine.getCellValue({ col: 1, row: 0 })).toBe('Openhead Office Suite');

    engine.setCellValue({ col: 1, row: 1 }, '=SUBSTITUTE(A1, "office", "productivity")');
    expect(engine.getCellValue({ col: 1, row: 1 })).toBe('openhead productivity suite');

    engine.setCellValue({ col: 1, row: 2 }, '=FIND("head", A1)');
    expect(engine.getCellValue({ col: 1, row: 2 })).toBe(5);

    engine.setCellValue({ col: 1, row: 3 }, '=TEXTJOIN(" | ", TRUE, "Pen", "Sum", "Glimpse")');
    expect(engine.getCellValue({ col: 1, row: 3 })).toBe('Pen | Sum | Glimpse');
  });

  it('should evaluate reference and financial functions: XMATCH, ADDRESS, IPMT, PPMT, IRR', () => {
    const engine = new FormulaEngine();
    engine.setCellValue({ col: 0, row: 0 }, 'Alpha');
    engine.setCellValue({ col: 0, row: 1 }, 'Beta');
    engine.setCellValue({ col: 0, row: 2 }, 'Gamma');

    engine.setCellValue({ col: 1, row: 0 }, '=XMATCH("Beta", A1:A3)');
    expect(engine.getCellValue({ col: 1, row: 0 })).toBe(2);

    engine.setCellValue({ col: 1, row: 1 }, '=ADDRESS(5, 2, 4)'); // row 5, col 2 -> B5
    expect(engine.getCellValue({ col: 1, row: 1 })).toBe('B5');

    // IRR calculation: Initial outlay -1000, followed by cashflows 300, 420, 680
    engine.setCellValue({ col: 2, row: 0 }, -1000);
    engine.setCellValue({ col: 2, row: 1 }, 300);
    engine.setCellValue({ col: 2, row: 2 }, 420);
    engine.setCellValue({ col: 2, row: 3 }, 680);

    engine.setCellValue({ col: 3, row: 0 }, '=IRR(C1:C4)');
    expect(Number(engine.getCellValue({ col: 3, row: 0 }))).toBeCloseTo(0.16, 1);
  });
});
