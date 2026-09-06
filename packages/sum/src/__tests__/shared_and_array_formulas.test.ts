import { describe, it, expect } from 'vitest';
import { XlsxAdapter, shiftFormulaReferences } from '../index';

describe('Shared & Array Formulas Fidelity', () => {
  it('should accurately translate relative, absolute, and mixed coordinates', () => {
    const formula = '=B1 + $C$1 + D$1 + $E1';
    
    // Shift right 2 columns (dCol = 2), down 3 rows (dRow = 3)
    const shifted = shiftFormulaReferences(formula, 3, 2);
    expect(shifted).toBe('=D4 + $C$1 + F$1 + $E4');

    // Shift with sheet name prefix
    const crossSheet = '=Sheet1!A1 + $B$2';
    const crossShifted = shiftFormulaReferences(crossSheet, 1, 1);
    expect(crossShifted).toBe('=Sheet1!B2 + $B$2');

    // Shift causing negative coordinates should emit #REF!
    const outOfBounds = shiftFormulaReferences('=A1', -2, 0);
    expect(outOfBounds).toBe('=#REF!');
  });

  it('should preserve and parse legacy array formulas in XLSX archives', async () => {
    const model = {
      metadata: { id: 'wb_arr', title: 'Array Formula', type: 'sum' as const, createdAt: 0, updatedAt: 0, version: 1 },
      sheets: [
        {
          id: 's1',
          name: 'ArraySheet',
          rowCount: 20,
          colCount: 10,
          cells: {
            A1: { raw: 10, value: 10 },
            A2: { raw: 20, value: 20 },
            B1: { raw: '=SUM(A1:A2*2)', value: 60, isArrayFormula: true },
          },
        },
      ],
      activeSheetId: 's1',
    };

    const buffer = await XlsxAdapter.toBuffer(model);
    const imported = await XlsxAdapter.fromBuffer(buffer);

    const cellB1 = imported.sheets[0].cells['B1'];
    expect(cellB1.raw).toBe('=SUM(A1:A2*2)');
    expect(cellB1.isArrayFormula).toBe(true);
  });
});
