export type FormulaValue = number | string | boolean | null;

export enum FormulaErrorCode {
  DIV_ZERO = '#DIV/0!',
  VALUE = '#VALUE!',
  REF = '#REF!',
  NAME = '#NAME?',
  NUM = '#NUM!',
  NA = '#N/A',
  CYCLE = '#CYCLE!',
  ERROR = '#ERROR!',
}

export type CellAddress = {
  sheet?: string;
  col: number; // 0-indexed (0 = A, 1 = B...)
  row: number; // 0-indexed (0 = Row 1, 1 = Row 2...)
  colAbsolute?: boolean;
  rowAbsolute?: boolean;
};

export type CellRangeAddress = {
  sheet?: string;
  start: CellAddress;
  end: CellAddress;
};

export enum TokenType {
  NUMBER = 'NUMBER',
  STRING = 'STRING',
  BOOLEAN = 'BOOLEAN',
  CELL_REF = 'CELL_REF',
  RANGE_REF = 'RANGE_REF',
  IDENTIFIER = 'IDENTIFIER',
  OPERATOR = 'OPERATOR',
  COMMA = 'COMMA',
  COLON = 'COLON',
  LPAREN = 'LPAREN',
  RPAREN = 'RPAREN',
  LBRACKET = 'LBRACKET',
  RBRACKET = 'RBRACKET',
  EOF = 'EOF',
}

export interface Token {
  type: TokenType;
  value: string;
  position: number;
}

export type ASTNode =
  | NumberLiteralNode
  | StringLiteralNode
  | BooleanLiteralNode
  | CellReferenceNode
  | RangeReferenceNode
  | BinaryExpressionNode
  | UnaryExpressionNode
  | FunctionCallNode;

export interface NumberLiteralNode {
  type: 'NumberLiteral';
  value: number;
}

export interface StringLiteralNode {
  type: 'StringLiteral';
  value: string;
}

export interface BooleanLiteralNode {
  type: 'BooleanLiteral';
  value: boolean;
}

export interface CellReferenceNode {
  type: 'CellReference';
  address: CellAddress;
  raw: string;
}

export interface RangeReferenceNode {
  type: 'RangeReference';
  range: CellRangeAddress;
  raw: string;
}

export interface BinaryExpressionNode {
  type: 'BinaryExpression';
  operator: string;
  left: ASTNode;
  right: ASTNode;
}

export interface UnaryExpressionNode {
  type: 'UnaryExpression';
  operator: string;
  argument: ASTNode;
}

export interface FunctionCallNode {
  type: 'FunctionCall';
  name: string;
  args: ASTNode[];
}

export type CellValueGetter = (addr: CellAddress) => FormulaValue;
export type RangeValueGetter = (range: CellRangeAddress) => FormulaValue[][];

export interface FunctionImplementation {
  name: string;
  minArgs: number;
  maxArgs: number;
  execute: (args: (FormulaValue | FormulaValue[][])[], context: EvaluationContext) => FormulaValue;
}

export interface EvaluationContext {
  getCellValue: CellValueGetter;
  getRangeValues: RangeValueGetter;
}
