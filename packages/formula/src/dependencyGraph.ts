import { CellAddress, ASTNode } from './types';
import { formatCellAddress, getCellsInRange } from './coords';

export class DependencyGraph {
  private dependencies = new Map<string, Set<string>>();
  private dependents = new Map<string, Set<string>>();

  public setDependencies(cell: CellAddress, ast: ASTNode): void {
    const cellKey = formatCellAddress(cell);
    this.clearDependencies(cell);

    const referencedKeys = new Set<string>();
    this.extractReferences(ast, referencedKeys);

    this.dependencies.set(cellKey, referencedKeys);
    for (const refKey of referencedKeys) {
      if (!this.dependents.has(refKey)) {
        this.dependents.set(refKey, new Set());
      }
      this.dependents.get(refKey)!.add(cellKey);
    }
  }

  public clearDependencies(cell: CellAddress): void {
    const cellKey = formatCellAddress(cell);
    const oldDeps = this.dependencies.get(cellKey);
    if (oldDeps) {
      for (const refKey of oldDeps) {
        this.dependents.get(refKey)?.delete(cellKey);
      }
      this.dependencies.delete(cellKey);
    }
  }

  public hasCycle(startCell: CellAddress): boolean {
    const startKey = formatCellAddress(startCell);
    const visited = new Set<string>();
    const recStack = new Set<string>();

    const checkCycle = (currKey: string): boolean => {
      visited.add(currKey);
      recStack.add(currKey);

      const deps = this.dependencies.get(currKey);
      if (deps) {
        for (const depKey of deps) {
          if (!visited.has(depKey) && checkCycle(depKey)) {
            return true;
          } else if (recStack.has(depKey)) {
            return true;
          }
        }
      }

      recStack.delete(currKey);
      return false;
    };

    return checkCycle(startKey);
  }

  public getRecalculationOrder(changedCells: CellAddress[]): string[] {
    const dirtySet = new Set<string>();
    const queue = changedCells.map((c) => formatCellAddress(c));

    for (const key of queue) {
      dirtySet.add(key);
    }

    let head = 0;
    while (head < queue.length) {
      const current = queue[head++];
      const deps = this.dependents.get(current);
      if (deps) {
        for (const dep of deps) {
          if (!dirtySet.has(dep)) {
            dirtySet.add(dep);
            queue.push(dep);
          }
        }
      }
    }

    const visited = new Set<string>();
    const order: string[] = [];

    const visit = (key: string) => {
      if (visited.has(key)) return;
      visited.add(key);

      const deps = this.dependencies.get(key);
      if (deps) {
        for (const dep of deps) {
          if (dirtySet.has(dep)) {
            visit(dep);
          }
        }
      }
      order.push(key);
    };

    for (const key of dirtySet) {
      visit(key);
    }

    return order;
  }

  private extractReferences(node: ASTNode, outKeys: Set<string>): void {
    if (node.type === 'CellReference') {
      outKeys.add(formatCellAddress(node.address));
    } else if (node.type === 'RangeReference') {
      const cells = getCellsInRange(node.range);
      for (const cell of cells) {
        outKeys.add(formatCellAddress(cell));
      }
    } else if (node.type === 'BinaryExpression') {
      this.extractReferences(node.left, outKeys);
      this.extractReferences(node.right, outKeys);
    } else if (node.type === 'UnaryExpression') {
      this.extractReferences(node.argument, outKeys);
    } else if (node.type === 'FunctionCall') {
      for (const arg of node.args) {
        this.extractReferences(arg, outKeys);
      }
    }
  }
}
