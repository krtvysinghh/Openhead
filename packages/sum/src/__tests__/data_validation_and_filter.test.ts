import { describe, it, expect } from 'vitest';
import {
  DataValidationEngine,
  DataValidationRule,
  SortingFilteringEngine,
  WorksheetModel,
} from '../index';

describe('Data Validation & AutoFilter Engine', () => {
  it('should validate cell values against list rules', () => {
    const rule: DataValidationRule = {
      id: 'dv_1',
      type: 'list',
      sqref: 'A1:A10',
      formula1: '"Engineering,Marketing,Finance,HR"',
      allowBlank: false,
    };

    expect(DataValidationEngine.validate('Engineering', rule).valid).toBe(true);
    expect(DataValidationEngine.validate('marketing', rule).valid).toBe(true);
    expect(DataValidationEngine.validate('Legal', rule).valid).toBe(false);
    expect(DataValidationEngine.validate('', rule).valid).toBe(false);
  });

  it('should validate whole number and decimal bounds', () => {
    const wholeRule: DataValidationRule = {
      id: 'dv_2',
      type: 'whole',
      operator: 'between',
      sqref: 'B1:B10',
      formula1: '10',
      formula2: '50',
    };

    expect(DataValidationEngine.validate(25, wholeRule).valid).toBe(true);
    expect(DataValidationEngine.validate(10, wholeRule).valid).toBe(true);
    expect(DataValidationEngine.validate(50, wholeRule).valid).toBe(true);
    expect(DataValidationEngine.validate(5, wholeRule).valid).toBe(false);
    expect(DataValidationEngine.validate(25.5, wholeRule).valid).toBe(false); // not integer
  });

  it('should validate text length constraints', () => {
    const lenRule: DataValidationRule = {
      id: 'dv_3',
      type: 'textLength',
      operator: 'lessThanOrEqual',
      sqref: 'C1:C10',
      formula1: '5',
    };

    expect(DataValidationEngine.validate('Hello', lenRule).valid).toBe(true);
    expect(DataValidationEngine.validate('Hi', lenRule).valid).toBe(true);
    expect(DataValidationEngine.validate('TooLongText', lenRule).valid).toBe(false);
  });

  it('should check if cell coordinates are within sqref ranges', () => {
    expect(DataValidationEngine.isCellInSqref('A1', 'A1:A10')).toBe(true);
    expect(DataValidationEngine.isCellInSqref('A5', 'A1:A10')).toBe(true);
    expect(DataValidationEngine.isCellInSqref('B5', 'A1:A10')).toBe(false);
    expect(DataValidationEngine.isCellInSqref('C3', 'A1:B10 C1:C5')).toBe(true);
  });

  it('should non-destructively apply and clear AutoFilter on worksheet', () => {
    const sheet: WorksheetModel = {
      id: 'sheet_1',
      name: 'Employees',
      rowCount: 10,
      colCount: 5,
      cells: {
        A1: { raw: 'Name', value: 'Name' },
        B1: { raw: 'Dept', value: 'Dept' },
        A2: { raw: 'Alice', value: 'Alice' },
        B2: { raw: 'Eng', value: 'Eng' },
        A3: { raw: 'Bob', value: 'Bob' },
        B3: { raw: 'Sales', value: 'Sales' },
        A4: { raw: 'Charlie', value: 'Charlie' },
        B4: { raw: 'Eng', value: 'Eng' },
      },
    };

    // Filter column B (col 1) to only 'Eng'
    const filtered = SortingFilteringEngine.applyAutoFilter(sheet, {
      range: 'A1:B4',
      columnFilters: { 1: ['Eng'] },
    });

    // Row 3 (Bob, Sales) should be in hiddenRows (0-based row 2)
    expect(filtered.hiddenRows).toContain(2);
    expect(filtered.hiddenRows).not.toContain(1); // Alice visible
    expect(filtered.hiddenRows).not.toContain(3); // Charlie visible

    // Clear filter
    const cleared = SortingFilteringEngine.clearAutoFilter(filtered);
    expect(cleared.hiddenRows?.length).toBe(0);
  });

  it('should support multi-column sorting without reference loss', () => {
    const sheet: WorksheetModel = {
      id: 'sheet_1',
      name: 'Data',
      rowCount: 10,
      colCount: 5,
      cells: {
        A1: { raw: 'Dept', value: 'Dept' },
        B1: { raw: 'Score', value: 'Score' },
        A2: { raw: 'Sales', value: 'Sales' },
        B2: { raw: 80, value: 80 },
        A3: { raw: 'Eng', value: 'Eng' },
        B3: { raw: 95, value: 95 },
        A4: { raw: 'Sales', value: 'Sales' },
        B4: { raw: 90, value: 90 },
      },
    };

    // Sort by Dept ASC, then Score DESC
    const sorted = SortingFilteringEngine.sortColumns(sheet, [
      { colIndex: 0, ascending: true },
      { colIndex: 1, ascending: false },
    ]);

    expect(sorted.cells['A2'].value).toBe('Eng');
    expect(sorted.cells['B2'].value).toBe(95);
    expect(sorted.cells['A3'].value).toBe('Sales');
    expect(sorted.cells['B3'].value).toBe(90);
    expect(sorted.cells['A4'].value).toBe('Sales');
    expect(sorted.cells['B4'].value).toBe(80);
  });
});
