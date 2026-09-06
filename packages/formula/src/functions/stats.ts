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
    name: 'AVERAGEIF',
    minArgs: 2,
    maxArgs: 3,
    execute: (args) => {
      const range = args[0] as FormulaValue[][];
      const criteria = args[1];
      const avgRange = args.length > 2 ? (args[2] as FormulaValue[][]) : range;
      if (!Array.isArray(range) || !Array.isArray(avgRange)) return 0;

      let sum = 0;
      let count = 0;
      for (let r = 0; r < range.length; r++) {
        for (let c = 0; c < range[r].length; c++) {
          if (matchesCriteria(range[r][c], criteria as FormulaValue)) {
            const num = Number(avgRange[r]?.[c]);
            if (!isNaN(num)) {
              sum += num;
              count++;
            }
          }
        }
      }
      return count > 0 ? sum / count : 0;
    },
  },
  {
    name: 'SUMIFS',
    minArgs: 3,
    maxArgs: 255,
    execute: (args) => {
      const sumRange = args[0] as FormulaValue[][];
      if (!Array.isArray(sumRange)) return 0;

      const pairs: { range: FormulaValue[][]; criteria: FormulaValue }[] = [];
      for (let i = 1; i < args.length; i += 2) {
        if (i + 1 < args.length && Array.isArray(args[i])) {
          pairs.push({ range: args[i] as FormulaValue[][], criteria: args[i + 1] as FormulaValue });
        }
      }

      let sum = 0;
      for (let r = 0; r < sumRange.length; r++) {
        for (let c = 0; c < sumRange[r].length; c++) {
          let matchesAll = true;
          for (const pair of pairs) {
            const cellVal = pair.range[r]?.[c] ?? pair.range[r]?.[0] ?? null;
            if (!matchesCriteria(cellVal, pair.criteria)) {
              matchesAll = false;
              break;
            }
          }
          if (matchesAll) {
            const num = Number(sumRange[r][c]);
            if (!isNaN(num)) sum += num;
          }
        }
      }
      return sum;
    },
  },
  {
    name: 'COUNTIFS',
    minArgs: 2,
    maxArgs: 254,
    execute: (args) => {
      const pairs: { range: FormulaValue[][]; criteria: FormulaValue }[] = [];
      for (let i = 0; i < args.length; i += 2) {
        if (i + 1 < args.length && Array.isArray(args[i])) {
          pairs.push({ range: args[i] as FormulaValue[][], criteria: args[i + 1] as FormulaValue });
        }
      }
      if (pairs.length === 0) return 0;

      const firstRange = pairs[0].range;
      let count = 0;
      for (let r = 0; r < firstRange.length; r++) {
        for (let c = 0; c < firstRange[r].length; c++) {
          let matchesAll = true;
          for (const pair of pairs) {
            const cellVal = pair.range[r]?.[c] ?? pair.range[r]?.[0] ?? null;
            if (!matchesCriteria(cellVal, pair.criteria)) {
              matchesAll = false;
              break;
            }
          }
          if (matchesAll) count++;
        }
      }
      return count;
    },
  },
  {
    name: 'AVERAGEIFS',
    minArgs: 3,
    maxArgs: 255,
    execute: (args) => {
      const avgRange = args[0] as FormulaValue[][];
      if (!Array.isArray(avgRange)) return 0;

      const pairs: { range: FormulaValue[][]; criteria: FormulaValue }[] = [];
      for (let i = 1; i < args.length; i += 2) {
        if (i + 1 < args.length && Array.isArray(args[i])) {
          pairs.push({ range: args[i] as FormulaValue[][], criteria: args[i + 1] as FormulaValue });
        }
      }

      let sum = 0;
      let count = 0;
      for (let r = 0; r < avgRange.length; r++) {
        for (let c = 0; c < avgRange[r].length; c++) {
          let matchesAll = true;
          for (const pair of pairs) {
            const cellVal = pair.range[r]?.[c] ?? pair.range[r]?.[0] ?? null;
            if (!matchesCriteria(cellVal, pair.criteria)) {
              matchesAll = false;
              break;
            }
          }
          if (matchesAll) {
            const num = Number(avgRange[r][c]);
            if (!isNaN(num)) {
              sum += num;
              count++;
            }
          }
        }
      }
      return count > 0 ? sum / count : 0;
    },
  },
  {
    name: 'MAXIFS',
    minArgs: 3,
    maxArgs: 255,
    execute: (args) => {
      const maxRange = args[0] as FormulaValue[][];
      if (!Array.isArray(maxRange)) return 0;

      const pairs: { range: FormulaValue[][]; criteria: FormulaValue }[] = [];
      for (let i = 1; i < args.length; i += 2) {
        if (i + 1 < args.length && Array.isArray(args[i])) {
          pairs.push({ range: args[i] as FormulaValue[][], criteria: args[i + 1] as FormulaValue });
        }
      }

      let max = -Infinity;
      for (let r = 0; r < maxRange.length; r++) {
        for (let c = 0; c < maxRange[r].length; c++) {
          let matchesAll = true;
          for (const pair of pairs) {
            const cellVal = pair.range[r]?.[c] ?? pair.range[r]?.[0] ?? null;
            if (!matchesCriteria(cellVal, pair.criteria)) {
              matchesAll = false;
              break;
            }
          }
          if (matchesAll) {
            const num = Number(maxRange[r][c]);
            if (!isNaN(num) && num > max) max = num;
          }
        }
      }
      return max === -Infinity ? 0 : max;
    },
  },
  {
    name: 'MINIFS',
    minArgs: 3,
    maxArgs: 255,
    execute: (args) => {
      const minRange = args[0] as FormulaValue[][];
      if (!Array.isArray(minRange)) return 0;

      const pairs: { range: FormulaValue[][]; criteria: FormulaValue }[] = [];
      for (let i = 1; i < args.length; i += 2) {
        if (i + 1 < args.length && Array.isArray(args[i])) {
          pairs.push({ range: args[i] as FormulaValue[][], criteria: args[i + 1] as FormulaValue });
        }
      }

      let min = Infinity;
      for (let r = 0; r < minRange.length; r++) {
        for (let c = 0; c < minRange[r].length; c++) {
          let matchesAll = true;
          for (const pair of pairs) {
            const cellVal = pair.range[r]?.[c] ?? pair.range[r]?.[0] ?? null;
            if (!matchesCriteria(cellVal, pair.criteria)) {
              matchesAll = false;
              break;
            }
          }
          if (matchesAll) {
            const num = Number(minRange[r][c]);
            if (!isNaN(num) && num < min) min = num;
          }
        }
      }
      return min === Infinity ? 0 : min;
    },
  },
];

function matchesCriteria(val: FormulaValue, criteria: FormulaValue): boolean {
  if (typeof criteria === 'string') {
    const match = criteria.match(/^([><]=?|<>|=)(.*)$/);
    if (match) {
      const op = match[1];
      const target = Number(match[2]);
      const vNum = Number(val);
      if (!isNaN(target) && !isNaN(vNum)) {
        if (op === '>') return vNum > target;
        if (op === '>=') return vNum >= target;
        if (op === '<') return vNum < target;
        if (op === '<=') return vNum <= target;
        if (op === '<>') return vNum !== target;
        if (op === '=') return vNum === target;
      }
    }
  }
  return val === criteria || String(val).toLowerCase() === String(criteria).toLowerCase();
}
