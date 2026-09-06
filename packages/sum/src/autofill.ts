import { shiftFormulaReferences } from './workbook';

export class AutoFillEngine {
  private static readonly MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
  private static readonly SHORT_MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  private static readonly DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
  private static readonly SHORT_DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

  /**
   * Generates auto-filled values based on pattern recognition from source values.
   */
  public static fillSeries(sourceValues: any[], targetCount: number, rowDelta: number = 1, colDelta: number = 0): any[] {
    if (sourceValues.length === 0 || targetCount <= 0) return [];

    // Case 1: Formulas - translate coordinates by row/col delta
    if (sourceValues.every((v) => typeof v === 'string' && v.startsWith('='))) {
      const results: string[] = [];
      for (let i = 0; i < targetCount; i++) {
        const srcFormula = sourceValues[i % sourceValues.length];
        const step = Math.floor(i / sourceValues.length) + 1;
        results.push(shiftFormulaReferences(srcFormula, rowDelta * step, colDelta * step));
      }
      return results;
    }

    // Case 2: Arithmetic numeric progression (e.g. [1, 2] -> 3, 4, 5; or [10, 20] -> 30, 40)
    const numbers = sourceValues.map(Number);
    if (numbers.every((n) => !isNaN(n)) && numbers.length >= 2) {
      const step = (numbers[numbers.length - 1] - numbers[0]) / (numbers.length - 1);
      const results: number[] = [];
      let lastVal = numbers[numbers.length - 1];
      for (let i = 0; i < targetCount; i++) {
        lastVal += step;
        results.push(Math.round(lastVal * 100000) / 100000);
      }
      return results;
    }

    // Case 3: Single number increment [1] -> 2, 3, 4
    if (sourceValues.length === 1 && typeof sourceValues[0] === 'number') {
      const results: number[] = [];
      for (let i = 1; i <= targetCount; i++) {
        results.push(sourceValues[0] + i);
      }
      return results;
    }

    // Case 4: Quarter sequence (e.g. Q1 -> Q2, Q3, Q4, Q1)
    const firstStr = String(sourceValues[0] ?? '').trim();
    const qMatch = firstStr.match(/^Q([1-4])$/i);
    if (qMatch) {
      let qNum = parseInt(qMatch[1], 10);
      const results: string[] = [];
      for (let i = 0; i < targetCount; i++) {
        qNum = (qNum % 4) + 1;
        results.push(`Q${qNum}`);
      }
      return results;
    }

    // Case 5: Month names sequence
    const mIdx = this.MONTHS.findIndex((m) => m.toLowerCase() === firstStr.toLowerCase());
    if (mIdx !== -1) {
      const results: string[] = [];
      for (let i = 1; i <= targetCount; i++) {
        results.push(this.MONTHS[(mIdx + i) % 12]);
      }
      return results;
    }

    const smIdx = this.SHORT_MONTHS.findIndex((m) => m.toLowerCase() === firstStr.toLowerCase());
    if (smIdx !== -1) {
      const results: string[] = [];
      for (let i = 1; i <= targetCount; i++) {
        results.push(this.SHORT_MONTHS[(smIdx + i) % 12]);
      }
      return results;
    }

    // Case 6: Day names sequence
    const dIdx = this.DAYS.findIndex((d) => d.toLowerCase() === firstStr.toLowerCase());
    if (dIdx !== -1) {
      const results: string[] = [];
      for (let i = 1; i <= targetCount; i++) {
        results.push(this.DAYS[(dIdx + i) % 7]);
      }
      return results;
    }

    const sdIdx = this.SHORT_DAYS.findIndex((d) => d.toLowerCase() === firstStr.toLowerCase());
    if (sdIdx !== -1) {
      const results: string[] = [];
      for (let i = 1; i <= targetCount; i++) {
        results.push(this.SHORT_DAYS[(sdIdx + i) % 7]);
      }
      return results;
    }

    // Fallback: Repeat sequence cyclically
    const results: any[] = [];
    for (let i = 0; i < targetCount; i++) {
      results.push(sourceValues[i % sourceValues.length]);
    }
    return results;
  }
}
