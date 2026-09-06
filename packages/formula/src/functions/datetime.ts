import { FunctionImplementation, FormulaErrorCode } from '../types';

export const datetimeFunctions: FunctionImplementation[] = [
  {
    name: 'TODAY',
    minArgs: 0,
    maxArgs: 0,
    execute: () => {
      const now = new Date();
      return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
    },
  },
  {
    name: 'NOW',
    minArgs: 0,
    maxArgs: 0,
    execute: () => new Date().toISOString(),
  },
  {
    name: 'DATE',
    minArgs: 3,
    maxArgs: 3,
    execute: (args) => {
      const y = Number(args[0]);
      const m = Number(args[1]);
      const d = Number(args[2]);
      if (isNaN(y) || isNaN(m) || isNaN(d)) return FormulaErrorCode.VALUE;
      return `${y}-${String(m).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
    },
  },
  {
    name: 'YEAR',
    minArgs: 1,
    maxArgs: 1,
    execute: (args) => {
      const date = new Date(String(args[0]));
      return isNaN(date.getTime()) ? FormulaErrorCode.VALUE : date.getFullYear();
    },
  },
  {
    name: 'MONTH',
    minArgs: 1,
    maxArgs: 1,
    execute: (args) => {
      const date = new Date(String(args[0]));
      return isNaN(date.getTime()) ? FormulaErrorCode.VALUE : date.getMonth() + 1;
    },
  },
  {
    name: 'DAY',
    minArgs: 1,
    maxArgs: 1,
    execute: (args) => {
      const date = new Date(String(args[0]));
      return isNaN(date.getTime()) ? FormulaErrorCode.VALUE : date.getDate();
    },
  },
];
