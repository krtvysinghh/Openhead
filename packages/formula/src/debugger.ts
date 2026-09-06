import { ASTNode, FormulaValue, CellAddress, CellRangeAddress } from './types';
import { Lexer } from './lexer';
import { Parser } from './parser';
import { Evaluator } from './evaluator';
import { defaultFunctionRegistry } from './functions/registry';
import { formatCellAddress, formatRangeAddress } from './coords';

export interface EvaluationStep {
  stepIndex: number;
  expression: string;
  nodeType: string;
  result: FormulaValue | FormulaValue[][];
  explanation: string;
}

export interface DebuggerReport {
  formula: string;
  tokens: string[];
  ast: ASTNode;
  referencedCells: string[];
  steps: EvaluationStep[];
  finalResult: FormulaValue | FormulaValue[][];
  errorExplanation?: string;
}

export class FormulaDebugger {
  public static trace(
    formula: string,
    cellResolver: (addr: CellAddress) => FormulaValue,
    rangeResolver: (rng: CellRangeAddress) => FormulaValue[][]
  ): DebuggerReport {
    const lexer = new Lexer(formula);
    const tokens = lexer.tokenize();
    const tokenStrings = tokens.map((t) => `${t.type}(${t.value})`);

    const ast = Parser.parse(formula);
    const referencedCells: string[] = [];
    const steps: EvaluationStep[] = [];

    const context = {
      getCellValue: (addr: CellAddress) => {
        const key = formatCellAddress(addr);
        if (!referencedCells.includes(key)) referencedCells.push(key);
        return cellResolver(addr);
      },
      getRangeValues: (rng: CellRangeAddress) => {
        const key = formatRangeAddress(rng);
        if (!referencedCells.includes(key)) referencedCells.push(key);
        return rangeResolver(rng);
      },
    };

    const evaluator = new Evaluator(context, defaultFunctionRegistry);
    let stepCount = 1;

    const traceNode = (node: ASTNode): FormulaValue | FormulaValue[][] => {
      const res = evaluator.evaluate(node);
      steps.push({
        stepIndex: stepCount++,
        expression: node.type,
        nodeType: node.type,
        result: res,
        explanation: `Evaluated ${node.type} yielding: ${JSON.stringify(res)}`,
      });
      return res;
    };

    const finalResult = traceNode(ast);
    let errorExplanation: string | undefined;

    if (typeof finalResult === 'string' && finalResult.startsWith('#')) {
      if (finalResult === '#DIV/0!') errorExplanation = 'Division by zero occurred in one of the mathematical expressions.';
      else if (finalResult === '#VALUE!') errorExplanation = 'A function or operator received an incompatible data type.';
      else if (finalResult === '#REF!') errorExplanation = 'A cell reference or range coordinates point outside valid boundaries.';
      else if (finalResult === '#NAME?') errorExplanation = 'An unrecognized formula function name was specified.';
      else if (finalResult === '#CYCLE!') errorExplanation = 'Circular dependency detected in calculation graph.';
      else if (finalResult === '#SPILL!') errorExplanation = 'Dynamic array spill range collided with existing non-empty cell data.';
      else if (finalResult === '#N/A!') errorExplanation = 'Value or lookup target not available to the formula.';
      else if (finalResult === '#NUM!') errorExplanation = 'Formula contains invalid or out-of-range numeric values.';
      else if (finalResult === '#NULL!') errorExplanation = 'Specified cell intersection did not produce any cells.';
    }

    return {
      formula,
      tokens: tokenStrings,
      ast,
      referencedCells,
      steps,
      finalResult,
      errorExplanation,
    };
  }
}
