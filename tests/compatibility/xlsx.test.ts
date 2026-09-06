import { describe, it, expect } from 'vitest';
import { SumWorkbook, exportWorksheetToCsv, importCsvToWorksheet } from '@openhead/sum';

describe('Office Compatibility Lab - XLSX & Spreadsheet Data Interchange', () => {
  it('should serialize and parse multi-row matrix data preserving numeric and string cell values', () => {
    const wb = new SumWorkbook();
    wb.setCellValue('A1', 'SKU');
    wb.setCellValue('B1', 'Units');
    wb.setCellValue('C1', 'Price');
    wb.setCellValue('D1', 'Total');

    wb.setCellValue('A2', 'SERVER-RACK-01');
    wb.setCellValue('B2', 5);
    wb.setCellValue('C2', 1200);
    wb.setCellValue('D2', '=B2 * C2');

    const csv = exportWorksheetToCsv(wb.getActiveSheet());
    const imported = importCsvToWorksheet(csv, 'Restored');

    expect(imported.cells['A2'].value).toBe('SERVER-RACK-01');
    expect(imported.cells['B2'].value).toBe(5);
    expect(imported.cells['C2'].value).toBe(1200);
  });
});
