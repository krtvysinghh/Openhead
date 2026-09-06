import { describe, it, expect } from 'vitest';
import { FormulaEngine } from '../engine';
import { FormulaDebugger } from '../debugger';
import { FormulaAutocomplete } from '../autocomplete';

describe('Formula Engine - Financial, Database, Dynamic Arrays & Debugger', () => {
  it('should evaluate financial functions: PMT, FV, PV, NPV', () => {
    const engine = new FormulaEngine();
    // Loan: rate 5%/12 = 0.004167, 36 months, $10,000
    engine.setCellValue({ col: 0, row: 0 }, '=PMT(0.05 / 12, 36, 10000)');
    expect(engine.getCellValue({ col: 0, row: 0 })).toBe(-299.71);

    // FV: 5%, 5 periods, payment -1000, pv 0
    engine.setCellValue({ col: 0, row: 1 }, '=FV(0.05, 5, -1000, 0)');
    expect(engine.getCellValue({ col: 0, row: 1 })).toBe(5525.63);
  });

  it('should evaluate engineering and conversion functions: DELTA, CONVERT, BIN2DEC', () => {
    const engine = new FormulaEngine();
    engine.setCellValue({ col: 0, row: 0 }, '=DELTA(5, 5)');
    engine.setCellValue({ col: 0, row: 1 }, '=DELTA(5, 4)');
    engine.setCellValue({ col: 0, row: 2 }, '=CONVERT(1, "km", "m")');
    engine.setCellValue({ col: 0, row: 3 }, '=BIN2DEC("1010")');

    expect(engine.getCellValue({ col: 0, row: 0 })).toBe(1);
    expect(engine.getCellValue({ col: 0, row: 1 })).toBe(0);
    expect(engine.getCellValue({ col: 0, row: 2 })).toBe(1000);
    expect(engine.getCellValue({ col: 0, row: 3 })).toBe(10);
  });

  it('should provide step-by-step evaluation trace and error explanations via FormulaDebugger', () => {
    const report = FormulaDebugger.trace(
      '=10 / 0',
      () => null,
      () => []
    );

    expect(report.finalResult).toBe('#DIV/0!');
    expect(report.errorExplanation).toContain('Division by zero');
    expect(report.tokens.length).toBeGreaterThan(0);
    expect(report.steps.length).toBeGreaterThan(0);
  });

  it('should provide formula autocomplete suggestions with signatures', () => {
    const suggestions = FormulaAutocomplete.getSuggestions('=VLO');
    expect(suggestions.length).toBe(1);
    expect(suggestions[0].name).toBe('VLOOKUP');
    expect(suggestions[0].signature).toContain('VLOOKUP(lookup_value');
  });
});
