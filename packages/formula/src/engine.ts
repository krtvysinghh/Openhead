import { ASTNode, CellAddress, FormulaValue, FormulaErrorCode, CellRangeAddress } from './types';
import { formatCellAddress } from './coords';
import { Parser } from './parser';
import { DependencyGraph } from './dependencyGraph';
import { Evaluator } from './evaluator';
import { defaultFunctionRegistry, FunctionRegistry } from './functions/registry';

export class FormulaEngine {
  private rawFormulas = new Map<string, string>();
  private parsedAsts = new Map<string, ASTNode>();
  private cellValues = new Map<string, FormulaValue>();
  private dependencyGraph = new DependencyGraph();
  private registry: FunctionRegistry;

  constructor(registry: FunctionRegistry = defaultFunctionRegistry) {
    this.registry = registry;
  }

  public setCellValue(cell: CellAddress, rawInput: string | number | boolean | null): string[] {
    const key = formatCellAddress(cell);

    if (rawInput === null || rawInput === '') {
      this.rawFormulas.delete(key);
      this.parsedAsts.delete(key);
      this.cellValues.delete(key);
      this.dependencyGraph.clearDependencies(cell);
      return this.recalculateDependents([cell]);
    }

    if (typeof rawInput === 'string' && rawInput.startsWith('=')) {
      this.rawFormulas.set(key, rawInput);
      try {
        const ast = Parser.parse(rawInput);
        this.parsedAsts.set(key, ast);
        this.dependencyGraph.setDependencies(cell, ast);
      } catch (err) {
        this.cellValues.set(key, FormulaErrorCode.ERROR);
        return [key];
      }
    } else {
      this.rawFormulas.delete(key);
      this.parsedAsts.delete(key);
      this.dependencyGraph.clearDependencies(cell);
      this.cellValues.set(key, rawInput);
    }

    return this.recalculateDependents([cell]);
  }

  public getCellValue(cell: CellAddress): FormulaValue {
    const key = formatCellAddress(cell);
    return this.cellValues.get(key) ?? null;
  }

  public getRawFormula(cell: CellAddress): string | undefined {
    const key = formatCellAddress(cell);
    return this.rawFormulas.get(key);
  }

  public getRangeValues(range: CellRangeAddress): FormulaValue[][] {
    const rows: FormulaValue[][] = [];
    for (let r = range.start.row; r <= range.end.row; r++) {
      const row: FormulaValue[] = [];
      for (let c = range.start.col; c <= range.end.col; c++) {
        row.push(this.getCellValue({ sheet: range.sheet, col: c, row: r }));
      }
      rows.push(row);
    }
    return rows;
  }

  private recalculateDependents(changedCells: CellAddress[]): string[] {
    const order = this.dependencyGraph.getRecalculationOrder(changedCells);

    const context = {
      getCellValue: (addr: CellAddress) => this.getCellValue(addr),
      getRangeValues: (rng: CellRangeAddress) => this.getRangeValues(rng),
    };
    const evaluator = new Evaluator(context, this.registry);

    for (const key of order) {
      const ast = this.parsedAsts.get(key);
      if (ast) {
        const res = evaluator.evaluate(ast);
        this.cellValues.set(key, Array.isArray(res) ? FormulaErrorCode.VALUE : res);
      }
    }

    return order;
  }
}
