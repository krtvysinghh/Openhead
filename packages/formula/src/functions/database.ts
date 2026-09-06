import { FunctionImplementation, FormulaValue, FormulaErrorCode } from '../types';

export const databaseFunctions: FunctionImplementation[] = [
  {
    name: 'DSUM',
    minArgs: 3,
    maxArgs: 3,
    execute: (args) => {
      const database = args[0] as FormulaValue[][];
      const field = args[1];
      const criteria = args[2] as FormulaValue[][];

      if (!Array.isArray(database) || database.length < 2 || !Array.isArray(criteria) || criteria.length < 2) {
        return FormulaErrorCode.VALUE;
      }

      const headers = database[0];
      let fieldIdx = -1;
      if (typeof field === 'number') {
        fieldIdx = field - 1;
      } else {
        fieldIdx = headers.findIndex((h) => String(h).toLowerCase() === String(field).toLowerCase());
      }

      if (fieldIdx === -1 || fieldIdx >= headers.length) return FormulaErrorCode.VALUE;

      const critHeader = criteria[0][0];
      const critVal = criteria[1][0];
      const critColIdx = headers.findIndex((h) => String(h).toLowerCase() === String(critHeader).toLowerCase());
      if (critColIdx === -1) return FormulaErrorCode.VALUE;

      let sum = 0;
      for (let r = 1; r < database.length; r++) {
        if (database[r][critColIdx] === critVal || String(database[r][critColIdx]) === String(critVal)) {
          const num = Number(database[r][fieldIdx]);
          if (!isNaN(num)) sum += num;
        }
      }
      return sum;
    },
  },
  {
    name: 'DAVERAGE',
    minArgs: 3,
    maxArgs: 3,
    execute: (args) => {
      const database = args[0] as FormulaValue[][];
      const field = args[1];
      const criteria = args[2] as FormulaValue[][];

      if (!Array.isArray(database) || database.length < 2 || !Array.isArray(criteria) || criteria.length < 2) {
        return FormulaErrorCode.VALUE;
      }

      const headers = database[0];
      let fieldIdx = -1;
      if (typeof field === 'number') {
        fieldIdx = field - 1;
      } else {
        fieldIdx = headers.findIndex((h) => String(h).toLowerCase() === String(field).toLowerCase());
      }

      if (fieldIdx === -1) return FormulaErrorCode.VALUE;

      const critHeader = criteria[0][0];
      const critVal = criteria[1][0];
      const critColIdx = headers.findIndex((h) => String(h).toLowerCase() === String(critHeader).toLowerCase());
      if (critColIdx === -1) return FormulaErrorCode.VALUE;

      let sum = 0;
      let count = 0;
      for (let r = 1; r < database.length; r++) {
        if (database[r][critColIdx] === critVal || String(database[r][critColIdx]) === String(critVal)) {
          const num = Number(database[r][fieldIdx]);
          if (!isNaN(num)) {
            sum += num;
            count++;
          }
        }
      }
      return count === 0 ? FormulaErrorCode.DIV_ZERO : sum / count;
    },
  },
];
