import { FunctionImplementation, FormulaValue, FormulaErrorCode } from '../types';

export const dynamicFunctions: FunctionImplementation[] = [
  {
    name: 'UNIQUE',
    minArgs: 1,
    maxArgs: 3,
    execute: (args) => {
      const matrix = args[0] as FormulaValue[][];
      if (!Array.isArray(matrix)) return args[0] as FormulaValue;

      const byCol = args.length > 1 ? Boolean(args[1]) : false;
      const exactlyOnce = args.length > 2 ? Boolean(args[2]) : false;

      if (!byCol) {
        // By row
        const counts = new Map<string, { row: FormulaValue[]; count: number }>();
        for (const row of matrix) {
          const key = row.map((v) => String(v)).join('|||');
          const existing = counts.get(key);
          if (existing) {
            existing.count++;
          } else {
            counts.set(key, { row, count: 1 });
          }
        }

        const result: FormulaValue[][] = [];
        for (const entry of counts.values()) {
          if (!exactlyOnce || entry.count === 1) {
            result.push(entry.row);
          }
        }
        if (result.length === 0) return FormulaErrorCode.NA;
        return result.length === 1 && result[0].length === 1 ? result[0][0] : result;
      } else {
        // By column
        if (matrix.length === 0 || !Array.isArray(matrix[0])) return matrix;
        const colCount = matrix[0].length;
        const counts = new Map<string, { colIndex: number; count: number }>();
        for (let c = 0; c < colCount; c++) {
          const colVals = matrix.map((row) => row[c]);
          const key = colVals.map((v) => String(v)).join('|||');
          const existing = counts.get(key);
          if (existing) {
            existing.count++;
          } else {
            counts.set(key, { colIndex: c, count: 1 });
          }
        }

        const validCols: number[] = [];
        for (const entry of counts.values()) {
          if (!exactlyOnce || entry.count === 1) {
            validCols.push(entry.colIndex);
          }
        }
        if (validCols.length === 0) return FormulaErrorCode.NA;

        const result: FormulaValue[][] = matrix.map((row) => validCols.map((c) => row[c]));
        return result.length === 1 && result[0].length === 1 ? result[0][0] : result;
      }
    },
  },
  {
    name: 'SEQUENCE',
    minArgs: 1,
    maxArgs: 4,
    execute: (args) => {
      const rows = Math.max(1, Math.floor(Number(args[0]) || 1));
      const cols = args.length > 1 ? Math.max(1, Math.floor(Number(args[1]) || 1)) : 1;
      const start = args.length > 2 ? Number(args[2]) || 1 : 1;
      const step = args.length > 3 ? Number(args[3]) ?? 1 : 1;

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
  {
    name: 'TRANSPOSE',
    minArgs: 1,
    maxArgs: 1,
    execute: (args) => {
      const matrix = args[0];
      if (!Array.isArray(matrix)) return matrix as FormulaValue;
      if (matrix.length === 0) return [];

      if (!Array.isArray(matrix[0])) {
        // 1D array -> 1 column 2D matrix
        return (matrix as unknown as FormulaValue[]).map((v) => [v]);
      }

      const m = matrix as FormulaValue[][];
      const rowCount = m.length;
      const colCount = m[0].length;
      const result: FormulaValue[][] = [];

      for (let c = 0; c < colCount; c++) {
        const newRow: FormulaValue[] = [];
        for (let r = 0; r < rowCount; r++) {
          newRow.push(m[r][c]);
        }
        result.push(newRow);
      }
      return result.length === 1 && result[0].length === 1 ? result[0][0] : result;
    },
  },
  {
    name: 'FILTER',
    minArgs: 2,
    maxArgs: 3,
    execute: (args) => {
      const array = args[0] as FormulaValue[][];
      const include = args[1];
      const ifEmpty = args.length > 2 ? args[2] : FormulaErrorCode.NA;

      if (!Array.isArray(array)) return FormulaErrorCode.VALUE;

      const isInclude2D = Array.isArray(include) && Array.isArray(include[0]);
      const includeFlags: boolean[] = [];

      if (isInclude2D) {
        for (const row of include as FormulaValue[][]) {
          includeFlags.push(Boolean(row[0]));
        }
      } else if (Array.isArray(include)) {
        for (const val of include as unknown as FormulaValue[]) {
          includeFlags.push(Boolean(val));
        }
      } else {
        return FormulaErrorCode.VALUE;
      }

      const result: FormulaValue[][] = [];
      for (let r = 0; r < array.length; r++) {
        if (includeFlags[r]) {
          result.push(Array.isArray(array[r]) ? array[r] : [array[r] as unknown as FormulaValue]);
        }
      }

      if (result.length === 0) {
        return Array.isArray(ifEmpty) ? ifEmpty : (ifEmpty as FormulaValue);
      }
      return result.length === 1 && result[0].length === 1 ? result[0][0] : result;
    },
  },
  {
    name: 'SORT',
    minArgs: 1,
    maxArgs: 4,
    execute: (args) => {
      const array = args[0] as FormulaValue[][];
      if (!Array.isArray(array) || array.length === 0) return args[0] as FormulaValue;

      const sortIndex = args.length > 1 ? Number(args[1]) || 1 : 1;
      const sortOrder = args.length > 2 ? (Number(args[2]) === -1 ? -1 : 1) : 1;
      const byCol = args.length > 3 ? Boolean(args[3]) : false;

      if (!byCol) {
        const rows = [...array];
        const colIdx = sortIndex - 1;
        rows.sort((a, b) => {
          const valA = Array.isArray(a) ? a[colIdx] : a;
          const valB = Array.isArray(b) ? b[colIdx] : b;
          if (valA === valB) return 0;
          if (valA === null || valA === undefined) return 1;
          if (valB === null || valB === undefined) return -1;
          if (typeof valA === 'number' && typeof valB === 'number') {
            return sortOrder === 1 ? valA - valB : valB - valA;
          }
          return sortOrder === 1
            ? String(valA).localeCompare(String(valB))
            : String(valB).localeCompare(String(valA));
        });
        return rows.length === 1 && rows[0].length === 1 ? rows[0][0] : rows;
      } else {
        // Sort columns
        const colCount = array[0].length;
        const colIndices = Array.from({ length: colCount }, (_, i) => i);
        const rowIdx = sortIndex - 1;

        colIndices.sort((c1, c2) => {
          const valA = array[rowIdx][c1];
          const valB = array[rowIdx][c2];
          if (valA === valB) return 0;
          if (valA === null || valA === undefined) return 1;
          if (valB === null || valB === undefined) return -1;
          if (typeof valA === 'number' && typeof valB === 'number') {
            return sortOrder === 1 ? valA - valB : valB - valA;
          }
          return sortOrder === 1
            ? String(valA).localeCompare(String(valB))
            : String(valB).localeCompare(String(valA));
        });

        const result: FormulaValue[][] = array.map((row) => colIndices.map((c) => row[c]));
        return result.length === 1 && result[0].length === 1 ? result[0][0] : result;
      }
    },
  },
  {
    name: 'SORTBY',
    minArgs: 2,
    maxArgs: 4,
    execute: (args) => {
      const array = args[0] as FormulaValue[][];
      const byArray = args[1] as FormulaValue[][];
      const sortOrder = args.length > 2 ? (Number(args[2]) === -1 ? -1 : 1) : 1;

      if (!Array.isArray(array) || !Array.isArray(byArray)) return FormulaErrorCode.VALUE;
      if (array.length !== byArray.length) return FormulaErrorCode.VALUE;

      const indices = Array.from({ length: array.length }, (_, i) => i);
      indices.sort((i1, i2) => {
        const valA = Array.isArray(byArray[i1]) ? byArray[i1][0] : byArray[i1];
        const valB = Array.isArray(byArray[i2]) ? byArray[i2][0] : byArray[i2];
        if (valA === valB) return 0;
        if (valA === null || valA === undefined) return 1;
        if (valB === null || valB === undefined) return -1;
        if (typeof valA === 'number' && typeof valB === 'number') {
          return sortOrder === 1 ? valA - valB : valB - valA;
        }
        return sortOrder === 1
          ? String(valA).localeCompare(String(valB))
          : String(valB).localeCompare(String(valA));
      });

      const result = indices.map((i) => array[i]);
      return result.length === 1 && result[0].length === 1 ? result[0][0] : result;
    },
  },
];
