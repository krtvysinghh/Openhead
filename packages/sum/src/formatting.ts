import { FormulaValue } from '@openhead/formula';
import { CellFormat } from './types';

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

    case 'text':
      return String(value);

    default:
      return String(value);
  }
}
