import { FunctionImplementation, FormulaValue, FormulaErrorCode } from '../types';

function flattenNumbers(args: (FormulaValue | FormulaValue[][])[]): number[] {
  const result: number[] = [];
  for (const arg of args) {
    if (Array.isArray(arg)) {
      for (const row of arg) {
        for (const val of row) {
          if (typeof val === 'number') result.push(val);
          else if (typeof val === 'string' && val.trim() !== '' && !isNaN(Number(val))) {
            result.push(Number(val));
          }
        }
      }
    } else if (typeof arg === 'number') {
      result.push(arg);
    } else if (typeof arg === 'string' && arg.trim() !== '' && !isNaN(Number(arg))) {
      result.push(Number(arg));
    }
  }
  return result;
}

export const mathFunctions: FunctionImplementation[] = [
  {
    name: 'SUM',
    minArgs: 1,
    maxArgs: 255,
    execute: (args) => {
      const nums = flattenNumbers(args);
      return nums.reduce((acc, curr) => acc + curr, 0);
    },
  },
  {
    name: 'AVERAGE',
    minArgs: 1,
    maxArgs: 255,
    execute: (args) => {
      const nums = flattenNumbers(args);
      if (nums.length === 0) return FormulaErrorCode.DIV_ZERO;
      return nums.reduce((acc, curr) => acc + curr, 0) / nums.length;
    },
  },
  {
    name: 'MIN',
    minArgs: 1,
    maxArgs: 255,
    execute: (args) => {
      const nums = flattenNumbers(args);
      if (nums.length === 0) return 0;
      return Math.min(...nums);
    },
  },
  {
    name: 'MAX',
    minArgs: 1,
    maxArgs: 255,
    execute: (args) => {
      const nums = flattenNumbers(args);
      if (nums.length === 0) return 0;
      return Math.max(...nums);
    },
  },
  {
    name: 'PRODUCT',
    minArgs: 1,
    maxArgs: 255,
    execute: (args) => {
      const nums = flattenNumbers(args);
      if (nums.length === 0) return 0;
      return nums.reduce((acc, curr) => acc * curr, 1);
    },
  },
  {
    name: 'ROUND',
    minArgs: 1,
    maxArgs: 2,
    execute: (args) => {
      const num = Number(args[0]);
      const digits = args.length > 1 ? Number(args[1]) : 0;
      if (isNaN(num) || isNaN(digits)) return FormulaErrorCode.VALUE;
      const factor = Math.pow(10, digits);
      return Math.round(num * factor) / factor;
    },
  },
  {
    name: 'TRUNC',
    minArgs: 1,
    maxArgs: 2,
    execute: (args) => {
      const num = Number(args[0]);
      const digits = args.length > 1 ? Number(args[1]) : 0;
      if (isNaN(num) || isNaN(digits)) return FormulaErrorCode.VALUE;
      const factor = Math.pow(10, digits);
      return Math.trunc(num * factor) / factor;
    },
  },
  {
    name: 'INT',
    minArgs: 1,
    maxArgs: 1,
    execute: (args) => {
      const num = Number(args[0]);
      if (isNaN(num)) return FormulaErrorCode.VALUE;
      return Math.floor(num);
    },
  },
  {
    name: 'EVEN',
    minArgs: 1,
    maxArgs: 1,
    execute: (args) => {
      const num = Number(args[0]);
      if (isNaN(num)) return FormulaErrorCode.VALUE;
      const ceil = Math.ceil(Math.abs(num));
      const res = ceil % 2 === 0 ? ceil : ceil + 1;
      return num < 0 ? -res : res;
    },
  },
  {
    name: 'ODD',
    minArgs: 1,
    maxArgs: 1,
    execute: (args) => {
      const num = Number(args[0]);
      if (isNaN(num)) return FormulaErrorCode.VALUE;
      const ceil = Math.ceil(Math.abs(num));
      const res = ceil % 2 !== 0 ? ceil : ceil + 1;
      return num < 0 ? -res : res;
    },
  },
  {
    name: 'ABS',
    minArgs: 1,
    maxArgs: 1,
    execute: (args) => {
      const num = Number(args[0]);
      return isNaN(num) ? FormulaErrorCode.VALUE : Math.abs(num);
    },
  },
  {
    name: 'SQRT',
    minArgs: 1,
    maxArgs: 1,
    execute: (args) => {
      const num = Number(args[0]);
      if (isNaN(num) || num < 0) return FormulaErrorCode.NUM;
      return Math.sqrt(num);
    },
  },
  {
    name: 'POWER',
    minArgs: 2,
    maxArgs: 2,
    execute: (args) => {
      const base = Number(args[0]);
      const exp = Number(args[1]);
      if (isNaN(base) || isNaN(exp)) return FormulaErrorCode.VALUE;
      return Math.pow(base, exp);
    },
  },
  {
    name: 'MOD',
    minArgs: 2,
    maxArgs: 2,
    execute: (args) => {
      const n = Number(args[0]);
      const d = Number(args[1]);
      if (isNaN(n) || isNaN(d)) return FormulaErrorCode.VALUE;
      if (d === 0) return FormulaErrorCode.DIV_ZERO;
      return ((n % d) + d) % d;
    },
  },
  {
    name: 'FLOOR',
    minArgs: 1,
    maxArgs: 2,
    execute: (args) => {
      const n = Number(args[0]);
      const sig = args.length > 1 ? Number(args[1]) : 1;
      if (isNaN(n) || isNaN(sig)) return FormulaErrorCode.VALUE;
      if (sig === 0) return FormulaErrorCode.DIV_ZERO;
      return Math.floor(n / sig) * sig;
    },
  },
  {
    name: 'CEILING',
    minArgs: 1,
    maxArgs: 2,
    execute: (args) => {
      const n = Number(args[0]);
      const sig = args.length > 1 ? Number(args[1]) : 1;
      if (isNaN(n) || isNaN(sig)) return FormulaErrorCode.VALUE;
      if (sig === 0) return FormulaErrorCode.DIV_ZERO;
      return Math.ceil(n / sig) * sig;
    },
  },
];
