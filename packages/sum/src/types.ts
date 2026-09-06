import { BaseDocumentMetadata } from '@openhead/core';
import { FormulaValue } from '@openhead/formula';

export interface CellBorderEdge {
  style?: 'thin' | 'medium' | 'thick' | 'dashed' | 'dotted' | 'double';
  color?: string;
}

export interface CellBorders {
  top?: boolean | CellBorderEdge;
  bottom?: boolean | CellBorderEdge;
  left?: boolean | CellBorderEdge;
  right?: boolean | CellBorderEdge;
  diagonal?: boolean | CellBorderEdge;
  color?: string;
  style?: 'thin' | 'medium' | 'thick' | 'dashed' | 'dotted' | 'double';
}

export interface CellAlignment {
  horizontal?: 'left' | 'center' | 'right' | 'justify' | 'general';
  vertical?: 'top' | 'center' | 'bottom';
  wrapText?: boolean;
  textRotation?: number;
  indent?: number;
}

export interface CellStyle {
  fontFamily?: string;
  fontSize?: number;
  bold?: boolean;
  italic?: boolean;
  underline?: boolean;
  strike?: boolean;
  color?: string;
  background?: string;
  patternType?: string;
  patternColor?: string;
  align?: 'left' | 'center' | 'right';
  alignment?: CellAlignment;
  borders?: CellBorders;
  numFmtId?: number;
  customNumFmt?: string;
}

export type CellFormatType = 'general' | 'number' | 'currency' | 'percent' | 'date' | 'time' | 'text' | 'scientific' | 'custom';

export interface CellFormat {
  type: CellFormatType;
  decimals?: number;
  currencySymbol?: string;
  formatString?: string;
}

export interface CellData {
  raw: string | number | boolean | null;
  value: FormulaValue;
  style?: CellStyle;
  format?: CellFormat;
  note?: string;
  isSpill?: boolean;
  spillOrigin?: string;
  isShared?: boolean;
  sharedIndex?: number;
  isArrayFormula?: boolean;
  cachedValue?: FormulaValue;
  isForeignUncalculated?: boolean;
}

export interface DataValidationRule {
  id: string;
  type: 'whole' | 'decimal' | 'list' | 'date' | 'time' | 'textLength' | 'custom';
  operator?: 'between' | 'notBetween' | 'equal' | 'notEqual' | 'greaterThan' | 'lessThan' | 'greaterThanOrEqual' | 'lessThanOrEqual';
  formula1: string;
  formula2?: string;
  allowBlank?: boolean;
  showErrorMessage?: boolean;
  errorTitle?: string;
  errorMessage?: string;
  sqref: string; // e.g. "A1:A10" or "B2"
}

export interface AutoFilterConfig {
  range: string; // e.g. "A1:E50"
  columnFilters?: Record<number, string[]>; // colIndex -> allowed string values
}

export interface DefinedName {
  name: string;
  formula: string; // e.g. "Sheet1!$A$1:$B$10" or "100"
  sheetScopeId?: string; // undefined = workbook scoped
  comment?: string;
}

export interface WorksheetModel {
  id: string;
  name: string;
  rowCount: number;
  colCount: number;
  cells: Record<string, CellData>; // key = "A1", "B2"
  colWidths?: Record<number, number>; // colIndex -> width px
  rowHeights?: Record<number, number>; // rowIndex -> height px
  hidden?: boolean;
  hiddenRows?: number[];
  hiddenCols?: number[];
  freezePanes?: { rows: number; cols: number; topLeftCell?: string };
  mergedRanges?: string[];
  dataValidations?: DataValidationRule[];
  autoFilter?: AutoFilterConfig;
  conditionalFormats?: any[];
}

export interface WorkbookModel {
  metadata: BaseDocumentMetadata;
  sheets: WorksheetModel[];
  activeSheetId: string;
  definedNames?: DefinedName[];
}

