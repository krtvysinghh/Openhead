import { FormulaValue } from '@openhead/formula';

export interface ConditionalFormattingRule {
  id: string;
  condition: 'greaterThan' | 'lessThan' | 'equals' | 'between';
  value1: number | string;
  value2?: number | string;
  style: {
    background?: string;
    color?: string;
    bold?: boolean;
  };
}

export class ConditionalFormattingEvaluator {
  public static evaluate(val: FormulaValue, rule: ConditionalFormattingRule): boolean {
    if (val === null || val === undefined) return false;

    const num = Number(val);
    const isNum = !isNaN(num);

    const v1 = rule.value1;
    const n1 = Number(v1);

    switch (rule.condition) {
      case 'greaterThan':
        return isNum && !isNaN(n1) ? num > n1 : false;

      case 'lessThan':
        return isNum && !isNaN(n1) ? num < n1 : false;

      case 'equals':
        return val === v1 || String(val).toLowerCase() === String(v1).toLowerCase();

      case 'between': {
        const n2 = Number(rule.value2);
        return isNum && !isNaN(n1) && !isNaN(n2) ? num >= n1 && num <= n2 : false;
      }

      default:
        return false;
    }
  }
}
