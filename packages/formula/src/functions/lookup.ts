import { FunctionImplementation, FormulaValue, FormulaErrorCode } from '../types';

export const lookupFunctions: FunctionImplementation[] = [
  {
    name: 'VLOOKUP',
    minArgs: 3,
    maxArgs: 4,
    execute: (args) => {
      const lookupVal = args[0];
      const table = args[1] as FormulaValue[][];
      const colIndex = Number(args[2]);

      if (!Array.isArray(table) || table.length === 0 || !Array.isArray(table[0])) {
        return FormulaErrorCode.REF;
      }
      if (isNaN(colIndex) || colIndex < 1 || colIndex > table[0].length) {
        return FormulaErrorCode.REF;
      }

      for (let r = 0; r < table.length; r++) {
        const rowVal = table[r][0];
        if (rowVal === lookupVal || String(rowVal).toLowerCase() === String(lookupVal).toLowerCase()) {
          return table[r][colIndex - 1];
        }
      }
      return FormulaErrorCode.NA;
    },
  },
  {
    name: 'HLOOKUP',
    minArgs: 3,
    maxArgs: 4,
    execute: (args) => {
      const lookupVal = args[0];
      const table = args[1] as FormulaValue[][];
      const rowIndex = Number(args[2]);

      if (!Array.isArray(table) || table.length === 0 || rowIndex < 1 || rowIndex > table.length) {
        return FormulaErrorCode.REF;
      }

      const firstRow = table[0];
      for (let c = 0; c < firstRow.length; c++) {
        const colVal = firstRow[c];
        if (colVal === lookupVal || String(colVal).toLowerCase() === String(lookupVal).toLowerCase()) {
          return table[rowIndex - 1][c];
        }
      }
      return FormulaErrorCode.NA;
    },
  },
  {
    name: 'INDEX',
    minArgs: 2,
    maxArgs: 3,
    execute: (args) => {
      const array = args[0];
      const rowNum = Number(args[1]);
      const colNum = args.length > 2 ? Number(args[2]) : 1;

      if (!Array.isArray(array)) return FormulaErrorCode.REF;

      if (Array.isArray(array[0])) {
        const matrix = array as FormulaValue[][];
        if (rowNum < 1 || rowNum > matrix.length) return FormulaErrorCode.REF;
        if (colNum < 1 || colNum > matrix[0].length) return FormulaErrorCode.REF;
        return matrix[rowNum - 1][colNum - 1];
      } else {
        const list = array as unknown as FormulaValue[];
        if (rowNum < 1 || rowNum > list.length) return FormulaErrorCode.REF;
        return list[rowNum - 1];
      }
    },
  },
  {
    name: 'MATCH',
    minArgs: 2,
    maxArgs: 3,
    execute: (args) => {
      const lookupVal = args[0];
      const lookupArray = args[1];

      const flat: FormulaValue[] = [];
      if (Array.isArray(lookupArray)) {
        if (Array.isArray(lookupArray[0])) {
          for (const row of lookupArray as FormulaValue[][]) {
            for (const item of row) flat.push(item);
          }
        } else {
          for (const item of lookupArray as unknown as FormulaValue[]) flat.push(item);
        }
      }

      for (let i = 0; i < flat.length; i++) {
        if (flat[i] === lookupVal || String(flat[i]).toLowerCase() === String(lookupVal).toLowerCase()) {
          return i + 1; // 1-based index
        }
      }
      return FormulaErrorCode.NA;
    },
  },
  {
    name: 'CHOOSE',
    minArgs: 2,
    maxArgs: 255,
    execute: (args) => {
      const index = Number(args[0]);
      if (isNaN(index) || index < 1 || index >= args.length) return FormulaErrorCode.VALUE;
      return args[index] as FormulaValue;
    },
  },
  {
    name: 'XLOOKUP',
    minArgs: 3,
    maxArgs: 6,
    execute: (args) => {
      const lookupVal = args[0];
      const lookupArray = args[1];
      const returnArray = args[2];
      const ifNotFound = args.length > 3 ? args[3] : FormulaErrorCode.NA;
      const searchMode = args.length > 5 ? Number(args[5]) || 1 : 1;

      const flatLookup: FormulaValue[] = [];
      if (Array.isArray(lookupArray)) {
        if (Array.isArray(lookupArray[0])) {
          for (const row of lookupArray as FormulaValue[][]) {
            for (const item of row) flatLookup.push(item);
          }
        } else {
          for (const item of lookupArray as unknown as FormulaValue[]) flatLookup.push(item);
        }
      } else {
        flatLookup.push(lookupArray as FormulaValue);
      }

      const flatReturn: FormulaValue[] = [];
      if (Array.isArray(returnArray)) {
        if (Array.isArray(returnArray[0])) {
          for (const row of returnArray as FormulaValue[][]) {
            for (const item of row) flatReturn.push(item);
          }
        } else {
          for (const item of returnArray as unknown as FormulaValue[]) flatReturn.push(item);
        }
      } else {
        flatReturn.push(returnArray as FormulaValue);
      }

      const len = flatLookup.length;
      if (searchMode === -1) {
        for (let i = len - 1; i >= 0; i--) {
          if (flatLookup[i] === lookupVal || String(flatLookup[i]).toLowerCase() === String(lookupVal).toLowerCase()) {
            return flatReturn[i] ?? null;
          }
        }
      } else {
        for (let i = 0; i < len; i++) {
          if (flatLookup[i] === lookupVal || String(flatLookup[i]).toLowerCase() === String(lookupVal).toLowerCase()) {
            return flatReturn[i] ?? null;
          }
        }
      }

      return Array.isArray(ifNotFound) ? ifNotFound : (ifNotFound as FormulaValue);
    },
  },
  {
    name: 'XMATCH',
    minArgs: 2,
    maxArgs: 4,
    execute: (args) => {
      const lookupVal = args[0];
      const lookupArray = args[1];
      const searchMode = args.length > 3 ? Number(args[3]) || 1 : 1;

      const flat: FormulaValue[] = [];
      if (Array.isArray(lookupArray)) {
        if (Array.isArray(lookupArray[0])) {
          for (const row of lookupArray as FormulaValue[][]) {
            for (const item of row) flat.push(item);
          }
        } else {
          for (const item of lookupArray as unknown as FormulaValue[]) flat.push(item);
        }
      } else {
        flat.push(lookupArray as FormulaValue);
      }

      const len = flat.length;
      if (searchMode === -1) {
        for (let i = len - 1; i >= 0; i--) {
          if (flat[i] === lookupVal || String(flat[i]).toLowerCase() === String(lookupVal).toLowerCase()) {
            return i + 1;
          }
        }
      } else {
        for (let i = 0; i < len; i++) {
          if (flat[i] === lookupVal || String(flat[i]).toLowerCase() === String(lookupVal).toLowerCase()) {
            return i + 1;
          }
        }
      }
      return FormulaErrorCode.NA;
    },
  },
  {
    name: 'ROWS',
    minArgs: 1,
    maxArgs: 1,
    execute: (args) => {
      const array = args[0];
      if (Array.isArray(array)) {
        return array.length;
      }
      return 1;
    },
  },
  {
    name: 'COLUMNS',
    minArgs: 1,
    maxArgs: 1,
    execute: (args) => {
      const array = args[0];
      if (Array.isArray(array) && Array.isArray(array[0])) {
        return array[0].length;
      }
      return 1;
    },
  },
  {
    name: 'ADDRESS',
    minArgs: 2,
    maxArgs: 5,
    execute: (args) => {
      const row = Number(args[0]);
      const col = Number(args[1]);
      const abs = args.length > 2 ? Number(args[2]) : 1; // 1=$A$1, 2=A$1, 3=$A1, 4=A1
      const sheet = args.length > 4 ? String(args[4]) : undefined;

      if (isNaN(row) || isNaN(col) || row < 1 || col < 1) return FormulaErrorCode.VALUE;

      let colName = '';
      let temp = col;
      while (temp > 0) {
        const rem = (temp - 1) % 26;
        colName = String.fromCharCode(65 + rem) + colName;
        temp = Math.floor((temp - 1) / 26);
      }

      const colPrefix = abs === 1 || abs === 3 ? '$' : '';
      const rowPrefix = abs === 1 || abs === 2 ? '$' : '';
      const sheetPrefix = sheet ? `${sheet}!` : '';

      return `${sheetPrefix}${colPrefix}${colName}${rowPrefix}${row}`;
    },
  },
];
