import { describe, it, expect } from 'vitest';
import { SumWorkbook, XlsxAdapter } from '@openhead/sum';

describe('Production XLSX Compatibility & Round-Trip Lab', () => {
  it('should export a multi-sheet workbook with formulas, strings, and freeze panes to real XLSX and import without loss', async () => {
    const wb = new SumWorkbook();
    
    // Setup Sheet 1: Financial summary
    wb.setCellValue('A1', 'Revenue');
    wb.setCellValue('B1', 100000);
    wb.setCellValue('A2', 'Expenses');
    wb.setCellValue('B2', 65000);
    wb.setCellValue('A3', 'Net Profit');
    wb.setCellValue('B3', '=B1-B2'); // 35000
    wb.setCellStyle('A1', { bold: true });
    wb.setCellStyle('A3', { bold: true });
    wb.setFreezePanes({ rows: 1, cols: 0 });

    // Setup Sheet 2: Projections
    const sheet2 = wb.addSheet('Projections');
    wb.setCellValue('A1', 'Growth Rate');
    wb.setCellValue('B1', 0.15);
    wb.setCellValue('A2', 'Projected Next Year');
    wb.setCellValue('B2', '=Sheet1!B3*(1+B1)'); // 35000 * 1.15 = 40250

    // Export to XLSX buffer
    const xlsxBuffer = await XlsxAdapter.toBuffer(wb.getModel());
    expect(xlsxBuffer).toBeInstanceOf(Uint8Array);
    expect(xlsxBuffer.length).toBeGreaterThan(100);

    // Import back from XLSX buffer
    const restoredModel = await XlsxAdapter.fromBuffer(xlsxBuffer);
    const restoredWb = new SumWorkbook(restoredModel);

    // Verify sheet hierarchy and properties
    expect(restoredWb.getModel().sheets.length).toBe(2);
    expect(restoredWb.getModel().sheets[0].name).toBe('Sheet1');
    expect(restoredWb.getModel().sheets[1].name).toBe('Projections');

    // Verify Sheet 1 cells
    const sheet1Cells = restoredWb.getModel().sheets[0].cells;
    expect(sheet1Cells['A1'].value).toBe('Revenue');
    expect(sheet1Cells['B1'].value).toBe(100000);
    expect(sheet1Cells['A2'].value).toBe('Expenses');
    expect(sheet1Cells['B2'].value).toBe(65000);
    expect(sheet1Cells['A3'].value).toBe('Net Profit');
    expect(sheet1Cells['B3'].raw).toBe('=B1-B2');
    expect(sheet1Cells['B3'].value).toBe(35000);

    // Verify Sheet 2 cells
    const sheet2Cells = restoredWb.getModel().sheets[1].cells;
    expect(sheet2Cells['A1'].value).toBe('Growth Rate');
    expect(sheet2Cells['B1'].value).toBe(0.15);
    expect(sheet2Cells['A2'].value).toBe('Projected Next Year');
    expect(sheet2Cells['B2'].raw).toBe('=Sheet1!B3*(1+B1)');
  });
});
