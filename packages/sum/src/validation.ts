import { FormulaValue, parseCellAddress, parseRangeAddress } from '@openhead/formula';
import { DataValidationRule } from './types';

export class DataValidationEngine {
  /**
   * Check if a cell coordinate matches an sqref string (e.g. "A1", "A1:A10", "A1:B5 C1:D10")
   */
  public static isCellInSqref(cellKey: string, sqref: string): boolean {
    const target = parseCellAddress(cellKey);
    if (!target) return false;

    const ranges = sqref.split(/\s+/).filter(Boolean);
    for (const r of ranges) {
      if (r.includes(':')) {
        const parsedRange = parseRangeAddress(r);
        if (parsedRange) {
          const inRow = target.row >= parsedRange.start.row && target.row <= parsedRange.end.row;
          const inCol = target.col >= parsedRange.start.col && target.col <= parsedRange.end.col;
          if (inRow && inCol) return true;
        }
      } else {
        const single = parseCellAddress(r);
        if (single && single.row === target.row && single.col === target.col) {
          return true;
        }
      }
    }
    return false;
  }

  /**
   * Validate a cell value against a DataValidationRule
   */
  public static validate(value: FormulaValue, rule: DataValidationRule): { valid: boolean; message?: string } {
    if (value === null || value === undefined || value === '') {
      if (rule.allowBlank !== false) {
        return { valid: true };
      }
      return {
        valid: false,
        message: rule.errorMessage || 'Value cannot be blank.',
      };
    }

    const defaultError = rule.errorMessage || 'The value does not meet the validation criteria.';

    switch (rule.type) {
      case 'list': {
        const rawList = rule.formula1.replace(/^"|"$/g, '');
        const allowedItems = rawList.split(',').map((s) => s.trim().toLowerCase());
        const strVal = String(value).trim().toLowerCase();
        const valid = allowedItems.includes(strVal);
        return { valid, message: valid ? undefined : defaultError };
      }

      case 'whole': {
        const num = Number(value);
        if (isNaN(num) || !Number.isInteger(num)) {
          return { valid: false, message: defaultError };
        }
        const valid = this.evaluateOperator(num, rule.operator, Number(rule.formula1), rule.formula2 ? Number(rule.formula2) : undefined);
        return { valid, message: valid ? undefined : defaultError };
      }

      case 'decimal': {
        const num = Number(value);
        if (isNaN(num)) {
          return { valid: false, message: defaultError };
        }
        const valid = this.evaluateOperator(num, rule.operator, Number(rule.formula1), rule.formula2 ? Number(rule.formula2) : undefined);
        return { valid, message: valid ? undefined : defaultError };
      }

      case 'textLength': {
        const len = String(value).length;
        const valid = this.evaluateOperator(len, rule.operator, Number(rule.formula1), rule.formula2 ? Number(rule.formula2) : undefined);
        return { valid, message: valid ? undefined : defaultError };
      }

      case 'date': {
        const dateVal = new Date(String(value)).getTime();
        const f1Date = new Date(rule.formula1).getTime();
        const f2Date = rule.formula2 ? new Date(rule.formula2).getTime() : undefined;
        if (isNaN(dateVal) || isNaN(f1Date)) {
          return { valid: false, message: defaultError };
        }
        const valid = this.evaluateOperator(dateVal, rule.operator, f1Date, f2Date);
        return { valid, message: valid ? undefined : defaultError };
      }

      case 'custom': {
        return { valid: true };
      }

      default:
        return { valid: true };
    }
  }

  private static evaluateOperator(
    val: number,
    op: DataValidationRule['operator'] = 'equal',
    f1: number,
    f2?: number
  ): boolean {
    switch (op) {
      case 'equal':
        return val === f1;
      case 'notEqual':
        return val !== f1;
      case 'greaterThan':
        return val > f1;
      case 'lessThan':
        return val < f1;
      case 'greaterThanOrEqual':
        return val >= f1;
      case 'lessThanOrEqual':
        return val <= f1;
      case 'between':
        return f2 !== undefined ? val >= Math.min(f1, f2) && val <= Math.max(f1, f2) : val >= f1;
      case 'notBetween':
        return f2 !== undefined ? val < Math.min(f1, f2) || val > Math.max(f1, f2) : val < f1;
      default:
        return true;
    }
  }
}
