import { describe, it, expect } from 'vitest';
import {
  XlsxAdapter,
  WorkbookModel,
  excelDateToDate,
  dateToExcelDate,
  getFormatFromNumFmtId,
  formatCellValue,
} from '../index';

describe('XLSX Styles & Number Formats Engine', () => {
  it('should convert between JavaScript Dates and Excel Serial Dates accurately', () => {
    const testDate = new Date(2026, 2, 6, 12, 0, 0); // March 6, 2026
    const serial = dateToExcelDate(testDate);
    expect(serial).toBeGreaterThan(45000);

    const reconstructed = excelDateToDate(serial);
    expect(reconstructed.getFullYear()).toBe(2026);
    expect(reconstructed.getMonth()).toBe(2);
    expect(reconstructed.getDate()).toBe(6);
  });

  it('should map standard OOXML numFmtIds to CellFormat models', () => {
    expect(getFormatFromNumFmtId(1).type).toBe('number');
    expect(getFormatFromNumFmtId(1).decimals).toBe(0);
    expect(getFormatFromNumFmtId(2).decimals).toBe(2);
    expect(getFormatFromNumFmtId(9).type).toBe('percent');
    expect(getFormatFromNumFmtId(10).decimals).toBe(2);
    expect(getFormatFromNumFmtId(14).type).toBe('date');
    expect(getFormatFromNumFmtId(20).type).toBe('time');
    expect(getFormatFromNumFmtId(44).type).toBe('currency');

    const custom = getFormatFromNumFmtId(164, '[$€-2] #,##0.00');
    expect(custom.type).toBe('currency');
  });

  it('should format cell values according to CellFormat specifications', () => {
    expect(formatCellValue(1234.56, { type: 'number', decimals: 2 })).toBe('1,234.56');
    expect(formatCellValue(0.155, { type: 'percent', decimals: 1 })).toBe('15.5%');
    expect(formatCellValue(99.99, { type: 'currency', currencySymbol: '$', decimals: 2 })).toBe('$99.99');
    expect(formatCellValue(1234567, { type: 'scientific', decimals: 2 })).toBe('1.23e+6');
  });

  it('should preserve rich font, fill, border, and alignment styles through XLSX round-trip', async () => {
    const model: WorkbookModel = {
      metadata: { id: 'wb_styles', title: 'Styles Test', type: 'sum', createdAt: 0, updatedAt: 0, version: 1 },
      sheets: [
        {
          id: 'sheet_styles',
          name: 'StyledSheet',
          rowCount: 20,
          colCount: 10,
          cells: {
            A1: {
              raw: 'Bold Blue',
              value: 'Bold Blue',
              style: {
                bold: true,
                italic: true,
                underline: true,
                fontSize: 16,
                fontFamily: 'Arial',
                color: '#2563EB',
                background: '#EFF6FF',
                alignment: { horizontal: 'center', vertical: 'center', wrapText: true },
                borders: {
                  top: { style: 'thin', color: '#000000' },
                  bottom: { style: 'double', color: '#1E293B' },
                },
              },
            },
            B2: {
              raw: 1250.75,
              value: 1250.75,
              format: { type: 'currency', currencySymbol: '$', decimals: 2 },
            },
          },
        },
      ],
      activeSheetId: 'sheet_styles',
    };

    const buffer = await XlsxAdapter.toBuffer(model);
    expect(buffer.length).toBeGreaterThan(100);

    const imported = await XlsxAdapter.fromBuffer(buffer);
    const cellA1 = imported.sheets[0].cells['A1'];
    expect(cellA1.raw).toBe('Bold Blue');
    expect(cellA1.style?.bold).toBe(true);
    expect(cellA1.style?.italic).toBe(true);
    expect(cellA1.style?.underline).toBe(true);
    expect(cellA1.style?.fontSize).toBe(16);
    expect(cellA1.style?.fontFamily).toBe('Arial');
    expect(cellA1.style?.alignment?.wrapText).toBe(true);
    const bottomBorder = cellA1.style?.borders?.bottom;
    expect(typeof bottomBorder === 'object' && bottomBorder.style).toBe('double');

    const cellB2 = imported.sheets[0].cells['B2'];
    expect(cellB2.value).toBe(1250.75);
    expect(cellB2.format?.type).toBe('currency');
  });
});
