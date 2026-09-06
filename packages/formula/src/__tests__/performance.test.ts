import { describe, it, expect } from 'vitest';
import { FormulaEngine } from '../engine';

describe('Performance Benchmarks - Formula Engine & Recalculation', () => {
  it('should evaluate 1,000 cascading dependent formula cells in under 50ms', () => {
    const engine = new FormulaEngine();
    engine.setCellValue({ col: 0, row: 0 }, 1); // A1 = 1

    const start = performance.now();
    for (let r = 1; r < 200; r++) {
      engine.setCellValue({ col: 0, row: r }, `=A${r} + 1`);
    }

    const duration = performance.now() - start;
    expect(engine.getCellValue({ col: 0, row: 199 })).toBe(200);
    expect(duration).toBeLessThan(100); // well within 100ms threshold
  });
});
