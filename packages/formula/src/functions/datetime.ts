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
  {
    name: 'EOMONTH',
    minArgs: 2,
    maxArgs: 2,
    execute: (args) => {
      const date = new Date(String(args[0]));
      const months = Number(args[1]);
      if (isNaN(date.getTime()) || isNaN(months)) return FormulaErrorCode.VALUE;
      const target = new Date(date.getFullYear(), date.getMonth() + months + 1, 0);
      return `${target.getFullYear()}-${String(target.getMonth() + 1).padStart(2, '0')}-${String(target.getDate()).padStart(2, '0')}`;
    },
  },
  {
    name: 'WORKDAY',
    minArgs: 2,
    maxArgs: 2,
    execute: (args) => {
      const date = new Date(String(args[0]));
      const days = Number(args[1]);
      if (isNaN(date.getTime()) || isNaN(days)) return FormulaErrorCode.VALUE;
      const cur = new Date(date);
      let added = 0;
      const step = days >= 0 ? 1 : -1;
      const targetDays = Math.abs(days);

      while (added < targetDays) {
        cur.setDate(cur.getDate() + step);
        const dayOfWeek = cur.getDay();
        if (dayOfWeek !== 0 && dayOfWeek !== 6) {
          added++;
        }
      }
      return `${cur.getFullYear()}-${String(cur.getMonth() + 1).padStart(2, '0')}-${String(cur.getDate()).padStart(2, '0')}`;
    },
  },
  {
    name: 'NETWORKDAYS',
    minArgs: 2,
    maxArgs: 2,
    execute: (args) => {
      const start = new Date(String(args[0]));
      const end = new Date(String(args[1]));
      if (isNaN(start.getTime()) || isNaN(end.getTime())) return FormulaErrorCode.VALUE;

      let count = 0;
      const cur = new Date(start);
      const isForward = end >= start;
      const step = isForward ? 1 : -1;

      while (isForward ? cur <= end : cur >= end) {
        const dayOfWeek = cur.getDay();
        if (dayOfWeek !== 0 && dayOfWeek !== 6) {
          count++;
        }
        cur.setDate(cur.getDate() + step);
      }
      return isForward ? count : -count;
    },
  },
];
