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
  {
    name: 'MEDIAN',
    minArgs: 1,
    maxArgs: 255,
    execute: (args) => {
      const nums: number[] = [];
      for (const arg of args) {
        if (Array.isArray(arg)) {
          for (const row of arg) {
            for (const val of row) {
              if (typeof val === 'number') nums.push(val);
              else if (typeof val === 'string' && val.trim() !== '' && !isNaN(Number(val))) {
                nums.push(Number(val));
              }
            }
          }
        } else if (typeof arg === 'number') {
          nums.push(arg);
        }
      }
      if (nums.length === 0) return 0;
      nums.sort((a, b) => a - b);
      const mid = Math.floor(nums.length / 2);
      return nums.length % 2 !== 0 ? nums[mid] : (nums[mid - 1] + nums[mid]) / 2;
    },
  },
  {
    name: 'SUMPRODUCT',
    minArgs: 1,
    maxArgs: 255,
    execute: (args) => {
      const arrays = args as FormulaValue[][][];
      if (arrays.length === 0 || !Array.isArray(arrays[0])) return 0;
      const rCount = arrays[0].length;
      const cCount = arrays[0][0]?.length || 0;

      let total = 0;
      for (let r = 0; r < rCount; r++) {
        for (let c = 0; c < cCount; c++) {
          let prod = 1;
          for (const arr of arrays) {
            const num = Number(arr[r]?.[c] ?? 0);
            prod *= isNaN(num) ? 0 : num;
          }
          total += prod;
        }
      }
      return total;
    },
  },
];
