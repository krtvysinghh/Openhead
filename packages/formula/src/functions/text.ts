import { FunctionImplementation, FormulaErrorCode } from '../types';

export const textFunctions: FunctionImplementation[] = [
  {
    name: 'CONCATENATE',
    minArgs: 1,
    maxArgs: 255,
    execute: (args) => {
      let str = '';
      for (const arg of args) {
        if (Array.isArray(arg)) {
          for (const row of arg) {
            for (const val of row) {
              if (val !== null) str += String(val);
            }
          }
        } else if (arg !== null) {
          str += String(arg);
        }
      }
      return str;
    },
  },
  {
    name: 'CONCAT',
    minArgs: 1,
    maxArgs: 255,
    execute: (args) => {
      let str = '';
      for (const arg of args) {
        if (Array.isArray(arg)) {
          for (const row of arg) {
            for (const val of row) {
              if (val !== null) str += String(val);
            }
          }
        } else if (arg !== null) {
          str += String(arg);
        }
      }
      return str;
    },
  },
  {
    name: 'LEFT',
    minArgs: 1,
    maxArgs: 2,
    execute: (args) => {
      const str = String(args[0] ?? '');
      const count = args.length > 1 ? Number(args[1]) : 1;
      if (isNaN(count) || count < 0) return FormulaErrorCode.VALUE;
      return str.slice(0, count);
    },
  },
  {
    name: 'RIGHT',
    minArgs: 1,
    maxArgs: 2,
    execute: (args) => {
      const str = String(args[0] ?? '');
      const count = args.length > 1 ? Number(args[1]) : 1;
      if (isNaN(count) || count < 0) return FormulaErrorCode.VALUE;
      if (count === 0) return '';
      return str.slice(-count);
    },
  },
  {
    name: 'MID',
    minArgs: 3,
    maxArgs: 3,
    execute: (args) => {
      const str = String(args[0] ?? '');
      const start = Number(args[1]);
      const length = Number(args[2]);
      if (isNaN(start) || isNaN(length) || start < 1 || length < 0) return FormulaErrorCode.VALUE;
      return str.substring(start - 1, start - 1 + length);
    },
  },
  {
    name: 'LEN',
    minArgs: 1,
    maxArgs: 1,
    execute: (args) => {
      const str = String(args[0] ?? '');
      return str.length;
    },
  },
  {
    name: 'UPPER',
    minArgs: 1,
    maxArgs: 1,
    execute: (args) => String(args[0] ?? '').toUpperCase(),
  },
  {
    name: 'LOWER',
    minArgs: 1,
    maxArgs: 1,
    execute: (args) => String(args[0] ?? '').toLowerCase(),
  },
  {
    name: 'TRIM',
    minArgs: 1,
    maxArgs: 1,
    execute: (args) => String(args[0] ?? '').trim().replace(/\s+/g, ' '),
  },
  {
    name: 'TEXTJOIN',
    minArgs: 3,
    maxArgs: 255,
    execute: (args) => {
      const delimiter = String(args[0] ?? '');
      const ignoreEmpty = Boolean(args[1]);
      const items: string[] = [];

      for (let i = 2; i < args.length; i++) {
        const arg = args[i];
        if (Array.isArray(arg)) {
          for (const row of arg) {
            for (const val of row) {
              const s = val === null ? '' : String(val);
              if (!ignoreEmpty || s !== '') items.push(s);
            }
          }
        } else {
          const s = arg === null ? '' : String(arg);
          if (!ignoreEmpty || s !== '') items.push(s);
        }
      }
      return items.join(delimiter);
    },
  },
  {
    name: 'EXACT',
    minArgs: 2,
    maxArgs: 2,
    execute: (args) => String(args[0] ?? '') === String(args[1] ?? ''),
  },
];
