import { defaultFunctionRegistry } from './functions/registry';

export interface AutocompleteSuggestion {
  name: string;
  signature: string;
  description: string;
}

export const functionDocumentation: Record<string, { signature: string; description: string }> = {
  SUM: { signature: 'SUM(number1, [number2], ...)', description: 'Adds all numbers in a range of cells.' },
  AVERAGE: { signature: 'AVERAGE(number1, [number2], ...)', description: 'Returns the average (arithmetic mean) of arguments.' },
  VLOOKUP: { signature: 'VLOOKUP(lookup_value, table_array, col_index, [range_lookup])', description: 'Looks up a value in the leftmost column of a table.' },
  PMT: { signature: 'PMT(rate, nper, pv, [fv], [type])', description: 'Calculates loan payment based on constant payments and interest.' },
  IF: { signature: 'IF(logical_test, value_if_true, [value_if_false])', description: 'Checks whether a condition is met.' },
  INDEX: { signature: 'INDEX(array, row_num, [col_num])', description: 'Returns a value from a table by row/column index.' },
  MATCH: { signature: 'MATCH(lookup_value, lookup_array, [match_type])', description: 'Returns relative position of an item in an array.' },
  MEDIAN: { signature: 'MEDIAN(number1, [number2], ...)', description: 'Returns the median of given numbers.' },
  NPV: { signature: 'NPV(rate, value1, [value2], ...)', description: 'Calculates the net present value of an investment.' },
  CONVERT: { signature: 'CONVERT(number, from_unit, to_unit)', description: 'Converts a number from one measurement system to another.' },
  UNIQUE: { signature: 'UNIQUE(array)', description: 'Returns a list of unique values from a range.' },
};

export class FormulaAutocomplete {
  public static getSuggestions(prefix: string): AutocompleteSuggestion[] {
    const clean = prefix.replace(/^=/, '').toUpperCase();
    if (!clean) return [];

    const all = defaultFunctionRegistry.list();
    const matches = all.filter((fn) => fn.startsWith(clean));

    return matches.map((fn) => {
      const doc = functionDocumentation[fn] || {
        signature: `${fn}(...)`,
        description: `Standard Excel ${fn} formula calculation.`,
      };
      return {
        name: fn,
        signature: doc.signature,
        description: doc.description,
      };
    });
  }
}
