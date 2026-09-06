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
  {
    name: 'IPMT',
    minArgs: 4,
    maxArgs: 6,
    execute: (args) => {
      const rate = Number(args[0]);
      const per = Number(args[1]);
      const nper = Number(args[2]);
      const pv = Number(args[3]);
      const fv = args.length > 4 ? Number(args[4]) : 0;
      const type = args.length > 5 ? Number(args[5]) : 0;

      if (isNaN(rate) || isNaN(per) || isNaN(nper) || isNaN(pv) || per < 1 || per > nper) {
        return FormulaErrorCode.VALUE;
      }

      // Calculate total PMT
      const pvif = Math.pow(1 + rate, nper);
      let pmt = (rate / (pvif - 1)) * -(pv * pvif + fv);
      if (type === 1) pmt /= 1 + rate;

      // FV at period - 1
      const p1 = per - 1;
      const fvP1 = -((pv * Math.pow(1 + rate, p1)) + (pmt * (1 + rate * type) * (Math.pow(1 + rate, p1) - 1)) / rate);
      const ipmt = -(fvP1 * rate);
      return Math.round(ipmt * 100) / 100;
    },
  },
  {
    name: 'PPMT',
    minArgs: 4,
    maxArgs: 6,
    execute: (args) => {
      const rate = Number(args[0]);
      const per = Number(args[1]);
      const nper = Number(args[2]);
      const pv = Number(args[3]);
      const fv = args.length > 4 ? Number(args[4]) : 0;
      const type = args.length > 5 ? Number(args[5]) : 0;

      if (isNaN(rate) || isNaN(per) || isNaN(nper) || isNaN(pv) || per < 1 || per > nper) {
        return FormulaErrorCode.VALUE;
      }

      const pvif = Math.pow(1 + rate, nper);
      let pmt = (rate / (pvif - 1)) * -(pv * pvif + fv);
      if (type === 1) pmt /= 1 + rate;

      const p1 = per - 1;
      const fvP1 = -((pv * Math.pow(1 + rate, p1)) + (pmt * (1 + rate * type) * (Math.pow(1 + rate, p1) - 1)) / rate);
      const ipmt = -(fvP1 * rate);
      const ppmt = pmt - ipmt;
      return Math.round(ppmt * 100) / 100;
    },
  },
  {
    name: 'IRR',
    minArgs: 1,
    maxArgs: 2,
    execute: (args) => {
      const values: number[] = [];
      const input = args[0];
      if (Array.isArray(input)) {
        for (const row of input as any[]) {
          if (Array.isArray(row)) {
            for (const cell of row) {
              const n = Number(cell);
              if (!isNaN(n)) values.push(n);
            }
          } else {
            const n = Number(row);
            if (!isNaN(n)) values.push(n);
          }
        }
      } else {
        const n = Number(input);
        if (!isNaN(n)) values.push(n);
      }

      if (values.length < 2) return FormulaErrorCode.VALUE;

      let rate = args.length > 1 ? Number(args[1]) || 0.1 : 0.1;
      for (let iter = 0; iter < 50; iter++) {
        let npv = 0;
        let dNpv = 0;
        for (let i = 0; i < values.length; i++) {
          const val = values[i];
          npv += val / Math.pow(1 + rate, i);
          dNpv -= (i * val) / Math.pow(1 + rate, i + 1);
        }
        if (Math.abs(npv) < 1e-7) break;
        if (dNpv === 0) break;
        const nextRate = rate - npv / dNpv;
        if (Math.abs(nextRate - rate) < 1e-7) {
          rate = nextRate;
          break;
        }
        rate = nextRate;
      }
      return Math.round(rate * 10000) / 10000;
    },
  },
];
