import {
  ASTNode,
  FormulaValue,
  FormulaErrorCode,
  EvaluationContext,
} from './types';
import { defaultFunctionRegistry, FunctionRegistry } from './functions/registry';

export class Evaluator {
  private context: EvaluationContext;
  private registry: FunctionRegistry;

  constructor(context: EvaluationContext, registry: FunctionRegistry = defaultFunctionRegistry) {
    this.context = context;
    this.registry = registry;
  }

  public evaluate(node: ASTNode): FormulaValue | FormulaValue[][] {
    switch (node.type) {
      case 'NumberLiteral':
        return node.value;

      case 'StringLiteral':
        return node.value;

      case 'BooleanLiteral':
        return node.value;

      case 'CellReference':
        return this.context.getCellValue(node.address);

      case 'RangeReference':
        return this.context.getRangeValues(node.range);

      case 'UnaryExpression': {
        const val = this.evaluate(node.argument);
        if (typeof val === 'string' && val.startsWith('#')) return val;
        const num = Number(val);
        if (isNaN(num)) return FormulaErrorCode.VALUE;
        return node.operator === '-' ? -num : num;
      }

      case 'BinaryExpression': {
        const leftVal = this.evaluate(node.left);
        const rightVal = this.evaluate(node.right);

        // String concatenation
        if (node.operator === '&') {
          const lStr = leftVal === null ? '' : String(leftVal);
          const rStr = rightVal === null ? '' : String(rightVal);
          return lStr + rStr;
        }

        // Handle array broadcasting for comparisons (e.g. B1:B4 >= 80)
        if (['=', '<>', '<', '<=', '>', '>='].includes(node.operator)) {
          if (Array.isArray(leftVal) && Array.isArray(leftVal[0])) {
            const matrix = leftVal as FormulaValue[][];
            return matrix.map((row) =>
              row.map((cell) => this.evaluateComparison(node.operator, cell, rightVal as FormulaValue))
            );
          }
          if (Array.isArray(leftVal)) {
            const list = leftVal as unknown as FormulaValue[];
            return list.map((cell) => [this.evaluateComparison(node.operator, cell, rightVal as FormulaValue)]);
          }
          return this.evaluateComparison(node.operator, leftVal as FormulaValue, rightVal as FormulaValue);
        }

        // Arithmetic
        const lNum = Number(leftVal);
        const rNum = Number(rightVal);
        if (isNaN(lNum) || isNaN(rNum)) return FormulaErrorCode.VALUE;

        switch (node.operator) {
          case '+':
            return lNum + rNum;
          case '-':
            return lNum - rNum;
          case '*':
            return lNum * rNum;
          case '/':
            if (rNum === 0) return FormulaErrorCode.DIV_ZERO;
            return lNum / rNum;
          case '^':
            return Math.pow(lNum, rNum);
          default:
            return FormulaErrorCode.ERROR;
        }
      }

      case 'FunctionCall': {
        const fnName = node.name.toUpperCase();
        const fn = this.registry.get(fnName);
        if (!fn) return FormulaErrorCode.NAME;

        if (node.args.length < fn.minArgs || node.args.length > fn.maxArgs) {
          return FormulaErrorCode.VALUE;
        }

        const evaluatedArgs: (FormulaValue | FormulaValue[][])[] = [];
        for (const argNode of node.args) {
          evaluatedArgs.push(this.evaluate(argNode));
        }

        try {
          return fn.execute(evaluatedArgs, this.context);
        } catch (err) {
          return FormulaErrorCode.VALUE;
        }
      }

      default:
        return FormulaErrorCode.ERROR;
    }
  }

  private evaluateComparison(op: string, left: FormulaValue, right: FormulaValue): boolean {
    const l = left ?? '';
    const r = right ?? '';

    switch (op) {
      case '=':
        return l === r;
      case '<>':
        return l !== r;
      case '<':
        return l < r;
      case '<=':
        return l <= r;
      case '>':
        return l > r;
      case '>=':
        return l >= r;
      default:
        return false;
    }
  }
}
