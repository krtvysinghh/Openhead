import { FunctionImplementation, FormulaValue, FormulaErrorCode } from '../types';

export const logicalFunctions: FunctionImplementation[] = [
  {
    name: 'IF',
    minArgs: 2,
    maxArgs: 3,
    execute: (args) => {
      const condition = args[0];
      const isTrue = condition === true || (typeof condition === 'number' && condition !== 0);
      if (isTrue) {
        return args[1] as FormulaValue;
      }
      return args.length > 2 ? (args[2] as FormulaValue) : false;
    },
  },
  {
    name: 'AND',
    minArgs: 1,
    maxArgs: 255,
    execute: (args) => {
      for (const arg of args) {
        if (Array.isArray(arg)) {
          for (const row of arg) {
            for (const val of row) {
              if (val === false || val === 0) return false;
            }
          }
        } else if (arg === false || arg === 0) {
          return false;
        }
      }
      return true;
    },
  },
  {
    name: 'OR',
    minArgs: 1,
    maxArgs: 255,
    execute: (args) => {
      for (const arg of args) {
        if (Array.isArray(arg)) {
          for (const row of arg) {
            for (const val of row) {
              if (val === true || (typeof val === 'number' && val !== 0)) return true;
            }
          }
        } else if (arg === true || (typeof arg === 'number' && arg !== 0)) {
          return true;
        }
      }
      return false;
    },
  },
  {
    name: 'NOT',
    minArgs: 1,
    maxArgs: 1,
    execute: (args) => {
      const val = args[0];
      return !(val === true || (typeof val === 'number' && val !== 0));
    },
  },
  {
    name: 'ISNUMBER',
    minArgs: 1,
    maxArgs: 1,
    execute: (args) => typeof args[0] === 'number' && !isNaN(args[0]),
  },
  {
    name: 'ISTEXT',
    minArgs: 1,
    maxArgs: 1,
    execute: (args) => typeof args[0] === 'string' && !args[0].startsWith('#'),
  },
  {
    name: 'ISBLANK',
    minArgs: 1,
    maxArgs: 1,
    execute: (args) => args[0] === null || args[0] === undefined || args[0] === '',
  },
  {
    name: 'IFS',
    minArgs: 2,
    maxArgs: 254,
    execute: (args) => {
      for (let i = 0; i < args.length; i += 2) {
        const cond = args[i];
        const isTrue = cond === true || (typeof cond === 'number' && cond !== 0);
        if (isTrue) {
          return (args[i + 1] as FormulaValue) ?? null;
        }
      }
      return FormulaErrorCode.NA;
    },
  },
  {
    name: 'SWITCH',
    minArgs: 3,
    maxArgs: 255,
    execute: (args) => {
      const target = args[0];
      let i = 1;
      while (i < args.length - 1) {
        const testVal = args[i];
        if (testVal === target) {
          return (args[i + 1] as FormulaValue) ?? null;
        }
        i += 2;
      }
      if (i === args.length - 1) {
        return (args[i] as FormulaValue) ?? null;
      }
      return FormulaErrorCode.NA;
    },
  },
  {
    name: 'IFERROR',
    minArgs: 2,
    maxArgs: 2,
    execute: (args) => {
      const val = args[0] as FormulaValue;
      if (typeof val === 'string' && val.startsWith('#') && val.endsWith('!')) {
        return args[1] as FormulaValue;
      }
      return val;
    },
  },
];
