import { FormulaValue } from '@openhead/formula';
import { CellFormat } from './types';

export const BUILTIN_NUM_FMTS: Record<number, string> = {
  0: 'General',
  1: '0',
  2: '0.00',
  3: '#,##0',
  4: '#,##0.00',
  9: '0%',
  10: '0.00%',
  11: '0.00E+00',
  12: '# ?/?',
  13: '# ??/??',
  14: 'yyyy-mm-dd',
  15: 'd-mmm-yy',
  16: 'd-mmm',
  17: 'mmm-yy',
  18: 'h:mm AM/PM',
  19: 'h:mm:ss AM/PM',
  20: 'h:mm',
  21: 'h:mm:ss',
  22: 'yyyy-mm-dd h:mm',
  37: '#,##0 ;(#,##0)',
  38: '#,##0 ;[Red](#,##0)',
  39: '#,##0.00;(#,##0.00)',
  40: '#,##0.00;[Red](#,##0.00)',
  44: '$#,##0.00;($#,##0.00);"-"',
  45: 'mm:ss',
  46: '[h]:mm:ss',
  47: 'mmss.0',
  48: '##0.0E+0',
  49: '@',
};

/**
 * Converts Excel Serial Date number (days since Dec 30, 1899) to JavaScript Date
 */
export function excelDateToDate(serial: number): Date {
  const utcDays = Math.floor(serial - 25569);
  const utcValue = utcDays * 86400;
  const dateInfo = new Date(utcValue * 1000);
  const fractionalDay = serial - Math.floor(serial) + 0.0000001;
  let totalSeconds = Math.floor(86400 * fractionalDay);
  const seconds = totalSeconds % 60;
  totalSeconds -= seconds;
  const hours = Math.floor(totalSeconds / (60 * 60));
  const minutes = Math.floor(totalSeconds / 60) % 60;
  return new Date(dateInfo.getFullYear(), dateInfo.getMonth(), dateInfo.getDate(), hours, minutes, seconds);
}

/**
 * Converts JavaScript Date to Excel Serial Date number
 */
export function dateToExcelDate(date: Date): number {
  const returnDateTime = 25569.0 + (date.getTime() - date.getTimezoneOffset() * 60000) / (86400 * 1000);
  return parseFloat(returnDateTime.toFixed(6));
}

export function getFormatFromNumFmtId(numFmtId: number, customCode?: string): CellFormat {
  if (customCode) {
    if (customCode.includes('%')) return { type: 'percent', decimals: 2, formatString: customCode };
    if (customCode.includes('$') || customCode.includes('€') || customCode.includes('£')) {
      return { type: 'currency', currencySymbol: '$', decimals: 2, formatString: customCode };
    }
    if (customCode.toLowerCase().includes('yy') || customCode.toLowerCase().includes('mm') || customCode.toLowerCase().includes('dd')) {
      return { type: 'date', formatString: customCode };
    }
    return { type: 'custom', formatString: customCode };
  }

  switch (numFmtId) {
    case 1:
      return { type: 'number', decimals: 0 };
    case 2:
      return { type: 'number', decimals: 2 };
    case 3:
      return { type: 'number', decimals: 0 };
    case 4:
      return { type: 'number', decimals: 2 };
    case 9:
      return { type: 'percent', decimals: 0 };
    case 10:
      return { type: 'percent', decimals: 2 };
    case 11:
      return { type: 'scientific', decimals: 2 };
    case 14:
    case 15:
    case 16:
    case 17:
      return { type: 'date' };
    case 18:
    case 19:
    case 20:
    case 21:
      return { type: 'time' };
    case 22:
      return { type: 'date' };
    case 44:
      return { type: 'currency', currencySymbol: '$', decimals: 2 };
    case 49:
      return { type: 'text' };
    default:
      return { type: 'general' };
  }
}

export function getNumFmtIdFromFormat(format: CellFormat): { numFmtId: number; customCode?: string } {
  if (format.formatString) {
    return { numFmtId: 164, customCode: format.formatString };
  }

  switch (format.type) {
    case 'number':
      return { numFmtId: (format.decimals ?? 2) === 0 ? 1 : 2 };
    case 'percent':
      return { numFmtId: (format.decimals ?? 2) === 0 ? 9 : 10 };
    case 'currency':
      return { numFmtId: 44, customCode: `"${format.currencySymbol || '$'}"#,##0.00;("${format.currencySymbol || '$'}"#,##0.00);"-"` };
    case 'date':
      return { numFmtId: 14 };
    case 'time':
      return { numFmtId: 20 };
    case 'scientific':
      return { numFmtId: 11 };
    case 'text':
      return { numFmtId: 49 };
    default:
      return { numFmtId: 0 };
  }
}

export function formatCellValue(value: FormulaValue, format?: CellFormat): string {
  if (value === null || value === undefined) return '';
  if (typeof value === 'boolean') return value ? 'TRUE' : 'FALSE';

  if (!format || format.type === 'general') {
    return String(value);
  }

  const num = Number(value);
  if (isNaN(num)) return String(value);

  const decimals = format.decimals ?? 2;

  switch (format.type) {
    case 'number':
      return num.toLocaleString(undefined, {
        minimumFractionDigits: decimals,
        maximumFractionDigits: decimals,
      });

    case 'currency': {
      const symbol = format.currencySymbol || '$';
      return `${symbol}${num.toLocaleString(undefined, {
        minimumFractionDigits: decimals,
        maximumFractionDigits: decimals,
      })}`;
    }

    case 'percent':
      return `${(num * 100).toFixed(decimals)}%`;

    case 'date': {
      // If number is a serial date
      const date = num > 1000 ? excelDateToDate(num) : new Date(String(value));
      if (!isNaN(date.getTime())) {
        return date.toISOString().split('T')[0];
      }
      return String(value);
    }

    case 'time': {
      const date = excelDateToDate(num);
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    }

    case 'scientific':
      return num.toExponential(decimals);

    case 'text':
      return String(value);

    default:
      return String(value);
  }
}
