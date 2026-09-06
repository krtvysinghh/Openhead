import { ASTNode, CellAddress, FormulaValue, FormulaErrorCode, CellRangeAddress } from './types';
import { formatCellAddress, parseCellAddress } from './coords';
import { Parser } from './parser';
import { DependencyGraph } from './dependencyGraph';
import { Evaluator } from './evaluator';
import { defaultFunctionRegistry, FunctionRegistry } from './functions/registry';

export class FormulaEngine {
  private rawFormulas = new Map<string, string>();
  private parsedAsts = new Map<string, ASTNode>();
  private cellValues = new Map<string, FormulaValue>();
  private spillFootprints = new Map<string, string[]>(); // originKey -> targetKeys[]
  private spillOrigins = new Map<string, string>(); // targetKey -> originKey
  private dependencyGraph = new DependencyGraph();
  private registry: FunctionRegistry;
  private activeSheet?: string;

  constructor(registry: FunctionRegistry = defaultFunctionRegistry) {
    this.registry = registry;
  }

  public setActiveSheet(sheetName: string): void {
    this.activeSheet = sheetName;
  }

  public setCellValue(cell: CellAddress, rawInput: string | number | boolean | null): string[] {
    const key = formatCellAddress(cell);
    const affectedCells: CellAddress[] = [cell];

    // If writing into an existing spill destination, notify parent origin of collision
    if (this.spillOrigins.has(key)) {
      const parentOrigin = this.spillOrigins.get(key)!;
      const parentAddr = parseCellAddress(parentOrigin);
      if (parentAddr) {
        affectedCells.push(parentAddr);
      }
    }

    // Re-attempt any currently blocked SPILL formulas
    for (const [k, val] of this.cellValues.entries()) {
      if (val === FormulaErrorCode.SPILL) {
        const originAddr = parseCellAddress(k);
        if (originAddr) affectedCells.push(originAddr);
      }
    }

    if (rawInput === null || rawInput === '') {
      this.clearSpill(key);
      this.rawFormulas.delete(key);
      this.parsedAsts.delete(key);
      this.cellValues.delete(key);
      this.dependencyGraph.clearDependencies(cell);
      return this.recalculateDependents(affectedCells);
    }

    if (typeof rawInput === 'string' && rawInput.startsWith('=')) {
      this.clearSpill(key);
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
      this.clearSpill(key);
      this.rawFormulas.delete(key);
      this.parsedAsts.delete(key);
      this.dependencyGraph.clearDependencies(cell);
      this.cellValues.set(key, rawInput);
    }

    return this.recalculateDependents(affectedCells);
  }

  public getCellValue(cell: CellAddress): FormulaValue {
    const key = formatCellAddress(cell);
    if (this.cellValues.has(key)) {
      return this.cellValues.get(key) ?? null;
    }
    if (!cell.sheet && this.activeSheet) {
      const prefixed = `${this.activeSheet}!${key}`;
      if (this.cellValues.has(prefixed)) {
        return this.cellValues.get(prefixed) ?? null;
      }
    }
    if (cell.sheet && this.activeSheet && cell.sheet === this.activeSheet) {
      const unprefixed = formatCellAddress({ ...cell, sheet: undefined });
      if (this.cellValues.has(unprefixed)) {
        return this.cellValues.get(unprefixed) ?? null;
      }
    }
    return null;
  }

  public getRawFormula(cell: CellAddress): string | undefined {
    const key = formatCellAddress(cell);
    return this.rawFormulas.get(key);
  }

  public getRangeValues(range: CellRangeAddress): FormulaValue[][] {
    const effectiveSheet = range.sheet || this.activeSheet;
    const rows: FormulaValue[][] = [];
    for (let r = range.start.row; r <= range.end.row; r++) {
      const row: FormulaValue[] = [];
      for (let c = range.start.col; c <= range.end.col; c++) {
        row.push(this.getCellValue({ sheet: effectiveSheet, col: c, row: r }));
      }
      rows.push(row);
    }
    return rows;
  }

  public getSpillInfo(cell: CellAddress): { isOrigin: boolean; isSpill: boolean; origin?: string } {
    const key = formatCellAddress(cell);
    return {
      isOrigin: this.spillFootprints.has(key),
      isSpill: this.spillOrigins.has(key),
      origin: this.spillOrigins.get(key),
    };
  }

  private clearSpill(originKey: string): void {
    const existingSpills = this.spillFootprints.get(originKey);
    if (existingSpills) {
      for (const targetKey of existingSpills) {
        if (targetKey !== originKey) {
          this.cellValues.delete(targetKey);
          this.spillOrigins.delete(targetKey);
        }
      }
      this.spillFootprints.delete(originKey);
    }
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
        this.clearSpill(key);
        const res = evaluator.evaluate(ast);

        if (Array.isArray(res)) {
          const matrix: FormulaValue[][] = Array.isArray(res[0])
            ? (res as FormulaValue[][])
            : (res as unknown as FormulaValue[]).map((v) => [v]);

          const numRows = matrix.length;
          const numCols = matrix[0]?.length ?? 1;
          const originAddr = parseCellAddress(key);

          if (!originAddr || (numRows === 1 && numCols === 1)) {
            this.cellValues.set(key, matrix[0]?.[0] ?? null);
            continue;
          }

          // Check for spill collisions
          let hasCollision = false;
          const targets: { key: string; val: FormulaValue }[] = [];

          for (let r = 0; r < numRows; r++) {
            for (let c = 0; c < numCols; c++) {
              const targetAddr: CellAddress = {
                sheet: originAddr.sheet,
                row: originAddr.row + r,
                col: originAddr.col + c,
              };
              const targetKey = formatCellAddress(targetAddr);
              const val = matrix[r][c] ?? null;

              if (targetKey !== key) {
                if (
                  this.rawFormulas.has(targetKey) ||
                  (this.cellValues.has(targetKey) && !this.spillOrigins.has(targetKey))
                ) {
                  hasCollision = true;
                  break;
                }
              }
              targets.push({ key: targetKey, val });
            }
            if (hasCollision) break;
          }

          if (hasCollision) {
            this.cellValues.set(key, FormulaErrorCode.SPILL);
          } else {
            const spilledKeys: string[] = [];
            for (const { key: targetKey, val } of targets) {
              this.cellValues.set(targetKey, val);
              if (targetKey !== key) {
                this.spillOrigins.set(targetKey, key);
                spilledKeys.push(targetKey);
              }
            }
            if (spilledKeys.length > 0) {
              this.spillFootprints.set(key, spilledKeys);
            }
          }
        } else {
          this.cellValues.set(key, res);
        }
      }
    }

    return order;
  }
}
