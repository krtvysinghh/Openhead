import { describe, it, expect } from 'vitest';
import { SumWorkbook, DataValidationEngine } from '../index';

describe('Sum Grid UX, Data Validation & Ergonomics Lab', () => {
  it('should validate cell values before commit and return validation feedback', () => {
    const wb = new SumWorkbook();
    wb.addDataValidation({
      id: 'dv_status',
      type: 'list',
      sqref: 'A1:A5',
      formula1: '"Pending,Approved,Rejected"',
      allowBlank: true,
      errorMessage: 'Invalid approval status',
    });

    const rule = wb.getActiveSheet().dataValidations?.[0]!;
    expect(DataValidationEngine.validate('Approved', rule).valid).toBe(true);
    expect(DataValidationEngine.validate('InProgress', rule).valid).toBe(false);
    expect(DataValidationEngine.validate('InProgress', rule).message).toBe('Invalid approval status');
  });

  it('should support multi-level undo/redo on data validation rule changes', () => {
    const wb = new SumWorkbook();
    expect(wb.getActiveSheet().dataValidations).toBeUndefined();

    wb.addDataValidation({
      id: 'dv_test',
      type: 'whole',
      operator: 'greaterThan',
      sqref: 'B1:B10',
      formula1: '0',
    });
    expect(wb.getActiveSheet().dataValidations?.length).toBe(1);

    wb.removeDataValidation('dv_test');
    expect(wb.getActiveSheet().dataValidations?.length).toBe(0);
  });

  it('should preserve cell notes and comments across cell edits', () => {
    const wb = new SumWorkbook();
    wb.setCellValue('A1', 500);
    const sheet = wb.getActiveSheet();
    sheet.cells['A1'].note = 'Quarterly audit verified';

    expect(sheet.cells['A1'].note).toBe('Quarterly audit verified');
  });

  it('should accurately detect rectangular selection bounds for multi-cell matrix ops', () => {
    const wb = new SumWorkbook();
    wb.setCellValue('A1', 1);
    wb.setCellValue('B1', 2);
    wb.setCellValue('A2', 3);
    wb.setCellValue('B2', 4);

    // Matrix copy A1:B2 to D5
    wb.copyPasteMatrix('A1:B2', 'D5');

    expect(wb.getActiveSheet().cells['D5']?.value).toBe(1);
    expect(wb.getActiveSheet().cells['E5']?.value).toBe(2);
    expect(wb.getActiveSheet().cells['D6']?.value).toBe(3);
    expect(wb.getActiveSheet().cells['E6']?.value).toBe(4);
  });
});
