import { FunctionImplementation, FormulaValue } from '../types';

export const dynamicFunctions: FunctionImplementation[] = [
  {
    name: 'UNIQUE',
    minArgs: 1,
    maxArgs: 1,
    execute: (args) => {
      const matrix = args[0] as FormulaValue[][];
      if (!Array.isArray(matrix)) return args[0] as FormulaValue;

      const seen = new Set<string>();
      const result: FormulaValue[][] = [];

      for (const row of matrix) {
        const key = row.map((v) => String(v)).join('|');
        if (!seen.has(key)) {
          seen.add(key);
          result.push(row);
        }
      }
      return result.length === 1 && result[0].length === 1 ? result[0][0] : result;
    },
  },
  {
    name: 'SEQUENCE',
    minArgs: 1,
    maxArgs: 4,
    execute: (args) => {
      const rows = Number(args[0]) || 1;
      const cols = args.length > 1 ? Number(args[1]) || 1 : 1;
      const start = args.length > 2 ? Number(args[2]) || 1 : 1;
      const step = args.length > 3 ? Number(args[3]) || 1 : 1;

      const result: FormulaValue[][] = [];
      let current = start;
      for (let r = 0; r < rows; r++) {
        const row: FormulaValue[] = [];
        for (let c = 0; c < cols; c++) {
          row.push(current);
          current += step;
        }
        result.push(row);
      }
      return rows === 1 && cols === 1 ? result[0][0] : result;
    },
  },
];
