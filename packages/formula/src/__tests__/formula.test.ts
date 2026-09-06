import { describe, it, expect } from 'vitest';
import { Parser } from '../parser';
import { FormulaEngine } from '../engine';
import { parseCellAddress, formatCellAddress, parseRangeAddress, formatRangeAddress } from '../coords';

describe('Formula Coordinates', () => {
  it('should parse and format cell addresses correctly', () => {
    const addr = parseCellAddress('B5');
    expect(addr).toEqual({ sheet: undefined, col: 1, row: 4, colAbsolute: false, rowAbsolute: false });
    expect(formatCellAddress(addr!)).toBe('B5');

    const absAddr = parseCellAddress('$AA$100');
    expect(absAddr?.col).toBe(26);
    expect(absAddr?.row).toBe(99);
    expect(absAddr?.colAbsolute).toBe(true);
    expect(absAddr?.rowAbsolute).toBe(true);
  });

  it('should parse and format range addresses', () => {
    const range = parseRangeAddress('A1:C10');
    expect(range?.start.col).toBe(0);
    expect(range?.start.row).toBe(0);
    expect(range?.end.col).toBe(2);
    expect(range?.end.row).toBe(9);
    expect(formatRangeAddress(range!)).toBe('A1:C10');
  });
});

describe('Formula Parser & AST', () => {
  it('should parse basic arithmetic with operator precedence', () => {
    const ast = Parser.parse('=(2 + 3) * 4');
    expect(ast.type).toBe('BinaryExpression');
  });

  it('should parse function calls and comparisons', () => {
    const ast = Parser.parse('=IF(SUM(A1:A5) > 100, "High", "Low")');
    expect(ast.type).toBe('FunctionCall');
  });
});

