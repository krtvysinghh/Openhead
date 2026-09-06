import { BaseDocumentMetadata } from '@openhead/core';
import { FormulaValue } from '@openhead/formula';

export interface CellBorders {
  top?: boolean;
  bottom?: boolean;
  left?: boolean;
  right?: boolean;
  color?: string;
  style?: 'thin' | 'medium' | 'thick' | 'dashed';
}

export interface CellStyle {
  bold?: boolean;
  italic?: boolean;
  underline?: boolean;
  align?: 'left' | 'center' | 'right';
  color?: string;
  background?: string;
  fontSize?: number;
  borders?: CellBorders;
}

export type CellFormatType = 'general' | 'number' | 'currency' | 'percent' | 'date' | 'text';

export interface CellFormat {
  type: CellFormatType;
  decimals?: number;
  currencySymbol?: string;
}

export interface CellData {
  raw: string | number | boolean | null;
  value: FormulaValue;
  style?: CellStyle;
  format?: CellFormat;
  note?: string;
  isSpill?: boolean;
  spillOrigin?: string;
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
  freezePanes?: { rows: number; cols: number };
}

export interface WorkbookModel {
  metadata: BaseDocumentMetadata;
  sheets: WorksheetModel[];
  activeSheetId: string;
}
