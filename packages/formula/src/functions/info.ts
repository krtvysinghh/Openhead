import { FunctionImplementation, FormulaErrorCode } from '../types';

export const infoFunctions: FunctionImplementation[] = [
  {
    name: 'ISBLANK',
    minArgs: 1,
    maxArgs: 1,
    execute: (args) => {
      const val = args[0];
      return val === null || val === undefined || val === '';
    },
  },
  {
    name: 'ISNUMBER',
    minArgs: 1,
    maxArgs: 1,
    execute: (args) => {
      const val = args[0];
      return typeof val === 'number' && !isNaN(val);
    },
  },
  {
    name: 'ISTEXT',
    minArgs: 1,
    maxArgs: 1,
    execute: (args) => {
      const val = args[0];
      return typeof val === 'string' && !val.startsWith('#');
    },
  },
  {
    name: 'ISNONTEXT',
    minArgs: 1,
    maxArgs: 1,
    execute: (args) => {
      const val = args[0];
      return typeof val !== 'string' || val.startsWith('#');
    },
  },
  {
    name: 'ISLOGICAL',
    minArgs: 1,
    maxArgs: 1,
    execute: (args) => {
      const val = args[0];
      return typeof val === 'boolean';
    },
  },
  {
    name: 'ISERROR',
    minArgs: 1,
    maxArgs: 1,
    execute: (args) => {
      const val = args[0];
      return typeof val === 'string' && val.startsWith('#');
    },
  },
  {
    name: 'ISERR',
    minArgs: 1,
    maxArgs: 1,
    execute: (args) => {
      const val = args[0];
      return typeof val === 'string' && val.startsWith('#') && val !== FormulaErrorCode.NA;
    },
  },
  {
    name: 'ISNA',
    minArgs: 1,
    maxArgs: 1,
    execute: (args) => {
      const val = args[0];
      return val === FormulaErrorCode.NA;
    },
  },
  {
    name: 'TYPE',
    minArgs: 1,
    maxArgs: 1,
    execute: (args) => {
      const val = args[0];
      if (Array.isArray(val)) return 64; // Array
      if (typeof val === 'number') return 1; // Number
      if (typeof val === 'string') {
        if (val.startsWith('#')) return 16; // Error
        return 2; // Text
      }
      if (typeof val === 'boolean') return 4; // Logical
      return 1;
    },
  },
  {
    name: 'N',
    minArgs: 1,
    maxArgs: 1,
    execute: (args) => {
      const val = args[0];
      if (typeof val === 'number') return val;
      if (typeof val === 'boolean') return val ? 1 : 0;
      return 0;
    },
  },
  {
    name: 'NA',
    minArgs: 0,
    maxArgs: 0,
    execute: () => FormulaErrorCode.NA,
  },
];