describe('Formula Engine Calculations', () => {
  it('should evaluate basic arithmetic and cell referencing', () => {
    const engine = new FormulaEngine();
    engine.setCellValue({ col: 0, row: 0 }, 10);
    engine.setCellValue({ col: 1, row: 0 }, 20);
    engine.setCellValue({ col: 2, row: 0 }, '=A1 + B1 * 2');

    expect(engine.getCellValue({ col: 2, row: 0 })).toBe(50);

    engine.setCellValue({ col: 0, row: 0 }, 30);
    expect(engine.getCellValue({ col: 2, row: 0 })).toBe(70);
  });

  it('should evaluate Math functions: SUM, AVERAGE, MIN, MAX, ROUND, POWER, SQRT', () => {
    const engine = new FormulaEngine();
    engine.setCellValue({ col: 0, row: 0 }, 10);
    engine.setCellValue({ col: 0, row: 1 }, 20);
    engine.setCellValue({ col: 0, row: 2 }, 30);

    engine.setCellValue({ col: 1, row: 0 }, '=SUM(A1:A3)');
    engine.setCellValue({ col: 1, row: 1 }, '=AVERAGE(A1:A3)');
    engine.setCellValue({ col: 1, row: 2 }, '=MAX(A1:A3)');
    engine.setCellValue({ col: 1, row: 3 }, '=MIN(A1:A3)');
    engine.setCellValue({ col: 1, row: 4 }, '=ROUND(3.14159, 2)');
    engine.setCellValue({ col: 1, row: 5 }, '=POWER(2, 3)');
    engine.setCellValue({ col: 1, row: 6 }, '=SQRT(16)');

    expect(engine.getCellValue({ col: 1, row: 0 })).toBe(60);
    expect(engine.getCellValue({ col: 1, row: 1 })).toBe(20);
    expect(engine.getCellValue({ col: 1, row: 2 })).toBe(30);
    expect(engine.getCellValue({ col: 1, row: 3 })).toBe(10);
    expect(engine.getCellValue({ col: 1, row: 4 })).toBe(3.14);
    expect(engine.getCellValue({ col: 1, row: 5 })).toBe(8);
    expect(engine.getCellValue({ col: 1, row: 6 })).toBe(4);
  });

  it('should evaluate Logical functions: IF, AND, OR, NOT, IFERROR', () => {
    const engine = new FormulaEngine();
    engine.setCellValue({ col: 0, row: 0 }, 50);

    engine.setCellValue({ col: 1, row: 0 }, '=IF(A1 > 40, "Pass", "Fail")');
    engine.setCellValue({ col: 1, row: 1 }, '=AND(A1 > 10, A1 < 100)');
    engine.setCellValue({ col: 1, row: 2 }, '=OR(A1 = 50, A1 = 99)');
    engine.setCellValue({ col: 1, row: 3 }, '=NOT(A1 = 50)');
    engine.setCellValue({ col: 1, row: 4 }, '=IFERROR(10 / 0, "Handled")');

    expect(engine.getCellValue({ col: 1, row: 0 })).toBe('Pass');
    expect(engine.getCellValue({ col: 1, row: 1 })).toBe(true);
    expect(engine.getCellValue({ col: 1, row: 2 })).toBe(true);
    expect(engine.getCellValue({ col: 1, row: 3 })).toBe(false);
    expect(engine.getCellValue({ col: 1, row: 4 })).toBe('Handled');
  });

  it('should evaluate Text functions: CONCATENATE, LEFT, RIGHT, MID, UPPER, LOWER, TRIM', () => {
    const engine = new FormulaEngine();
    engine.setCellValue({ col: 0, row: 0 }, '  Openhead Suite  ');

    engine.setCellValue({ col: 1, row: 0 }, '=TRIM(A1)');
    engine.setCellValue({ col: 1, row: 1 }, '=UPPER("openhead")');
    engine.setCellValue({ col: 1, row: 2 }, '=LOWER("OPENHEAD")');
    engine.setCellValue({ col: 1, row: 3 }, '=LEFT("Formula", 4)');
    engine.setCellValue({ col: 1, row: 4 }, '=RIGHT("Formula", 4)');
    engine.setCellValue({ col: 1, row: 5 }, '=MID("Openhead", 5, 4)');
    engine.setCellValue({ col: 1, row: 6 }, '="Hello " & "World"');

    expect(engine.getCellValue({ col: 1, row: 0 })).toBe('Openhead Suite');
    expect(engine.getCellValue({ col: 1, row: 1 })).toBe('OPENHEAD');
    expect(engine.getCellValue({ col: 1, row: 2 })).toBe('openhead');
    expect(engine.getCellValue({ col: 1, row: 3 })).toBe('Form');
    expect(engine.getCellValue({ col: 1, row: 4 })).toBe('mula');
    expect(engine.getCellValue({ col: 1, row: 5 })).toBe('head');
    expect(engine.getCellValue({ col: 1, row: 6 })).toBe('Hello World');
  });

  it('should evaluate Lookup functions: VLOOKUP, INDEX, MATCH, CHOOSE', () => {
    const engine = new FormulaEngine();
    engine.setCellValue({ col: 0, row: 0 }, 101);
    engine.setCellValue({ col: 1, row: 0 }, 'Alice');
    engine.setCellValue({ col: 0, row: 1 }, 102);
    engine.setCellValue({ col: 1, row: 1 }, 'Bob');
    engine.setCellValue({ col: 0, row: 2 }, 103);
    engine.setCellValue({ col: 1, row: 2 }, 'Charlie');

    engine.setCellValue({ col: 2, row: 0 }, '=VLOOKUP(102, A1:B3, 2)');
    engine.setCellValue({ col: 2, row: 1 }, '=INDEX(A1:B3, 3, 2)');
    engine.setCellValue({ col: 2, row: 2 }, '=MATCH(103, A1:A3)');
    engine.setCellValue({ col: 2, row: 3 }, '=CHOOSE(2, "Red", "Green", "Blue")');

    expect(engine.getCellValue({ col: 2, row: 0 })).toBe('Bob');
    expect(engine.getCellValue({ col: 2, row: 1 })).toBe('Charlie');
    expect(engine.getCellValue({ col: 2, row: 2 })).toBe(3);
    expect(engine.getCellValue({ col: 2, row: 3 })).toBe('Green');
  });

  it('should evaluate Statistical functions: COUNT, COUNTA, COUNTIF, SUMIF', () => {
    const engine = new FormulaEngine();
    engine.setCellValue({ col: 0, row: 0 }, 10);
    engine.setCellValue({ col: 0, row: 1 }, 'Test');
    engine.setCellValue({ col: 0, row: 2 }, 20);
    engine.setCellValue({ col: 0, row: 3 }, 10);

    engine.setCellValue({ col: 1, row: 0 }, '=COUNT(A1:A4)');
    engine.setCellValue({ col: 1, row: 1 }, '=COUNTA(A1:A4)');
    engine.setCellValue({ col: 1, row: 2 }, '=COUNTIF(A1:A4, 10)');
    engine.setCellValue({ col: 1, row: 3 }, '=SUMIF(A1:A4, 10)');

    expect(engine.getCellValue({ col: 1, row: 0 })).toBe(3);
    expect(engine.getCellValue({ col: 1, row: 1 })).toBe(4);
    expect(engine.getCellValue({ col: 1, row: 2 })).toBe(2);
    expect(engine.getCellValue({ col: 1, row: 3 })).toBe(20);
  });
});
