import { FunctionImplementation, FormulaErrorCode } from '../types';

export const financialFunctions: FunctionImplementation[] = [
  {
    name: 'PMT',
    minArgs: 3,
    maxArgs: 5,
    execute: (args) => {
      const rate = Number(args[0]);
      const nper = Number(args[1]);
      const pv = Number(args[2]);
      const fv = args.length > 3 ? Number(args[3]) : 0;
      const type = args.length > 4 ? Number(args[4]) : 0;

      if (isNaN(rate) || isNaN(nper) || isNaN(pv) || isNaN(fv) || isNaN(type)) {
        return FormulaErrorCode.VALUE;
      }
      if (rate === 0) return -(pv + fv) / nper;

      const pvif = Math.pow(1 + rate, nper);
      let pmt = (rate / (pvif - 1)) * -(pv * pvif + fv);
      if (type === 1) pmt /= 1 + rate;
      return Math.round(pmt * 100) / 100;
    },
  },
  {
    name: 'FV',
    minArgs: 3,
    maxArgs: 5,
    execute: (args) => {
      const rate = Number(args[0]);
      const nper = Number(args[1]);
      const pmt = Number(args[2]);
      const pv = args.length > 3 ? Number(args[3]) : 0;
      const type = args.length > 4 ? Number(args[4]) : 0;

      if (isNaN(rate) || isNaN(nper) || isNaN(pmt) || isNaN(pv)) return FormulaErrorCode.VALUE;
      if (rate === 0) return -(pv + pmt * nper);

      const pvif = Math.pow(1 + rate, nper);
      let fv = -((pv * pvif) + (pmt * (1 + rate * type) * (pvif - 1)) / rate);
      return Math.round(fv * 100) / 100;
    },
  },
  {
    name: 'PV',
    minArgs: 3,
    maxArgs: 5,
    execute: (args) => {
      const rate = Number(args[0]);
      const nper = Number(args[1]);
      const pmt = Number(args[2]);
      const fv = args.length > 3 ? Number(args[3]) : 0;
      const type = args.length > 4 ? Number(args[4]) : 0;

      if (isNaN(rate) || isNaN(nper) || isNaN(pmt)) return FormulaErrorCode.VALUE;
      if (rate === 0) return -(fv + pmt * nper);

      const pvif = Math.pow(1 + rate, nper);
      let pv = -((fv + pmt * (1 + rate * type) * ((pvif - 1) / rate)) / pvif);
      return Math.round(pv * 100) / 100;
    },
  },
  {
    name: 'NPV',
    minArgs: 2,
    maxArgs: 255,
    execute: (args) => {
      const rate = Number(args[0]);
      if (isNaN(rate) || rate === -1) return FormulaErrorCode.VALUE;

      let total = 0;
      let period = 1;

      for (let i = 1; i < args.length; i++) {
        const val = args[i];
        if (Array.isArray(val)) {
          for (const row of val) {
            for (const item of row) {
              const num = Number(item);
              if (!isNaN(num)) {
                total += num / Math.pow(1 + rate, period++);
              }
            }
          }
        } else {
          const num = Number(val);
          if (!isNaN(num)) {
            total += num / Math.pow(1 + rate, period++);
          }
        }
      }
      return Math.round(total * 100) / 100;
    },
  },
];
