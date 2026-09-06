import { FunctionImplementation, FormulaValue } from '../types';

export const statsFunctions: FunctionImplementation[] = [
  {
    name: 'COUNT',
    minArgs: 1,
    maxArgs: 255,
    execute: (args) => {
      let count = 0;
      for (const arg of args) {
        if (Array.isArray(arg)) {
          for (const row of arg) {
            for (const val of row) {
              if (typeof val === 'number' && !isNaN(val)) count++;
            }
          }
        } else if (typeof arg === 'number' && !isNaN(arg)) {
          count++;
        }
      }
      return count;
    },
  },
  {
    name: 'COUNTA',
    minArgs: 1,
    maxArgs: 255,
    execute: (args) => {
      let count = 0;
      for (const arg of args) {
        if (Array.isArray(arg)) {
          for (const row of arg) {
            for (const val of row) {
              if (val !== null && val !== '') count++;
            }
          }
        } else if (arg !== null && arg !== '') {
          count++;
        }
      }
      return count;
    },
  },
  {
    name: 'COUNTIF',
    minArgs: 2,
    maxArgs: 2,
    execute: (args) => {
      const range = args[0] as FormulaValue[][];
      const criteria = args[1];
      if (!Array.isArray(range)) return 0;

      let count = 0;
      for (const row of range) {
        for (const val of row) {
          if (val === criteria || String(val) === String(criteria)) {
            count++;
          }
        }
      }
      return count;
    },
  },
  {
    name: 'SUMIF',
    minArgs: 2,
    maxArgs: 3,
    execute: (args) => {
      const range = args[0] as FormulaValue[][];
      const criteria = args[1];
      const sumRange = args.length > 2 ? (args[2] as FormulaValue[][]) : range;
      if (!Array.isArray(range) || !Array.isArray(sumRange)) return 0;

      let sum = 0;
      for (let r = 0; r < range.length; r++) {
        for (let c = 0; c < range[r].length; c++) {
          const checkVal = range[r][c];
          if (checkVal === criteria || String(checkVal) === String(criteria)) {
            const num = Number(sumRange[r]?.[c]);
            if (!isNaN(num)) sum += num;
          }
        }
      }
      return sum;
    },
  },
];
