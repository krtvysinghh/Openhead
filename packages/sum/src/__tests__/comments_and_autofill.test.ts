import { describe, it, expect } from 'vitest';
import { CellCommentManager } from '../comments';
import { AutoFillEngine } from '../autofill';
import { FormulaEngine } from '@openhead/formula';

describe('Sum Cell Comments & AutoFill Engine', () => {
  it('should manage cell comments per sheet and cell coordinate', () => {
    const mgr = new CellCommentManager();
    const c1 = mgr.addComment('sheet1', 'B5', 'Auditor', 'Please verify Q4 revenue projection.');

    expect(c1.id).toBeDefined();
    expect(c1.cellKey).toBe('B5');
    expect(c1.resolved).toBe(false);

    const b5Comments = mgr.getComments('sheet1', 'b5');
    expect(b5Comments.length).toBe(1);

    mgr.setResolved('sheet1', c1.id, true);
    expect(mgr.getComments('sheet1', 'B5')[0].resolved).toBe(true);

    const deleted = mgr.deleteComment('sheet1', c1.id);
    expect(deleted).toBe(true);
    expect(mgr.getComments('sheet1', 'B5').length).toBe(0);
  });

  it('should intelligently autofill numeric progressions, quarters, months, and days', () => {
    // Numeric sequence [10, 20] -> 30, 40, 50
    const nums = AutoFillEngine.fillSeries([10, 20], 3);
    expect(nums).toEqual([30, 40, 50]);

    // Single number increment [1] -> 2, 3
    const singleNum = AutoFillEngine.fillSeries([1], 2);
    expect(singleNum).toEqual([2, 3]);

    // Quarters [Q1] -> Q2, Q3, Q4, Q1
    const quarters = AutoFillEngine.fillSeries(['Q1'], 4);
    expect(quarters).toEqual(['Q2', 'Q3', 'Q4', 'Q1']);

    // Months [Jan] -> Feb, Mar, Apr
    const months = AutoFillEngine.fillSeries(['Jan'], 3);
    expect(months).toEqual(['Feb', 'Mar', 'Apr']);

    // Days [Monday] -> Tuesday, Wednesday
    const days = AutoFillEngine.fillSeries(['Monday'], 2);
    expect(days).toEqual(['Tuesday', 'Wednesday']);

    // Formulas reference shifting [=A1+B1] -> =A2+B2, =A3+B3
    const formulas = AutoFillEngine.fillSeries(['=A1+B1'], 2, 1, 0);
    expect(formulas).toEqual(['=A2+B2', '=A3+B3']);
  });

  it('should evaluate STDEV, VAR, MODE, PERCENTILE, and QUARTILE in FormulaEngine', () => {
    const engine = new FormulaEngine();
    const cells = {
      A1: 2,
      A2: 4,
      A3: 4,
      A4: 4,
      A5: 5,
      A6: 5,
      A7: 7,
      A8: 9,
    };

    const stdev = engine.evaluate('=STDEV(A1:A8)', cells);
    expect(Number(stdev)).toBeCloseTo(2.138, 2);

    const variance = engine.evaluate('=VAR(A1:A8)', cells);
    expect(Number(variance)).toBeCloseTo(4.571, 2);

    const mode = engine.evaluate('=MODE.SNGL(A1:A8)', cells);
    expect(mode).toBe(4);

    const p50 = engine.evaluate('=PERCENTILE.INC(A1:A8, 0.5)', cells);
    expect(p50).toBe(4.5);

    const q1 = engine.evaluate('=QUARTILE.INC(A1:A8, 1)', cells);
    expect(q1).toBe(4);
  });
});
