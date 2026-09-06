import { describe, it, expect } from 'vitest';
import { SumWorkbook, XlsxAdapter } from '../index';

describe('Defined Names & Named Ranges Lab', () => {
  it('should register and export workbook-level defined names to XLSX', async () => {
    const wb = new SumWorkbook();
    wb.addDefinedName('TaxRate', '0.075', undefined, 'Standard sales tax rate');
    wb.addDefinedName('CorporateDiscount', '0.15');

    const model = wb.getModel();
    expect(model.definedNames?.length).toBe(2);
    expect(model.definedNames?.find((d) => d.name === 'TaxRate')?.formula).toBe('0.075');

    const buffer = await XlsxAdapter.toBuffer(model);
    const imported = await XlsxAdapter.fromBuffer(buffer);

    expect(imported.definedNames?.length).toBe(2);
    const importedTax = imported.definedNames?.find((d) => d.name === 'TaxRate');
    expect(importedTax?.formula).toBe('0.075');
  });

  it('should support updating and removing defined names', () => {
    const wb = new SumWorkbook();
    wb.addDefinedName('Discount', '0.10');
    expect(wb.getModel().definedNames?.find((d) => d.name === 'Discount')?.formula).toBe('0.10');

    // Update
    wb.addDefinedName('Discount', '0.12');
    expect(wb.getModel().definedNames?.length).toBe(1);
    expect(wb.getModel().definedNames?.find((d) => d.name === 'Discount')?.formula).toBe('0.12');

    // Remove
    wb.removeDefinedName('Discount');
    expect(wb.getModel().definedNames?.length).toBe(0);
  });

  it('should support sheet-scoped defined names', async () => {
    const wb = new SumWorkbook();
    const sheet2 = wb.addSheet('Europe');
    wb.addDefinedName('VAT', '0.20', sheet2.id);

    const model = wb.getModel();
    expect(model.definedNames?.find((d) => d.name === 'VAT')?.sheetScopeId).toBe(sheet2.id);

    const buffer = await XlsxAdapter.toBuffer(model);
    const imported = await XlsxAdapter.fromBuffer(buffer);

    expect(imported.definedNames?.some((d) => d.name === 'VAT')).toBe(true);
  });
});
