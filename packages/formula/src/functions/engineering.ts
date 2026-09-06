import { FunctionImplementation, FormulaErrorCode } from '../types';

export const engineeringFunctions: FunctionImplementation[] = [
  {
    name: 'DELTA',
    minArgs: 1,
    maxArgs: 2,
    execute: (args) => {
      const num1 = Number(args[0]);
      const num2 = args.length > 1 ? Number(args[1]) : 0;
      if (isNaN(num1) || isNaN(num2)) return FormulaErrorCode.VALUE;
      return num1 === num2 ? 1 : 0;
    },
  },
  {
    name: 'BIN2DEC',
    minArgs: 1,
    maxArgs: 1,
    execute: (args) => {
      const str = String(args[0]).trim();
      if (!/^[01]+$/.test(str)) return FormulaErrorCode.NUM;
      return parseInt(str, 2);
    },
  },
  {
    name: 'DEC2BIN',
    minArgs: 1,
    maxArgs: 1,
    execute: (args) => {
      const num = Number(args[0]);
      if (isNaN(num) || num < 0 || num > 511) return FormulaErrorCode.NUM;
      return num.toString(2);
    },
  },
  {
    name: 'HEX2DEC',
    minArgs: 1,
    maxArgs: 1,
    execute: (args) => {
      const str = String(args[0]).trim();
      if (!/^[0-9a-fA-F]+$/.test(str)) return FormulaErrorCode.NUM;
      return parseInt(str, 16);
    },
  },
  {
    name: 'CONVERT',
    minArgs: 3,
    maxArgs: 3,
    execute: (args) => {
      const num = Number(args[0]);
      const fromUnit = String(args[1]).toLowerCase();
      const toUnit = String(args[2]).toLowerCase();

      if (isNaN(num)) return FormulaErrorCode.VALUE;

      // Distance conversions
      const distanceMap: Record<string, number> = {
        m: 1,
        km: 1000,
        cm: 0.01,
        mm: 0.001,
        mi: 1609.344,
        ft: 0.3048,
        in: 0.0254,
      };

      if (distanceMap[fromUnit] && distanceMap[toUnit]) {
        const inMeters = num * distanceMap[fromUnit];
        return inMeters / distanceMap[toUnit];
      }

      // Weight conversions
      const weightMap: Record<string, number> = {
        kg: 1,
        g: 0.001,
        mg: 0.000001,
        lbm: 0.45359237,
        ozm: 0.028349523,
      };

      if (weightMap[fromUnit] && weightMap[toUnit]) {
        const inKg = num * weightMap[fromUnit];
        return inKg / weightMap[toUnit];
      }

      return FormulaErrorCode.NA;
    },
  },
];
