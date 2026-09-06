import { describe, it, expect } from 'vitest';
import { FormulaEngine, FormulaErrorCode } from '@openhead/formula';

describe('Dynamic Arrays & Spill Range Calculation Suite', () => {
  it('should evaluate SEQUENCE and generate dynamic array spill range', () => {
    const engine = new FormulaEngine();
    engine.setCellValue({ col: 0, row: 0 }, '=SEQUENCE(3, 2, 10, 5)'); // A1

    // A1 = 10, B1 = 15
    // A2 = 20, B2 = 25
    // A3 = 30, B3 = 35
    expect(engine.getCellValue({ col: 0, row: 0 })).toBe(10);
    expect(engine.getCellValue({ col: 1, row: 0 })).toBe(15);
    expect(engine.getCellValue({ col: 0, row: 1 })).toBe(20);
    expect(engine.getCellValue({ col: 1, row: 1 })).toBe(25);
    expect(engine.getCellValue({ col: 0, row: 2 })).toBe(30);
    expect(engine.getCellValue({ col: 1, row: 2 })).toBe(35);

    const infoA1 = engine.getSpillInfo({ col: 0, row: 0 });
    expect(infoA1.isOrigin).toBe(true);

    const infoB2 = engine.getSpillInfo({ col: 1, row: 1 });
    expect(infoB2.isSpill).toBe(true);
    expect(infoB2.origin).toBe('A1');
  });

  it('should detect #SPILL! collision when destination cell is already occupied', () => {
    const engine = new FormulaEngine();
    // Pre-occupy B2
    engine.setCellValue({ col: 1, row: 1 }, 'Obstruction'); // B2

    // Set A1 to sequence that wants to cover B2
    engine.setCellValue({ col: 0, row: 0 }, '=SEQUENCE(3, 2)'); // A1

    expect(engine.getCellValue({ col: 0, row: 0 })).toBe(FormulaErrorCode.SPILL);
    expect(engine.getCellValue({ col: 1, row: 1 })).toBe('Obstruction');

    // Remove obstruction and verify automatic recovery
    engine.setCellValue({ col: 1, row: 1 }, null);
    expect(engine.getCellValue({ col: 0, row: 0 })).toBe(1); // A1
    expect(engine.getCellValue({ col: 1, row: 0 })).toBe(2); // B1
    expect(engine.getCellValue({ col: 0, row: 1 })).toBe(3); // A2
    expect(engine.getCellValue({ col: 1, row: 1 })).toBe(4); // B2
  });

  it('should filter arrays with FILTER and sort with SORT / SORTBY', () => {
    const engine = new FormulaEngine();
    // Matrix in A1:B4
    engine.setCellValue({ col: 0, row: 0 }, 'Alice'); engine.setCellValue({ col: 1, row: 0 }, 95);
    engine.setCellValue({ col: 0, row: 1 }, 'Bob');   engine.setCellValue({ col: 1, row: 1 }, 72);
    engine.setCellValue({ col: 0, row: 2 }, 'Charlie'); engine.setCellValue({ col: 1, row: 2 }, 88);
    engine.setCellValue({ col: 0, row: 3 }, 'David'); engine.setCellValue({ col: 1, row: 3 }, 60);

    // Filter students with score >= 80 -> Alice (95), Charlie (88) in D1
    engine.setCellValue({ col: 3, row: 0 }, '=FILTER(A1:B4, B1:B4 >= 80)');
    expect(engine.getCellValue({ col: 3, row: 0 })).toBe('Alice');
    expect(engine.getCellValue({ col: 4, row: 0 })).toBe(95);
    expect(engine.getCellValue({ col: 3, row: 1 })).toBe('Charlie');
    expect(engine.getCellValue({ col: 4, row: 1 })).toBe(88);

    // Sort descending by score in G1
    engine.setCellValue({ col: 6, row: 0 }, '=SORT(A1:B4, 2, -1)');
    expect(engine.getCellValue({ col: 6, row: 0 })).toBe('Alice');
    expect(engine.getCellValue({ col: 7, row: 0 })).toBe(95);
    expect(engine.getCellValue({ col: 6, row: 1 })).toBe('Charlie');
    expect(engine.getCellValue({ col: 7, row: 1 })).toBe(88);
    expect(engine.getCellValue({ col: 6, row: 2 })).toBe('Bob');
    expect(engine.getCellValue({ col: 7, row: 2 })).toBe(72);
  });

  it('should transpose matrices with TRANSPOSE', () => {
    const engine = new FormulaEngine();
    engine.setCellValue({ col: 0, row: 0 }, 10); engine.setCellValue({ col: 1, row: 0 }, 20); engine.setCellValue({ col: 2, row: 0 }, 30);
    engine.setCellValue({ col: 0, row: 1 }, 40); engine.setCellValue({ col: 1, row: 1 }, 50); engine.setCellValue({ col: 2, row: 1 }, 60);

    // Transpose 2x3 to 3x2 in E1
    engine.setCellValue({ col: 4, row: 0 }, '=TRANSPOSE(A1:C2)');
    expect(engine.getCellValue({ col: 4, row: 0 })).toBe(10);
    expect(engine.getCellValue({ col: 5, row: 0 })).toBe(40);
    expect(engine.getCellValue({ col: 4, row: 1 })).toBe(20);
    expect(engine.getCellValue({ col: 5, row: 1 })).toBe(50);
    expect(engine.getCellValue({ col: 4, row: 2 })).toBe(30);
    expect(engine.getCellValue({ col: 5, row: 2 })).toBe(60);
  });
});
