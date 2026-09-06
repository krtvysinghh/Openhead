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
  {
    name: 'PROPER',
    minArgs: 1,
    maxArgs: 1,
    execute: (args) => {
      const str = String(args[0] ?? '');
      return str.replace(/\w\S*/g, (txt) => txt.charAt(0).toUpperCase() + txt.substring(1).toLowerCase());
    },
  },
  {
    name: 'SUBSTITUTE',
    minArgs: 3,
    maxArgs: 4,
    execute: (args) => {
      const text = String(args[0] ?? '');
      const oldText = String(args[1] ?? '');
      const newText = String(args[2] ?? '');
      const instance = args.length > 3 ? Number(args[3]) : undefined;

      if (!oldText) return text;
      if (instance === undefined) {
        return text.split(oldText).join(newText);
      }
      if (isNaN(instance) || instance < 1) return FormulaErrorCode.VALUE;

      let count = 0;
      return text.replace(new RegExp(oldText.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g'), (match) => {
        count++;
        return count === instance ? newText : match;
      });
    },
  },
  {
    name: 'REPLACE',
    minArgs: 4,
    maxArgs: 4,
    execute: (args) => {
      const oldText = String(args[0] ?? '');
      const startNum = Number(args[1]);
      const numChars = Number(args[2]);
      const newText = String(args[3] ?? '');

      if (isNaN(startNum) || isNaN(numChars) || startNum < 1 || numChars < 0) return FormulaErrorCode.VALUE;
      const prefix = oldText.substring(0, startNum - 1);
      const suffix = oldText.substring(startNum - 1 + numChars);
      return prefix + newText + suffix;
    },
  },
  {
    name: 'FIND',
    minArgs: 2,
    maxArgs: 3,
    execute: (args) => {
      const findText = String(args[0] ?? '');
      const withinText = String(args[1] ?? '');
      const startNum = args.length > 2 ? Number(args[2]) : 1;

      if (isNaN(startNum) || startNum < 1) return FormulaErrorCode.VALUE;
      const idx = withinText.indexOf(findText, startNum - 1);
      if (idx === -1) return FormulaErrorCode.VALUE;
      return idx + 1;
    },
  },
  {
    name: 'SEARCH',
    minArgs: 2,
    maxArgs: 3,
    execute: (args) => {
      const findText = String(args[0] ?? '').toLowerCase();
      const withinText = String(args[1] ?? '').toLowerCase();
      const startNum = args.length > 2 ? Number(args[2]) : 1;

      if (isNaN(startNum) || startNum < 1) return FormulaErrorCode.VALUE;
      const idx = withinText.indexOf(findText, startNum - 1);
      if (idx === -1) return FormulaErrorCode.VALUE;
      return idx + 1;
    },
  },
  {
    name: 'TEXT',
    minArgs: 2,
    maxArgs: 2,
    execute: (args) => {
      const val = Number(args[0]);
      const fmt = String(args[1] ?? '');
      if (isNaN(val)) return String(args[0] ?? '');
      if (fmt.includes('%')) {
        return `${(val * 100).toFixed(2)}%`;
      }
      if (fmt.includes('$')) {
        return `$${val.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
      }
      if (fmt.includes('.')) {
        const decimals = fmt.split('.')[1]?.length ?? 2;
        return val.toFixed(decimals);
      }
      return String(val);
    },
  },
  {
    name: 'VALUE',
    minArgs: 1,
    maxArgs: 1,
    execute: (args) => {
      const str = String(args[0] ?? '').replace(/[$,]/g, '').trim();
      const num = Number(str);
      return isNaN(num) ? FormulaErrorCode.VALUE : num;
    },
  },
];
