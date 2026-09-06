import { describe, it, expect } from 'vitest';
import { SumWorkbook } from '../workbook';
import { exportWorksheetToCsv, importCsvToWorksheet } from '../csv';
import { formatCellValue } from '../formatting';

describe('SumWorkbook', () => {
  it('should initialize empty workbook and manage cells with calculation cascading', () => {
    const wb = new SumWorkbook();
    wb.setCellValue('A1', 100);
    wb.setCellValue('A2', 250);
    wb.setCellValue('A3', '=SUM(A1:A2)');

    const sheet = wb.getActiveSheet();
    expect(sheet.cells['A1'].value).toBe(100);
    expect(sheet.cells['A2'].value).toBe(250);
    expect(sheet.cells['A3'].value).toBe(350);

    // Update A1
    wb.setCellValue('A1', 200);
    expect(wb.getActiveSheet().cells['A3'].value).toBe(450);
  });

  it('should format cell numbers, currency, and percentages', () => {
    expect(formatCellValue(1234.56, { type: 'currency', currencySymbol: '$', decimals: 2 })).toBe('$1,234.56');
    expect(formatCellValue(0.854, { type: 'percent', decimals: 1 })).toBe('85.4%');
  });

  it('should export and import CSV data faithfully', () => {
    const wb = new SumWorkbook();
    wb.setCellValue('A1', 'Item');
    wb.setCellValue('B1', 'Cost');
    wb.setCellValue('A2', 'Server');
    wb.setCellValue('B2', 500);

    const csv = exportWorksheetToCsv(wb.getActiveSheet());
    expect(csv).toContain('Item,Cost');
    expect(csv).toContain('Server,500');

    const imported = importCsvToWorksheet(csv, 'Imported');
    expect(imported.cells['A1'].value).toBe('Item');
    expect(imported.cells['B2'].value).toBe(500);
  });
});
